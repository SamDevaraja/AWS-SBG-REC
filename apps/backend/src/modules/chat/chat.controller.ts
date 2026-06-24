import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PgVectorService } from './services/pgvector.service';
import { EmbeddingService } from './services/embedding.service';
import * as fs from 'fs';
import * as path from 'path';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

// DTOs
export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  session_id?: string;

  @IsBoolean()
  @IsOptional()
  force_live?: boolean;
}

export class AddChipRequestDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class ReplyLiveRequestDto {
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SaveToKBRequestDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class AdminReplyRequestDto {
  @IsString()
  @IsNotEmpty()
  reply: string;
}

export class SendCrewMessageDto {
  @IsString()
  @IsNotEmpty()
  chat_id: string;

  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  ciphertext: string;

  @IsString()
  @IsNotEmpty()
  iv: string;

  @IsString()
  @IsOptional()
  timestamp?: string;
}

export class ReadCrewMessagesDto {
  @IsString()
  @IsNotEmpty()
  chat_id: string;

  @IsString()
  @IsNotEmpty()
  sender: string;
}

export class SendGroupMessageDto {
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @IsString()
  @IsNotEmpty()
  senderRole: string;

  @IsString()
  @IsOptional()
  avatarColor?: string;

  @IsString()
  @IsOptional()
  avatarInitials?: string;

  @IsString()
  @IsOptional()
  avatarPhoto?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsArray()
  @IsOptional()
  attachments?: any[];
}

@Controller()
export class ChatController {
  private readonly SIMILARITY_THRESHOLD = 0.90;
  private readonly POLL_TIMEOUT_SECONDS = 300;

  constructor(
    private readonly prisma: PrismaService,
    private readonly vectorService: PgVectorService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  @Get('health')
  async health() {
    const kbCount = await this.vectorService.countKnowledge();
    const memCount = await this.vectorService.countMemory();
    
    // Get live count
    const liveCount = await this.prisma.unhandledQuery.count({
      where: { status: 'live' },
    });

    return {
      status: 'ok',
      similarity_threshold: this.SIMILARITY_THRESHOLD,
      collections: {
        aws_knowledge_base: kbCount,
        conversation_memory: memCount,
      },
      admin_dashboard: {
        live_chats: liveCount,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ── FAQ Chips ──────────────────────────────────────────────────────────────

  @Get('faq-chips')
  async listFaqChips() {
    const chips = await this.prisma.faqChip.findMany({
      orderBy: [
        { orderIdx: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return { chips };
  }

  @Post('admin/faq-chips')
  async createFaqChip(@Body() body: AddChipRequestDto) {
    if (!body.question?.trim() || !body.answer?.trim()) {
      throw new HttpException('Question and answer cannot be empty.', HttpStatus.BAD_REQUEST);
    }
    
    const maxChip = await this.prisma.faqChip.findFirst({
      orderBy: { orderIdx: 'desc' },
    });
    const nextOrder = (maxChip?.orderIdx ?? 0) + 1;

    const chip = await this.prisma.faqChip.create({
      data: {
        question: body.question.trim(),
        answer: body.answer.trim(),
        orderIdx: nextOrder,
      },
    });

    return {
      success: true,
      id: chip.id,
      question: chip.question,
      answer: chip.answer,
    };
  }

  @Delete('admin/faq-chips/:chip_id')
  async deleteFaqChip(@Param('chip_id') chipId: string) {
    try {
      await this.prisma.faqChip.delete({
        where: { id: chipId },
      });
      return { success: true, id: chipId };
    } catch (err) {
      throw new HttpException(`Chip ${chipId} not found.`, HttpStatus.NOT_FOUND);
    }
  }

  @Put('admin/faq-chips/:chip_id')
  async updateFaqChip(@Param('chip_id') chipId: string, @Body() body: AddChipRequestDto) {
    if (!body.question?.trim() || !body.answer?.trim()) {
      throw new HttpException('Question and answer cannot be empty.', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const chip = await this.prisma.faqChip.update({
        where: { id: chipId },
        data: {
          question: body.question.trim(),
          answer: body.answer.trim(),
        },
      });
      return {
        success: true,
        id: chip.id,
        question: chip.question,
        answer: chip.answer,
      };
    } catch (err) {
      throw new HttpException(`Chip ${chipId} not found.`, HttpStatus.NOT_FOUND);
    }
  }

  // ── Chat Flow ──────────────────────────────────────────────────────────────

  @Post('chat')
  async chat(@Body() req: ChatRequestDto) {
    if (!req.message?.trim()) {
      throw new HttpException('Message cannot be empty.', HttpStatus.BAD_REQUEST);
    }

    const sessionId = req.session_id?.trim() || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    if (req.force_live) {
      const query = await this.prisma.unhandledQuery.create({
        data: {
          sessionId,
          message: req.message,
          bestSimilarity: 0.0,
          bestMatchDoc: null,
          status: 'live',
        },
      });

      console.log(`[live-chat] User escalated question '${req.message.substring(0, 60)}' → row #${query.id}`);
      return {
        status: 'unhandled',
        answer: "Your question has been sent to an AWS Club admin. Please wait — they'll reply here shortly!",
        similarity: 0.0,
        session_id: sessionId,
        unhandled_id: query.id,
      };
    }

    // Embed and query knowledge
    const queryVector = await this.embeddingService.embed(req.message);
    const docs = await this.vectorService.queryKnowledge(queryVector, 1);

    let similarity = 0.0;
    let docText = null;
    let docSource = null;

    if (docs.length > 0) {
      const topDoc = docs[0];
      similarity = Math.round((1.0 - topDoc.distance) * 10000) / 10000;
      const meta = topDoc.metadata || {};
      docSource = meta.category || 'knowledge_base';
      if (docSource === 'admin_answer' && meta.answer) {
        docText = meta.answer;
      } else {
        docText = topDoc.text;
      }
    }

    if (similarity >= this.SIMILARITY_THRESHOLD && docText) {
      // Auto-answer from knowledge base
      const timeMs = Date.now();
      const userId = `${sessionId}_u_${timeMs}`;
      const botId = `${sessionId}_b_${timeMs + 1}`;
      
      const nowIso = new Date().toISOString();
      await this.vectorService.storeMemory(userId, req.message, queryVector, sessionId, 'user', nowIso);
      await this.vectorService.storeMemory(botId, docText.substring(0, 500), await this.embeddingService.embed(docText.substring(0, 500)), sessionId, 'assistant', nowIso);

      return {
        status: 'answered',
        answer: docText,
        source: docSource,
        similarity: similarity,
        session_id: sessionId,
      };
    } else {
      // Below threshold -> live chat
      const query = await this.prisma.unhandledQuery.create({
        data: {
          sessionId,
          message: req.message,
          bestSimilarity: similarity,
          bestMatchDoc: docText,
          status: 'live',
        },
      });

      console.log(`[live-chat] '${req.message.substring(0, 60)}' sim=${similarity.toFixed(3)} < ${this.SIMILARITY_THRESHOLD} → row #${query.id}`);
      
      return {
        status: 'unhandled',
        answer: "Your question has been sent to an AWS Club admin. Please wait — they'll reply here shortly!",
        similarity: similarity,
        session_id: sessionId,
        unhandled_id: query.id,
      };
    }
  }

  @Get('chat/poll/:unhandled_id')
  async pollForReply(@Param('unhandled_id') unhandledId: string) {
    const query = await this.prisma.unhandledQuery.findUnique({
      where: { id: unhandledId },
    });

    if (!query) {
      throw new HttpException('Query not found.', HttpStatus.NOT_FOUND);
    }

    if (query.status === 'replied' || query.status === 'resolved') {
      return {
        status: 'replied',
        answer: query.adminReply,
        doc_id: query.adminDocId,
      };
    }

    if (query.status === 'dismissed') {
      return { status: 'dismissed' };
    }

    // Check timeout
    const createdTs = new Date(query.timestamp).getTime();
    const elapsed = (Date.now() - createdTs) / 1000;
    if (elapsed > this.POLL_TIMEOUT_SECONDS) {
      return { status: 'timeout' };
    }

    return { status: 'waiting' };
  }

  // ── Admin Dashboard ────────────────────────────────────────────────────────

  @Get('admin/stats')
  async adminStats() {
    const kbDocs = await this.vectorService.countKnowledge();
    
    const live = await this.prisma.unhandledQuery.count({ where: { status: 'live' } });
    const pending = await this.prisma.unhandledQuery.count({ where: { status: 'pending' } });
    const resolved = await this.prisma.unhandledQuery.count({ where: { status: 'resolved' } });
    const replied = await this.prisma.unhandledQuery.count({ where: { status: 'replied' } });
    const dismissed = await this.prisma.unhandledQuery.count({ where: { status: 'dismissed' } });

    return {
      live,
      pending: pending + live,
      resolved: resolved + replied,
      dismissed,
      kb_docs: kbDocs,
    };
  }

  @Get('admin/unhandled')
  async adminListUnhandled() {
    const queries = await this.prisma.unhandledQuery.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return { total: queries.length, queries };
  }

  @Post('admin/reply-live/:query_id')
  async adminReplyLive(@Param('query_id') queryId: string, @Body() body: ReplyLiveRequestDto) {
    if (!body.answer?.trim()) {
      throw new HttpException('Answer cannot be empty.', HttpStatus.BAD_REQUEST);
    }

    const row = await this.prisma.unhandledQuery.findUnique({
      where: { id: queryId },
    });

    if (!row) {
      throw new HttpException(`Query ${queryId} not found.`, HttpStatus.NOT_FOUND);
    }
    if (row.status !== 'live' && row.status !== 'pending') {
      throw new HttpException(`Query already ${row.status}.`, HttpStatus.CONFLICT);
    }

    const tsMs = Date.now();
    const docId = `admin_${queryId}_${tsMs}`;
    const question = row.message;
    const answer = body.answer.trim();

    // Embed question -> upsert pgvector
    const questionVec = await this.embeddingService.embed(question);
    await this.vectorService.upsertKnowledge(
      docId,
      question,
      questionVec,
      {
        category: 'admin_answer',
        source_query_id: queryId,
        answer: answer,
      }
    );

    // Update in Postgres
    await this.prisma.unhandledQuery.update({
      where: { id: queryId },
      data: {
        status: 'replied',
        adminReply: answer,
        adminDocId: docId,
        resolvedAt: new Date(),
      },
    });

    const totalDocs = await this.vectorService.countKnowledge();
    console.log(`[admin] reply-live #${queryId}: saved doc '${docId}'. KB=${totalDocs} docs.`);

    return {
      success: true,
      doc_id: docId,
      chroma_total_docs: totalDocs,
      message: 'Reply sent. User will see it within 3 seconds.',
    };
  }

  @Post('admin/save-to-kb/:query_id')
  async adminSaveToKB(@Param('query_id') queryId: string, @Body() body: SaveToKBRequestDto) {
    if (!body.question?.trim() || !body.answer?.trim()) {
      throw new HttpException('Question and answer required.', HttpStatus.BAD_REQUEST);
    }

    const tsMs = Date.now();
    const docId = `admin_${queryId}_${tsMs}`;

    const questionVec = await this.embeddingService.embed(body.question.trim());
    await this.vectorService.upsertKnowledge(
      docId,
      body.question.trim(),
      questionVec,
      {
        category: 'admin_answer',
        source_query_id: queryId,
        answer: body.answer.trim(),
      }
    );

    await this.prisma.unhandledQuery.update({
      where: { id: queryId },
      data: {
        status: 'resolved',
        adminReply: body.answer.trim(),
        adminDocId: docId,
        resolvedAt: new Date(),
      },
    });

    const totalDocs = await this.vectorService.countKnowledge();
    return {
      success: true,
      doc_id: docId,
      chroma_total_docs: totalDocs,
      message: `Saved. KB now has ${totalDocs} documents.`,
    };
  }

  @Delete('admin/query/:query_id')
  async adminDismissQuery(@Param('query_id') queryId: string) {
    try {
      await this.prisma.unhandledQuery.update({
        where: { id: queryId },
        data: {
          status: 'dismissed',
          resolvedAt: new Date(),
        },
      });
      return { success: true, id: queryId };
    } catch (err) {
      throw new HttpException(`Query ${queryId} not found.`, HttpStatus.NOT_FOUND);
    }
  }

  @Post('admin/reply/:query_id')
  async adminReplyLegacy(@Param('query_id') queryId: string, @Body() body: AdminReplyRequestDto) {
    await this.prisma.unhandledQuery.update({
      where: { id: queryId },
      data: {
        status: 'dismissed',
        resolvedAt: new Date(),
      },
    });
    return { success: true, id: queryId, reply: body.reply?.trim() };
  }

  // ── Seeding ────────────────────────────────────────────────────────────────

  @Post('seed')
  async seed(@Query('force') force?: string) {
    const forceReload = force === 'true';
    
    // Read seed data from portable local path
    const dataPath = path.join(__dirname, '..', '..', '..', 'knowledge_data.json');
    
    if (!fs.existsSync(dataPath)) {
      throw new HttpException(`knowledge_data.json not found at ${dataPath}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      const documents = JSON.parse(fileData);

      if (!documents || documents.length === 0) {
        return { success: true, documents_loaded: 0, message: 'knowledge_data.json is empty — nothing to load.' };
      }

      if (forceReload) {
        console.log('[loader] Force reload requested — dropping collection...');
        await this.vectorService.dropKnowledgeCollection();
      }

      console.log(`[loader] Embedding and seeding ${documents.length} AWS QA documents...`);

      for (const doc of documents) {
        const text = doc.text;
        const embedding = await this.embeddingService.embed(text);
        const metadata = {
          category: doc.category || 'general',
          tags: (doc.tags || []).join(','),
        };
        await this.vectorService.upsertKnowledge(doc.id, text, embedding, metadata);
      }

      const total = await this.vectorService.countKnowledge();
      console.log(`[loader] Knowledge base now contains ${total} documents.`);

      // Also seed default faq chips in Postgres if empty
      const chipCount = await this.prisma.faqChip.count();
      if (chipCount === 0) {
        const DEFAULT_CHIPS = [
          { question: 'Which AWS certification is best for beginners?', answer: 'The AWS Certified Cloud Practitioner is the best starting point for beginners without prior IT or cloud experience.' },
          { question: 'How should I study for the Cloud Practitioner exam?', answer: 'Use the official AWS Skill Builder courses, read the whitepapers, and take practice exams to familiarize yourself with the question formats.' },
          { question: 'What is the difference between Associate and Pro certs?', answer: 'Associate certs cover fundamentals and implementation, while Professional certs require deep expertise in complex, multi-service architectures and optimization.' },
          { question: 'How long do AWS certifications stay valid?', answer: 'AWS certifications are valid for three (3) years from the date you pass the exam.' },
          { question: 'How can I get free hands-on practice on AWS?', answer: 'You can use the AWS Free Tier, which provides free access to 100+ services for 12 months, or use AWS Skill Builder Cloud Quest.' },
        ];

        for (let i = 0; i < DEFAULT_CHIPS.length; i++) {
          await this.prisma.faqChip.create({
            data: {
              question: DEFAULT_CHIPS[i].question,
              answer: DEFAULT_CHIPS[i].answer,
              orderIdx: i,
            },
          });
        }
        console.log('[loader] Seeded default FAQ chips.');
      }

      return {
        success: true,
        documents_loaded: documents.length,
        message: `Loaded ${documents.length} documents into PostgreSQL via pgvector.`,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('session/:session_id')
  async clearSession(@Param('session_id') sessionId: string) {
    const deletedCount = await this.vectorService.clearSessionMemory(sessionId);
    return { deleted: deletedCount, session_id: sessionId };
  }

  // ── Crew E2EE Chats ────────────────────────────────────────────────────────

  @Get('crew/messages')
  async getCrewMessages(@Query('chat_id') chatId: string) {
    if (!chatId) {
      throw new HttpException('chat_id is required.', HttpStatus.BAD_REQUEST);
    }
    const messages = await this.prisma.crewMessage.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
    });
    return { messages };
  }

  @Post('crew/messages')
  async sendCrewMessage(@Body() body: SendCrewMessageDto) {
    if (!body.chat_id || !body.sender || !body.ciphertext || !body.iv) {
      throw new HttpException('Missing required crew message fields.', HttpStatus.BAD_REQUEST);
    }
    
    const message = await this.prisma.crewMessage.create({
      data: {
        chatId: body.chat_id,
        sender: body.sender,
        ciphertext: body.ciphertext,
        iv: body.iv,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        status: 'delivered',
      },
    });

    return {
      success: true,
      id: message.id,
      chat_id: message.chatId,
      sender: message.sender,
      ciphertext: message.ciphertext,
      iv: message.iv,
      timestamp: message.timestamp.toISOString(),
    };
  }

  @Post('crew/read')
  async readCrewMessages(@Body() body: ReadCrewMessagesDto) {
    if (!body.chat_id || !body.sender) {
      throw new HttpException('chat_id and sender are required.', HttpStatus.BAD_REQUEST);
    }
    const oppositeSender = body.sender === 'core' ? 'crew' : 'core';
    
    const updateResult = await this.prisma.crewMessage.updateMany({
      where: {
        chatId: body.chat_id,
        sender: oppositeSender,
        status: 'delivered',
      },
      data: {
        status: 'read',
      },
    });

    return { success: true, changed: updateResult.count > 0 };
  }

  // ── Group Chat Portal (Stored in PostgreSQL) ───────────────────────────────

  @Get('groupchat')
  async getGroupChatMessages() {
    const messages = await this.prisma.groupChatMessage.findMany({
      orderBy: { timestamp: 'asc' },
      take: 500, // limit to recent 500 messages
    });

    // Format fields for frontend compatibility
    const formatted = messages.map(m => ({
      id: m.id,
      senderName: m.senderName,
      senderRole: m.senderRole,
      avatarColor: m.avatarColor,
      avatarInitials: m.avatarInitials,
      avatarPhoto: m.avatarPhoto,
      text: m.text,
      attachments: m.attachments ? (m.attachments as any[]) : [],
      timestamp: m.timestamp.toISOString(),
    }));

    return { messages: formatted };
  }

  @Post('groupchat')
  async sendGroupChatMessage(@Body() body: SendGroupMessageDto) {
    if (!body.senderName || !body.senderRole || (!body.text?.trim() && (!body.attachments || body.attachments.length === 0))) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    const initials = body.avatarInitials || body.senderName.slice(0, 2).toUpperCase();

    const m = await this.prisma.groupChatMessage.create({
      data: {
        senderName: body.senderName.trim(),
        senderRole: body.senderRole.toLowerCase(),
        avatarColor: body.avatarColor || '#FF9900',
        avatarInitials: initials,
        avatarPhoto: body.avatarPhoto || null,
        text: body.text ? body.text.trim() : '',
        attachments: body.attachments ? (body.attachments as any) : [],
      },
    });

    return {
      success: true,
      message: {
        id: m.id,
        senderName: m.senderName,
        senderRole: m.senderRole,
        avatarColor: m.avatarColor,
        avatarInitials: m.avatarInitials,
        avatarPhoto: m.avatarPhoto,
        text: m.text,
        attachments: m.attachments ? (m.attachments as any[]) : [],
        timestamp: m.timestamp.toISOString(),
      },
    };
  }

  @Delete('groupchat')
  async clearGroupChat() {
    await this.prisma.groupChatMessage.deleteMany();
    return { success: true };
  }
}

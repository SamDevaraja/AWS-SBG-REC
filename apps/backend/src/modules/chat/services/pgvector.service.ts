import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class PgVectorService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
      console.log('[pgvector] Vector extension verified/enabled.');
    } catch (err) {
      console.warn(
        '[pgvector] Could not automatically run CREATE EXTENSION (may require superuser). ' +
        'Please ensure pgvector is enabled manually on your PostgreSQL server:',
        err.message
      );
    }
  }

  async countKnowledge(): Promise<number> {
    return this.prisma.aWSKnowledgeBase.count();
  }

  async countMemory(): Promise<number> {
    return this.prisma.conversationMemory.count();
  }

  async upsertKnowledge(
    docId: string,
    text: string,
    embedding: number[],
    metadata: Record<string, any>
  ): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO aws_knowledge_base (id, text, embedding, metadata)
       VALUES ($1, $2, $3::vector, $4::jsonb)
       ON CONFLICT (id) DO UPDATE SET text = $2, embedding = $3::vector, metadata = $4::jsonb`,
      docId,
      text,
      vectorStr,
      JSON.stringify(metadata)
    );
  }

  async queryKnowledge(
    queryEmbedding: number[],
    nResults: number = 3
  ): Promise<any[]> {
    const count = await this.countKnowledge();
    if (count === 0) {
      return [];
    }

    const vectorStr = `[${queryEmbedding.join(',')}]`;
    const limitVal = Math.min(nResults, count);

    const results = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, text, metadata, (embedding <=> $1::vector) as distance
       FROM aws_knowledge_base
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorStr,
      limitVal
    );

    return results.map(r => ({
      id: r.id,
      text: r.text,
      metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
      distance: Number(r.distance),
    }));
  }

  async storeMemory(
    exchangeId: string,
    text: string,
    embedding: number[],
    sessionId: string,
    role: string,
    timestamp: string
  ): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO conversation_memory (id, text, embedding, session_id, role, timestamp)
       VALUES ($1, $2, $3::vector, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET text = $2, embedding = $3::vector, session_id = $4, role = $5, timestamp = $6`,
      exchangeId,
      text,
      vectorStr,
      sessionId,
      role,
      new Date(timestamp)
    );
  }

  async getRecentMemory(sessionId: string, limit: number = 5): Promise<any[]> {
    const count = await this.countMemory();
    if (count === 0) {
      return [];
    }

    const results = await this.prisma.conversationMemory.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });

    return results.map(r => ({
      text: r.text,
      role: r.role,
      timestamp: r.timestamp.toISOString(),
    }));
  }

  async clearSessionMemory(sessionId: string): Promise<number> {
    const result = await this.prisma.conversationMemory.deleteMany({
      where: { sessionId },
    });
    return result.count;
  }

  async dropKnowledgeCollection(): Promise<void> {
    await this.prisma.aWSKnowledgeBase.deleteMany();
  }
}

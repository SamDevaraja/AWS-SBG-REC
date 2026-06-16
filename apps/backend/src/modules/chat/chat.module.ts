import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma.module';
import { ChatController } from './chat.controller';
import { ChromaService } from './services/chroma.service';
import { EmbeddingService } from './services/embedding.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [ChromaService, EmbeddingService],
  exports: [ChromaService, EmbeddingService],
})
export class ChatModule {}

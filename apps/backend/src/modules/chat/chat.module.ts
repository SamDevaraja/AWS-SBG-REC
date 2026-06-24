import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma.module';
import { ChatController } from './chat.controller';
import { PgVectorService } from './services/pgvector.service';
import { EmbeddingService } from './services/embedding.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [PgVectorService, EmbeddingService],
  exports: [PgVectorService, EmbeddingService],
})
export class ChatModule {}

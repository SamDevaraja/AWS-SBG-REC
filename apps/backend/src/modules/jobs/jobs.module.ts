import { Module } from '@nestjs/common';
import { NEWS_ARTICLE_REPOSITORY } from '../feed/interfaces/news-article.repository.interface';
import { NewsArticleRepository } from '../feed/repositories/news-article.repository';
import { NewsIngestionModule } from '../news-ingestion/news-ingestion.module';
import { PrismaModule } from '@/database/prisma.module';
import { JobsController } from './controllers/jobs.controller';
import { CleanupProcessor } from './processors/cleanup.processor';
import { IngestionProcessor } from './processors/ingestion.processor';
import { JobsQueueModule } from './queues/jobs-queue.module';
import { NewsScheduler } from './schedulers/news.scheduler';

@Module({
  imports: [
    JobsQueueModule,
    NewsIngestionModule,
    PrismaModule,
  ],
  controllers: [JobsController],
  providers: [
    {
      provide: NEWS_ARTICLE_REPOSITORY,
      useClass: NewsArticleRepository,
    },
    IngestionProcessor,
    CleanupProcessor,
    NewsScheduler,
  ],
})
export class JobsModule {}

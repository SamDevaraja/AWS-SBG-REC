import { Module } from '@nestjs/common';
import { IngestionRunRepository } from '../admin/repositories/ingestion-run.repository';
import { ArticleExtractionModule } from '../article-extraction/article-extraction.module';
import { ArticleSummarizationModule } from '../article-summarization/article-summarization.module';
import { FeedCacheModule } from '../feed-cache/feed-cache.module';
import { NewsProvidersModule } from '../news-providers/news-providers.module';
import { PrismaModule } from '@/database/prisma.module';
import { ArticleDeduplicationService } from './deduplication/article-deduplication.service';
import { IngestionOrchestratorService } from './ingestion-orchestrator.service';
import { ArticlePersistenceService } from './persistence/article-persistence.service';
import { CloudPriorityRankingService } from './ranking/cloud-priority-ranking.service';

@Module({
  imports: [
    NewsProvidersModule,
    PrismaModule,
    FeedCacheModule,
    ArticleExtractionModule,
    ArticleSummarizationModule,
  ],
  providers: [
    ArticleDeduplicationService,
    CloudPriorityRankingService,
    ArticlePersistenceService,
    IngestionRunRepository,
    IngestionOrchestratorService,
  ],
  exports: [IngestionOrchestratorService],
})
export class NewsIngestionModule {}

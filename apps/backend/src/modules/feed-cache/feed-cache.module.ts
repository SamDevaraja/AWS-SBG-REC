import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsQueueModule } from '../jobs/queues/jobs-queue.module';
import { PrismaModule } from '@/database/prisma.module';
import { CacheRefreshService } from './services/cache-refresh.service';
import { FeedCacheService } from './services/feed-cache.service';
import { FeedGenerationService } from './services/feed-generation.service';

@Module({
  imports: [PrismaModule, ConfigModule, JobsQueueModule],
  providers: [
    FeedGenerationService,
    FeedCacheService,
    CacheRefreshService,
  ],
  exports: [
    FeedGenerationService,
    FeedCacheService,
    CacheRefreshService,
  ],
})
export class FeedCacheModule {}

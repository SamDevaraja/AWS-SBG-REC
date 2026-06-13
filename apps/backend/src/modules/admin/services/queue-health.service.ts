import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { FeedCacheService } from '../../feed-cache/services/feed-cache.service';
import {
  NEWS_CLEANUP_QUEUE,
  NEWS_INGESTION_QUEUE,
} from '../../jobs/queues/queue.constants';

export interface SingleQueueHealth {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface QueueHealth {
  ingestion: SingleQueueHealth;
  cleanup: SingleQueueHealth;
}

@Injectable()
export class QueueHealthService {
  private readonly logger = new Logger(QueueHealthService.name);

  constructor(
    @InjectQueue(NEWS_INGESTION_QUEUE)
    private readonly newsIngestionQueue: Queue,
    @InjectQueue(NEWS_CLEANUP_QUEUE)
    private readonly newsCleanupQueue: Queue,
  ) {}

  async getQueueHealth(): Promise<QueueHealth> {
    this.logger.log('Queue Health Requested');

    if (FeedCacheService.isRedisOffline) {
      return {
        ingestion: { waiting: 0, active: 0, completed: 0, failed: 0 },
        cleanup: { waiting: 0, active: 0, completed: 0, failed: 0 },
      };
    }

    const [ingestion, cleanup] = await Promise.all([
      this.getSingleQueueHealth(this.newsIngestionQueue),
      this.getSingleQueueHealth(this.newsCleanupQueue),
    ]);

    return {
      ingestion,
      cleanup,
    };
  }

  private async getSingleQueueHealth(
    queue: Queue,
  ): Promise<SingleQueueHealth> {
    const counts = await queue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
    );

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
    };
  }
}

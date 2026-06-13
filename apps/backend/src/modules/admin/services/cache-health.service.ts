import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { FEED_CACHE_KEY } from '../../feed-cache/constants/cache.constants';
import { NEWS_INGESTION_QUEUE } from '../../jobs/queues/queue.constants';

import { FeedCacheService } from '../../feed-cache/services/feed-cache.service';

export interface CacheHealth {
  connected: boolean;
  feedCached: boolean;
  cachedArticles: number;
}

@Injectable()
export class CacheHealthService {
  private readonly logger = new Logger(CacheHealthService.name);

  constructor(
    @InjectQueue(NEWS_INGESTION_QUEUE)
    private readonly newsIngestionQueue: Queue,
  ) {}

  async getCacheHealth(): Promise<CacheHealth> {
    this.logger.log('Cache Health Requested');

    if (FeedCacheService.isRedisOffline) {
      return {
        connected: false,
        feedCached: false,
        cachedArticles: 0,
      };
    }

    try {
      const client = await this.newsIngestionQueue.client;
      const cachedFeed = await client.get(FEED_CACHE_KEY);

      if (!cachedFeed) {
        return {
          connected: true,
          feedCached: false,
          cachedArticles: 0,
        };
      }

      return {
        connected: true,
        feedCached: true,
        cachedArticles: this.countCachedArticles(cachedFeed),
      };
    } catch (error) {
      this.logger.error(
        `Cache health check failed: ${this.formatError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        connected: false,
        feedCached: false,
        cachedArticles: 0,
      };
    }
  }

  private countCachedArticles(cachedFeed: string): number {
    try {
      const parsedFeed = JSON.parse(cachedFeed);

      return Array.isArray(parsedFeed) ? parsedFeed.length : 0;
    } catch {
      return 0;
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}

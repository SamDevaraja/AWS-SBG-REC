import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { NewsCategory } from '@prisma/client';
import { Queue } from 'bullmq';
import { GetFeedResponseDto } from '../../feed/dto/get-feed-response.dto';
import { NEWS_INGESTION_QUEUE } from '../../jobs/queues/queue.constants';
import {
  FEED_CACHE_KEY,
  FEED_CACHE_TTL_SECONDS,
} from '../constants/cache.constants';

@Injectable()
export class FeedCacheService {
  public static isRedisOffline = process.env.PROCESS_REDIS_OFFLINE === 'true';
  private readonly logger = new Logger(FeedCacheService.name);

  constructor(
    @InjectQueue(NEWS_INGESTION_QUEUE)
    private readonly newsIngestionQueue: Queue,
  ) {}

  async getFeed(): Promise<GetFeedResponseDto[] | null> {
    if (FeedCacheService.isRedisOffline) {
      return null;
    }
    try {
      const client = await this.newsIngestionQueue.client;
      const cachedFeed = await client.get(FEED_CACHE_KEY);

      if (!cachedFeed) {
        this.logger.log(`Feed Cache Miss: key=${FEED_CACHE_KEY}`);

        return null;
      }

      const parsedFeed = JSON.parse(cachedFeed);

      if (!Array.isArray(parsedFeed)) {
        throw new Error('Feed cache payload is not an array');
      }

      const feed = parsedFeed.map((article) =>
        this.toFeedArticle(article),
      );

      this.logger.log(
        `Feed Cache Hit: key=${FEED_CACHE_KEY}, count=${feed.length}`,
      );

      return feed;
    } catch (error) {
      this.logger.error(
        `Feed Cache Failure: action=get, key=${FEED_CACHE_KEY}, error=${this.formatError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  async setFeed(feed: GetFeedResponseDto[]): Promise<boolean> {
    if (FeedCacheService.isRedisOffline) {
      return false;
    }
    try {
      const client = await this.newsIngestionQueue.client;

      await client.set(FEED_CACHE_KEY, JSON.stringify(feed), {
        EX: FEED_CACHE_TTL_SECONDS,
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Feed Cache Failure: action=set, key=${FEED_CACHE_KEY}, error=${this.formatError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    }
  }

  async deleteFeed(): Promise<boolean> {
    if (FeedCacheService.isRedisOffline) {
      return false;
    }
    try {
      const client = await this.newsIngestionQueue.client;

      await client.del(FEED_CACHE_KEY);

      return true;
    } catch (error) {
      this.logger.error(
        `Feed Cache Failure: action=delete, key=${FEED_CACHE_KEY}, error=${this.formatError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    }
  }

  private toFeedArticle(article: unknown): GetFeedResponseDto {
    const cachedArticle = article as Record<string, unknown>;

    return {
      id: String(cachedArticle.id),
      title: String(cachedArticle.title),
      aiSummary:
        typeof cachedArticle.aiSummary === 'string'
          ? cachedArticle.aiSummary
          : null,
      imageUrl:
        typeof cachedArticle.imageUrl === 'string'
          ? cachedArticle.imageUrl
          : null,
      sourceName: String(cachedArticle.sourceName),
      category:
        typeof cachedArticle.category === 'string'
          ? (cachedArticle.category as NewsCategory)
          : null,
      publishedAt:
        typeof cachedArticle.publishedAt === 'string'
          ? new Date(cachedArticle.publishedAt)
          : null,
    };
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}

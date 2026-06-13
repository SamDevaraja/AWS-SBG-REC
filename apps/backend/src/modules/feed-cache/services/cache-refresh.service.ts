import { Injectable, Logger } from '@nestjs/common';
import { FeedGenerationService } from './feed-generation.service';
import { FeedCacheService } from './feed-cache.service';

@Injectable()
export class CacheRefreshService {
  private readonly logger = new Logger(CacheRefreshService.name);

  constructor(
    private readonly feedGenerationService: FeedGenerationService,
    private readonly feedCacheService: FeedCacheService,
  ) {}

  async refreshFeedCache(): Promise<number> {
    try {
      const feed = await this.feedGenerationService.generateFeed();
      const cacheUpdated = await this.feedCacheService.setFeed(feed);

     if (!cacheUpdated) {
  this.logger.warn(
    'Feed cache refresh skipped because Redis update failed',
  );

  return 0;
}

      this.logger.log(`Feed Cache Refresh: count=${feed.length}`);

      return feed.length;
    } catch (error) {
  this.logger.error(
    `Feed Cache Failure: action=refresh, error=${this.formatError(error)}`,
    error instanceof Error ? error.stack : undefined,
  );

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

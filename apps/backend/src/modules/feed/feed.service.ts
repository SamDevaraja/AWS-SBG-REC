import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedCacheService } from '../feed-cache/services/feed-cache.service';
import { FeedGenerationService } from '../feed-cache/services/feed-generation.service';
import { FeedDetailResponseDto } from './dto/feed-detail-response.dto';
import { FeedListResponseDto } from './dto/feed-list-response.dto';
import { toFeedDetailResponseDto } from './feed.mapper';
import {
  INewsArticleRepository,
  NEWS_ARTICLE_REPOSITORY,
} from './interfaces/news-article.repository.interface';

@Injectable()
export class FeedService {
  constructor(
    @Inject(NEWS_ARTICLE_REPOSITORY)
    private readonly newsArticleRepository: INewsArticleRepository,
    private readonly feedGenerationService: FeedGenerationService,
    private readonly feedCacheService: FeedCacheService,
  ) {}

  async getLatestFeed(): Promise<FeedListResponseDto> {
    const cachedFeed = await this.feedCacheService.getFeed();

    if (cachedFeed) {
      return {
        items: cachedFeed,
        total: cachedFeed.length,
      };
    }

    const items = await this.feedGenerationService.generateFeed();

    await this.feedCacheService.setFeed(items);

    return {
      items,
      total: items.length,
    };
  }

  async getFeedItemById(id: string): Promise<FeedDetailResponseDto> {
    const article = await this.newsArticleRepository.findById(id);

    if (!article) {
      throw new NotFoundException(`Feed item with id "${id}" not found`);
    }

    return toFeedDetailResponseDto(article);
  }
}

import { Module } from '@nestjs/common';
import { FeedCacheModule } from '../feed-cache/feed-cache.module';
import { NEWS_ARTICLE_REPOSITORY } from './interfaces/news-article.repository.interface';
import { NewsArticleRepository } from './repositories/news-article.repository';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [FeedCacheModule],
  controllers: [FeedController],
  providers: [
    FeedService,
    {
      provide: NEWS_ARTICLE_REPOSITORY,
      useClass: NewsArticleRepository,
    },
  ],
  exports: [FeedService, NEWS_ARTICLE_REPOSITORY],
})
export class FeedModule {}

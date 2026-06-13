import { Module } from '@nestjs/common';
import { NewsAggregationService } from './news-aggregation.service';
import { ArticleRankingService } from './ranking/article-ranking.service';
import { NewsApiProvider } from './newsapi/newsapi.provider';
import { ProviderFactory } from './provider.factory';
import { RssProvider } from './rss/rss.provider';

@Module({
  providers: [
    NewsApiProvider,
    RssProvider,
    ArticleRankingService,
    ProviderFactory,
    NewsAggregationService,
  ],
  exports: [
    NewsApiProvider,
    RssProvider,
    ArticleRankingService,
    ProviderFactory,
    NewsAggregationService,
  ],
})
export class NewsProvidersModule {}

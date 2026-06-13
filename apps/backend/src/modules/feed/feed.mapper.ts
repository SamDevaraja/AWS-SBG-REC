import { FeedDetailResponseDto } from './dto/feed-detail-response.dto';
import { GetFeedResponseDto } from './dto/get-feed-response.dto';
import { NewsArticleEntity } from './entities/news-article.entity';

export function toGetFeedResponseDto(
  article: NewsArticleEntity,
): GetFeedResponseDto {
  return {
    id: article.id,
    title: article.title,
    aiSummary: article.aiSummary,
    imageUrl: article.imageUrl,
    sourceName: article.sourceName,
    category: article.category,
    publishedAt: article.publishedAt,
  };
}

export function toFeedDetailResponseDto(
  article: NewsArticleEntity,
): FeedDetailResponseDto {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    fullContent: article.fullContent,
    aiSummary: article.aiSummary,
    imageUrl: article.imageUrl,
    sourceName: article.sourceName,
    articleUrl: article.articleUrl,
    category: article.category,
    publishedAt: article.publishedAt,
  };
}

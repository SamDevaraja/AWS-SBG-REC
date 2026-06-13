import { NewsArticleEntity } from '../entities/news-article.entity';
import { CreateNewsArticleData } from './create-news-article-data.interface';

export interface INewsArticleRepository {
  findLatest(limit: number): Promise<NewsArticleEntity[]>;
  findById(id: string): Promise<NewsArticleEntity | null>;
  create(data: CreateNewsArticleData): Promise<NewsArticleEntity>;
  bulkCreate(data: CreateNewsArticleData[]): Promise<number>;
  softDelete(id: string): Promise<void>;
  cleanupOldArticles(cutoffDate: Date): Promise<number>;
}

export const NEWS_ARTICLE_REPOSITORY = Symbol('NEWS_ARTICLE_REPOSITORY');

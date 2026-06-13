import { NormalizedArticle } from '../models/normalized-article.interface';

export interface INewsProvider {
  getArticles(): Promise<NormalizedArticle[]>;
}

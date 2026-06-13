import { Injectable } from '@nestjs/common';
import { NormalizedArticle } from '../models/normalized-article.interface';

@Injectable()
export class ArticleRankingService {
  rankArticles(articles: NormalizedArticle[]): NormalizedArticle[] {
    return articles;
  }
}

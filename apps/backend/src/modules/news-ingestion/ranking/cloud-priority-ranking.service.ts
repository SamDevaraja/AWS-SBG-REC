import { Injectable } from '@nestjs/common';
import { NewsCategory } from '@prisma/client';
import { NormalizedArticle } from '../../news-providers/models/normalized-article.interface';

const CLOUD_CATEGORIES: ReadonlySet<NewsCategory> = new Set([
  NewsCategory.AWS,
  NewsCategory.AZURE,
  NewsCategory.GCP,
  NewsCategory.CLOUD,
]);

const CLOUD_PRIORITY_SCORE = 100;
const DEFAULT_PRIORITY_SCORE = 0;

@Injectable()
export class CloudPriorityRankingService {
  rank(articles: NormalizedArticle[]): NormalizedArticle[] {
    return [...articles].sort((a, b) => {
      const scoreDiff = this.getScore(b.category) - this.getScore(a.category);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const aTime = a.publishedAt?.getTime() ?? 0;
      const bTime = b.publishedAt?.getTime() ?? 0;

      return bTime - aTime;
    });
  }

  private getScore(category: NewsCategory | null): number {
    if (category !== null && CLOUD_CATEGORIES.has(category)) {
      return CLOUD_PRIORITY_SCORE;
    }

    return DEFAULT_PRIORITY_SCORE;
  }
}

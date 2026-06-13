import { Injectable } from '@nestjs/common';
import { NormalizedArticle } from '../../news-providers/models/normalized-article.interface';

@Injectable()
export class ArticleDeduplicationService {
  deduplicate(articles: NormalizedArticle[]): NormalizedArticle[] {
    const sorted = [...articles].sort((a, b) => {
      const aTime = a.publishedAt?.getTime() ?? 0;
      const bTime = b.publishedAt?.getTime() ?? 0;

      return bTime - aTime;
    });

    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    const deduplicated: NormalizedArticle[] = [];

    for (const article of sorted) {
      const normalizedUrl = article.articleUrl.toLowerCase();
      const normalizedTitle = article.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim();

      if (seenUrls.has(normalizedUrl) || seenTitles.has(normalizedTitle)) {
        continue;
      }

      seenUrls.add(normalizedUrl);
      seenTitles.add(normalizedTitle);
      deduplicated.push(article);
    }

    return deduplicated;
  }
}

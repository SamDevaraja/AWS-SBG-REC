import { Injectable } from '@nestjs/common';
import { NewsCategory } from '@prisma/client';
import { GetFeedResponseDto } from '../../feed/dto/get-feed-response.dto';
import { FEED_ARTICLE_LIMIT } from '../../feed/feed.constants';
import { PrismaService } from '@/database/prisma.service';

const PRIORITY_CATEGORIES: ReadonlySet<NewsCategory> = new Set([
  NewsCategory.AWS,
  NewsCategory.AZURE,
  NewsCategory.GCP,
  NewsCategory.CLOUD,
]);

const CLOUD_ARTICLE_LIMIT = 10;
const OTHER_ARTICLE_LIMIT = 30;
const FEED_CANDIDATE_LIMIT = 200;

@Injectable()
export class FeedGenerationService {
  constructor(private readonly prisma: PrismaService) {}

  async generateFeed(): Promise<GetFeedResponseDto[]> {
    const articles = await this.prisma.newsArticle.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      take: FEED_CANDIDATE_LIMIT,
    });

    const feedArticles = articles.map((article) => ({
      id: article.id,
      title: article.title,
      aiSummary: article.aiSummary,
      imageUrl: article.imageUrl,
      sourceName: article.sourceName,
      category: article.category,
      publishedAt: article.publishedAt,
    }));

    const cloudArticles = feedArticles.filter((article) =>
      this.isPriorityCategory(article.category),
    );
    const otherArticles = feedArticles.filter(
      (article) => !this.isPriorityCategory(article.category),
    );

    const selectedCloudArticles = cloudArticles.slice(0, CLOUD_ARTICLE_LIMIT);
    const selectedOtherArticles = otherArticles.slice(0, OTHER_ARTICLE_LIMIT);
    const selectedIds = new Set<string>([
      ...selectedCloudArticles.map((article) => article.id),
      ...selectedOtherArticles.map((article) => article.id),
    ]);

    const remainingArticles = feedArticles.filter(
      (article) => !selectedIds.has(article.id),
    );

    const finalFeed = [
      ...selectedCloudArticles,
      ...selectedOtherArticles,
      ...remainingArticles.slice(
        0,
        Math.max(
          FEED_ARTICLE_LIMIT -
            selectedCloudArticles.length -
            selectedOtherArticles.length,
          0,
        ),
      ),
    ]
      .sort((left, right) => {
  const leftPriority =
    this.isPriorityCategory(left.category) ? 1 : 0;

  const rightPriority =
    this.isPriorityCategory(right.category) ? 1 : 0;

  if (leftPriority !== rightPriority) {
    return rightPriority - leftPriority;
  }

  const leftTime = left.publishedAt?.getTime() ?? 0;
  const rightTime = right.publishedAt?.getTime() ?? 0;

  return rightTime - leftTime;
})
      .slice(0, FEED_ARTICLE_LIMIT);

    return finalFeed;
  }

  private isPriorityCategory(category: NewsCategory | null): boolean {
    if (!category) {
      return false;
    }

    return PRIORITY_CATEGORIES.has(category);
  }
}

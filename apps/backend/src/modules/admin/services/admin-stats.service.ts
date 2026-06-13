import { Injectable, Logger } from '@nestjs/common';
import { NewsCategory } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

export interface SystemStats {
  totalArticles: number;
  articlesLast24Hours: number;
  awsArticles: number;
  azureArticles: number;
  gcpArticles: number;
  cloudArticles: number;
  aiSummariesGenerated: number;
  latestIngestionStatus: string | null;
}

@Injectable()
export class AdminStatsService {
  private readonly logger = new Logger(AdminStatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats(): Promise<SystemStats> {
    this.logger.log('Admin Stats Requested');

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalArticles,
      articlesLast24Hours,
      awsArticles,
      azureArticles,
      gcpArticles,
      cloudArticles,
      aiSummariesGenerated,
      latestIngestionRun,
    ] = await Promise.all([
      this.prisma.newsArticle.count({
        where: { isActive: true },
      }),
      this.prisma.newsArticle.count({
        where: {
          isActive: true,
          createdAt: {
            gte: last24Hours,
          },
        },
      }),
      this.countActiveArticlesByCategory(NewsCategory.AWS),
      this.countActiveArticlesByCategory(NewsCategory.AZURE),
      this.countActiveArticlesByCategory(NewsCategory.GCP),
      this.countActiveArticlesByCategory(NewsCategory.CLOUD),
      this.prisma.newsArticle.count({
        where: {
          isActive: true,
          aiSummary: {
            not: null,
          },
        },
      }),
      this.prisma.ingestionRun.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { status: true },
      }),
    ]);

    return {
      totalArticles,
      articlesLast24Hours,
      awsArticles,
      azureArticles,
      gcpArticles,
      cloudArticles,
      aiSummariesGenerated,
      latestIngestionStatus: latestIngestionRun?.status ?? null,
    };
  }

  private countActiveArticlesByCategory(
    category: NewsCategory,
  ): Promise<number> {
    return this.prisma.newsArticle.count({
      where: {
        isActive: true,
        category,
      },
    });
  }
}

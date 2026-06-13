import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { NewsArticleEntity } from '../entities/news-article.entity';
import { CreateNewsArticleData } from '../interfaces/create-news-article-data.interface';
import { INewsArticleRepository } from '../interfaces/news-article.repository.interface';

@Injectable()
export class NewsArticleRepository implements INewsArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatest(limit: number): Promise<NewsArticleEntity[]> {
    const articles = await this.prisma.newsArticle.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return articles.map((article) => this.toEntity(article));
  }

  async findById(id: string): Promise<NewsArticleEntity | null> {
    const article = await this.prisma.newsArticle.findFirst({
      where: { id, isActive: true },
    });

    return article ? this.toEntity(article) : null;
  }

  async create(data: CreateNewsArticleData): Promise<NewsArticleEntity> {
    const article = await this.prisma.newsArticle.create({
      data: this.toCreateInput(data),
    });

    return this.toEntity(article);
  }

  async bulkCreate(data: CreateNewsArticleData[]): Promise<number> {
    if (data.length === 0) {
      return 0;
    }

    const result = await this.prisma.newsArticle.createMany({
      data: data.map((item) => this.toCreateInput(item)),
      skipDuplicates: true,
    });

    return result.count;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.newsArticle.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async cleanupOldArticles(cutoffDate: Date): Promise<number> {
    const result = await this.prisma.newsArticle.deleteMany({
      where: {
        isActive: true,
        publishedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  private toCreateInput(
    data: CreateNewsArticleData,
  ): Prisma.NewsArticleCreateInput {
    return {
      title: data.title,
      description: data.description ?? null,
      fullContent: data.fullContent,
      aiSummary: data.aiSummary ?? null,
      imageUrl: data.imageUrl ?? null,
      sourceName: data.sourceName,
      sourceUrl: data.sourceUrl,
      articleUrl: data.articleUrl,
      category: data.category ?? null,
      publishedAt: data.publishedAt ?? null,
    };
  }

  private toEntity(
    article: Prisma.NewsArticleGetPayload<object>,
  ): NewsArticleEntity {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      fullContent: article.fullContent,
      aiSummary: article.aiSummary,
      imageUrl: article.imageUrl,
      sourceName: article.sourceName,
      sourceUrl: article.sourceUrl,
      articleUrl: article.articleUrl,
      category: article.category,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      isActive: article.isActive,
    };
  }
}

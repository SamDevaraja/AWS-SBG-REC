import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SummarizedArticle } from '../../article-summarization/interfaces/summarized-article.interface';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ArticlePersistenceService {
  private readonly logger = new Logger(ArticlePersistenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async persistArticles(articles: SummarizedArticle[]): Promise<number> {
    if (articles.length === 0) {
      return 0;
    }

    try {
      const existingArticleUrls = await this.findExistingArticleUrls(
        articles,
      );
      const result = await this.prisma.newsArticle.createMany({
        data: articles.map((article) => this.toCreateManyInput(article)),
        skipDuplicates: true,
      });
      const updatedExisting = await this.updateExistingArticleData(
        articles,
        existingArticleUrls,
      );

      this.logger.log(`Persisted ${result.count} new articles`);
      this.logger.log(
        `Updated ${updatedExisting} existing articles with extracted content or AI summaries`,
      );

      return result.count;
    } catch (error) {
      this.logger.error(
        'Failed to persist articles',
        this.formatError(error),
      );

      throw new InternalServerErrorException('Failed to persist articles');
    }
  }

  private toCreateManyInput(
    article: SummarizedArticle,
  ): Prisma.NewsArticleCreateManyInput {
    return {
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
    };
  }

  private async updateExistingArticleData(
    articles: SummarizedArticle[],
    existingArticleUrls: ReadonlySet<string>,
  ): Promise<number> {
    const updates = articles
      .filter((article) => existingArticleUrls.has(article.articleUrl))
      .map((article) => {
        const data: Prisma.NewsArticleUpdateManyMutationInput = {};

        if (article.fullContent) {
          data.fullContent = article.fullContent;
        }

        if (article.aiSummary) {
          data.aiSummary = article.aiSummary;
        }

        if (article.imageUrl) {
          data.imageUrl = article.imageUrl;
        }

        if (Object.keys(data).length === 0) {
          return null;
        }

        return this.prisma.newsArticle.updateMany({
          where: {
            articleUrl: article.articleUrl,
          },
          data,
        });
      })
      .filter((update): update is Prisma.PrismaPromise<Prisma.BatchPayload> =>
        update !== null,
      );

    if (updates.length === 0) {
      return 0;
    }

    const results = await this.prisma.$transaction(updates);

    return results.reduce((total, result) => total + result.count, 0);
  }

  private async findExistingArticleUrls(
    articles: SummarizedArticle[],
  ): Promise<ReadonlySet<string>> {
    const articleUrls = articles.map((article) => article.articleUrl);

    if (articleUrls.length === 0) {
      return new Set<string>();
    }

    const existingArticles = await this.prisma.newsArticle.findMany({
      where: {
        articleUrl: {
          in: articleUrls,
        },
      },
      select: {
        articleUrl: true,
      },
    });

    return new Set(
      existingArticles.map((article) => article.articleUrl),
    );
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}

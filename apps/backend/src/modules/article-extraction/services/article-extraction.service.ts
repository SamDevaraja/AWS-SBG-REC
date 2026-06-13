import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ExtractedArticle } from '../interfaces/extracted-article.interface';
import { HtmlContentExtractorService } from './html-content-extractor.service';
import { NormalizedArticle } from '../../news-providers/models/normalized-article.interface';

const ARTICLE_EXTRACTION_BATCH_SIZE = 5;
const ARTICLE_FETCH_TIMEOUT_MS = 10000;

@Injectable()
export class ArticleExtractionService {
  private readonly logger = new Logger(ArticleExtractionService.name);

  constructor(
    private readonly htmlContentExtractorService: HtmlContentExtractorService,
  ) {}

  async extractArticles(
    articles: NormalizedArticle[],
  ): Promise<ExtractedArticle[]> {
    const startedAt = Date.now();
    const extractedArticles: ExtractedArticle[] = [];
    let successCount = 0;
    let failureCount = 0;

    this.logger.log(
      `Article Extraction Started: count=${articles.length}, batchSize=${ARTICLE_EXTRACTION_BATCH_SIZE}`,
    );

    for (
      let index = 0;
      index < articles.length;
      index += ARTICLE_EXTRACTION_BATCH_SIZE
    ) {
      const batch = articles.slice(
        index,
        index + ARTICLE_EXTRACTION_BATCH_SIZE,
      );
      const batchResults = await Promise.all(
        batch.map((article) => this.extractSingleArticle(article)),
      );

      for (const result of batchResults) {
        extractedArticles.push(result.article);

        if (result.wasSuccessful) {
          successCount += 1;
        } else {
          failureCount += 1;
        }
      }
    }

    const durationMs = Date.now() - startedAt;

    this.logger.log(
      `Article Extraction Completed: count=${articles.length}, successCount=${successCount}, failureCount=${failureCount}, durationMs=${durationMs}`,
    );

    return extractedArticles;
  }

  private async extractSingleArticle(
    article: NormalizedArticle,
  ): Promise<{
    article: ExtractedArticle;
    wasSuccessful: boolean;
  }> {
    const startedAt = Date.now();

    try {
      const response = await axios.get<string>(article.articleUrl, {
        timeout: ARTICLE_FETCH_TIMEOUT_MS,
        responseType: 'text',
      });
      const fullContent = this.htmlContentExtractorService.extractContent(
        response.data,
      );
      const recoveredImageUrl =
        this.htmlContentExtractorService.extractImageUrl(
          response.data,
          article.articleUrl,
        );

      if (fullContent === null) {
        const durationMs = Date.now() - startedAt;

        this.logger.warn(
          `Article Extraction Failed: url=${article.articleUrl}, durationMs=${durationMs}, reason=No readable content extracted`,
        );
      }

      return {
        article: {
          ...article,
          fullContent,
          imageUrl: recoveredImageUrl ?? article.imageUrl,
        },
        wasSuccessful: fullContent !== null,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      this.logger.warn(
        `Article Extraction Failed: url=${article.articleUrl}, durationMs=${durationMs}, reason=${this.formatError(error)}`,
      );

      return {
        article: {
          ...article,
          fullContent: null,
        },
        wasSuccessful: false,
      };
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}

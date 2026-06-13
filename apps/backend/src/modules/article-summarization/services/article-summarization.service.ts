import { Injectable, Logger } from '@nestjs/common';
import { ExtractedArticle } from '../../article-extraction/interfaces/extracted-article.interface';
import { SummarizedArticle } from '../interfaces/summarized-article.interface';
import { BedrockClientService } from './bedrock-client.service';
import { SummaryPromptBuilderService } from './summary-prompt-builder.service';

const BATCH_SIZE = 5;
const MAX_SUMMARY_SOURCE_LENGTH = 8000;

@Injectable()
export class ArticleSummarizationService {
  private readonly logger = new Logger(ArticleSummarizationService.name);

  constructor(
    private readonly bedrockClientService: BedrockClientService,
    private readonly summaryPromptBuilderService: SummaryPromptBuilderService,
  ) {}

  async summarizeArticles(
    articles: ExtractedArticle[],
  ): Promise<SummarizedArticle[]> {
    const startedAt = Date.now();
    const summarizedArticles: SummarizedArticle[] = [];
    let successCount = 0;
    let failureCount = 0;

    this.logger.log(
      `Article Summarization Started: count=${articles.length}`,
    );

    if (!this.bedrockClientService.isConfigured()) {
      this.logger.warn(
        'Article summarization skipped: Bedrock is not configured.',
      );

      return articles.map((article) => ({
        ...article,
        aiSummary: null,
      }));
    }

    for (let index = 0; index < articles.length; index += BATCH_SIZE) {
      const batch = articles.slice(index, index + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((article) => this.summarizeSingleArticle(article)),
      );

      for (const result of batchResults) {
        summarizedArticles.push(result.article);

        if (result.wasSuccessful) {
          successCount += 1;
        } else {
          failureCount += 1;
        }
      }
    }

    const durationMs = Date.now() - startedAt;

    this.logger.log(
      `Article Summarization Completed: count=${articles.length}, successCount=${successCount}, failureCount=${failureCount}, durationMs=${durationMs}`,
    );

    return summarizedArticles;
  }

  private async summarizeSingleArticle(
    article: ExtractedArticle,
  ): Promise<{
    article: SummarizedArticle;
    wasSuccessful: boolean;
  }> {
    const sourceContent =
  article.fullContent?.trim() ||
  article.description?.trim() ||
  null;

    if (!sourceContent) {
      return {
        article: {
          ...article,
          aiSummary: null,
        },
        wasSuccessful: false,
      };
    }

    try {
      const truncatedContent = sourceContent.slice(
        0,
        MAX_SUMMARY_SOURCE_LENGTH,
      );
      const prompt =
        this.summaryPromptBuilderService.buildPrompt(truncatedContent);
      const aiSummary =
        await this.bedrockClientService.invokeClaudeHaiku(prompt);

      return {
        article: {
          ...article,
          aiSummary,
        },
        wasSuccessful: true,
      };
    } catch (error) {
      this.logger.warn(
        `Article Summarization Failed: url=${article.articleUrl}, reason=${this.formatError(error)}`,
      );

      return {
        article: {
          ...article,
          aiSummary: null,
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

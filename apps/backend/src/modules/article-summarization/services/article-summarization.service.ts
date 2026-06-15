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
        'Article summarization falling back to local heuristic summaries: Bedrock is not available or configured.',
      );

      return articles.map((article) => ({
        ...article,
        aiSummary: this.generateFallbackSummary(article),
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
        `Article Summarization Failed: url=${article.articleUrl}, reason=${this.formatError(error)}. Falling back to local summary.`,
      );

      return {
        article: {
          ...article,
          aiSummary: this.generateFallbackSummary(article),
        },
        wasSuccessful: false,
      };
    }
  }

  private generateFallbackSummary(article: ExtractedArticle): string {
    const desc = article.description?.trim();
    if (desc && desc.length >= 80 && desc.length <= 350) {
      return this.cleanText(desc);
    }

    const content = article.fullContent?.trim() || desc || '';
    if (!content) {
      return 'No content available to summarize.';
    }

    const cleanContent = this.cleanText(content);
    // Split text into sentences using simple punctuation check
    const sentences = cleanContent.match(/[^.!?]+[.!?]+(\s|$)/g) || [cleanContent];

    let summary = '';
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if ((summary + ' ' + trimmedSentence).length > 220) {
        if (summary.length < 80) {
          const remaining = 220 - summary.length;
          summary += ' ' + trimmedSentence.slice(0, remaining) + '...';
        }
        break;
      }
      summary = summary ? `${summary} ${trimmedSentence}` : trimmedSentence;
    }

    return summary.trim() || cleanContent.slice(0, 150) + '...';
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .replace(/\s+/g, ' ')   // normalize whitespace
      .trim();
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}

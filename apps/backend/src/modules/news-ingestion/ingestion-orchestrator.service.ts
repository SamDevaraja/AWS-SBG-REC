import { Injectable, Logger } from '@nestjs/common';
import { IngestionRunRepository } from '../admin/repositories/ingestion-run.repository';
import { ArticleExtractionService } from '../article-extraction/services/article-extraction.service';
import { ArticleSummarizationService } from '../article-summarization/services/article-summarization.service';
import { CacheRefreshService } from '../feed-cache/services/cache-refresh.service';
import { NewsAggregationService } from '../news-providers/news-aggregation.service';
import { ArticleDeduplicationService } from './deduplication/article-deduplication.service';
import { IngestionResult } from './interfaces/ingestion-result.interface';
import { ArticlePersistenceService } from './persistence/article-persistence.service';

@Injectable()
export class IngestionOrchestratorService {
  private readonly logger = new Logger(IngestionOrchestratorService.name);

  constructor(
    private readonly newsAggregationService: NewsAggregationService,
    private readonly articleDeduplicationService: ArticleDeduplicationService,
    private readonly articleExtractionService: ArticleExtractionService,
    private readonly articleSummarizationService: ArticleSummarizationService,
    private readonly articlePersistenceService: ArticlePersistenceService,
    private readonly cacheRefreshService: CacheRefreshService,
    private readonly ingestionRunRepository: IngestionRunRepository,
  ) {}

  async runIngestion(): Promise<IngestionResult> {
    const startedAt = new Date();
    const run = await this.ingestionRunRepository.createStartedRun(
      startedAt,
    );
    let fetched = 0;
    let deduplicated = 0;
    let persisted = 0;

    this.logger.log(
      `Ingestion Run Created: runId=${run.id}, startedAt=${startedAt.toISOString()}`,
    );
    this.logger.log('Starting news ingestion pipeline');

    try {
      const fetchedArticles =
        await this.newsAggregationService.getAllArticles();

      fetched = fetchedArticles.length;

      this.logger.log(`Fetched ${fetchedArticles.length} articles`);

      const deduplicatedArticles =
        this.articleDeduplicationService.deduplicate(fetchedArticles);

      deduplicated = deduplicatedArticles.length;

      this.logger.log(
        `Deduplicated to ${deduplicatedArticles.length} articles (removed ${fetchedArticles.length - deduplicatedArticles.length} duplicates)`,
      );

      const duplicatesRemoved =
        fetchedArticles.length - deduplicatedArticles.length;

      const extractedArticles =
        await this.articleExtractionService.extractArticles(
          deduplicatedArticles,
        );

      const summarizedArticles =
        await this.articleSummarizationService.summarizeArticles(
          extractedArticles,
        );

      persisted =
        await this.articlePersistenceService.persistArticles(
          summarizedArticles,
        );

      try {
        await this.cacheRefreshService.refreshFeedCache();
      } catch (error) {
        this.logger.error(
          `Feed cache refresh failed after ingestion: ${this.formatError(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      const alreadyExisting = summarizedArticles.length - persisted;

      const result: IngestionResult = {
        fetched: fetchedArticles.length,
        deduplicated: deduplicatedArticles.length,
        duplicatesRemoved,
        persisted,
        alreadyExisting,
      };

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await this.ingestionRunRepository.markRunSuccess(run.id, {
        completedAt,
        durationMs,
        fetched,
        deduplicated,
        persisted,
      });

      this.logger.log(
        `Ingestion Run Success: runId=${run.id}, durationMs=${durationMs}, fetched=${fetched}, deduplicated=${deduplicated}, persisted=${persisted}`,
      );
      this.logger.log(
        `Ingestion complete: fetched=${result.fetched}, deduplicated=${result.deduplicated}, duplicatesRemoved=${result.duplicatesRemoved}, persisted=${result.persisted}, alreadyExisting=${result.alreadyExisting}`,
      );

      return result;
    } catch (error) {
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await this.ingestionRunRepository.markRunFailed(run.id, {
        completedAt,
        durationMs,
        fetched,
        deduplicated,
        persisted,
        errorMessage: this.formatError(error),
      });

      this.logger.error(
        `Ingestion Run Failed: runId=${run.id}, durationMs=${durationMs}, fetched=${fetched}, deduplicated=${deduplicated}, persisted=${persisted}, error=${this.formatError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}

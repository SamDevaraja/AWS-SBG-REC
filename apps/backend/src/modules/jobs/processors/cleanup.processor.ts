import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  INewsArticleRepository,
  NEWS_ARTICLE_REPOSITORY,
} from '../../feed/interfaces/news-article.repository.interface';
import {
  JobTriggerPayload,
  NEWS_CLEANUP_QUEUE,
} from '../queues/queue.constants';

const FIFTEEN_DAYS_IN_MS = 15 * 24 * 60 * 60 * 1000;

interface CleanupJobResult {
  deleted: number;
  cutoffDate: string;
}

@Processor(NEWS_CLEANUP_QUEUE)
export class CleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(
    @Inject(NEWS_ARTICLE_REPOSITORY)
    private readonly newsArticleRepository: INewsArticleRepository,
  ) {
    super();
  }

  async process(
    job: Job<JobTriggerPayload, CleanupJobResult, string>,
  ): Promise<CleanupJobResult> {
    const startedAt = Date.now();
    const cutoffDate = new Date(Date.now() - FIFTEEN_DAYS_IN_MS);

    this.logger.log(
      `Cleanup Job Started: jobId=${job.id}, source=${job.data.triggeredBy}`,
    );

    try {
      const deleted = await this.newsArticleRepository.cleanupOldArticles(
        cutoffDate,
      );
      const result: CleanupJobResult = {
        deleted,
        cutoffDate: cutoffDate.toISOString(),
      };
      const durationMs = Date.now() - startedAt;

      this.logger.log(
        `Cleanup Job Completed: jobId=${job.id}, durationMs=${durationMs}, result=${JSON.stringify(result)}`,
      );

      return result;
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      this.logger.error(
        `Cleanup Job Failed: jobId=${job.id}, durationMs=${durationMs}, error=${this.formatError(error)}`,
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

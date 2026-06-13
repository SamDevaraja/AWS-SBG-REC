import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IngestionOrchestratorService } from '../../news-ingestion/ingestion-orchestrator.service';
import { IngestionResult } from '../../news-ingestion/interfaces/ingestion-result.interface';
import {
  JobTriggerPayload,
  NEWS_INGESTION_QUEUE,
} from '../queues/queue.constants';

@Processor(NEWS_INGESTION_QUEUE)
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);

  constructor(
    private readonly ingestionOrchestrator: IngestionOrchestratorService,
  ) {
    super();
  }

  async process(
    job: Job<JobTriggerPayload, IngestionResult, string>,
  ): Promise<IngestionResult> {
    const startedAt = Date.now();

    this.logger.log(
      `Ingestion Job Started: jobId=${job.id}, source=${job.data.triggeredBy}`,
    );

    try {
      const result = await this.ingestionOrchestrator.runIngestion();
      const durationMs = Date.now() - startedAt;

      this.logger.log(
        `Ingestion Job Completed: jobId=${job.id}, durationMs=${durationMs}, result=${JSON.stringify(result)}`,
      );

      return result;
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      this.logger.error(
        `Ingestion Job Failed: jobId=${job.id}, durationMs=${durationMs}, error=${this.formatError(error)}`,
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

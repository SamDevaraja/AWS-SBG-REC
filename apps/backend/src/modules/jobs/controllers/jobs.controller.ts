import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Post } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  JobTriggerPayload,
  NEWS_CLEANUP_QUEUE,
  NEWS_INGESTION_QUEUE,
  RUN_NEWS_CLEANUP,
  RUN_NEWS_INGESTION,
} from '../queues/queue.constants';

@Controller('jobs')
export class JobsController {
  constructor(
    @InjectQueue(NEWS_INGESTION_QUEUE)
    private readonly newsIngestionQueue: Queue<JobTriggerPayload>,
    @InjectQueue(NEWS_CLEANUP_QUEUE)
    private readonly newsCleanupQueue: Queue<JobTriggerPayload>,
  ) {}

  @Post('run-ingestion')
  async runIngestion(): Promise<{ message: string }> {
    await this.newsIngestionQueue.add(
  RUN_NEWS_INGESTION,
  {
    triggeredBy: 'manual',
  },
  {
    jobId: `manual-ingestion-${Date.now()}`,
  },
);

    return {
      message: 'Ingestion job queued',
    };
  }

  @Post('run-cleanup')
  async runCleanup(): Promise<{ message: string }> {
    await this.newsCleanupQueue.add(
  RUN_NEWS_CLEANUP,
  {
    triggeredBy: 'manual',
  },
  {
    jobId: `manual-cleanup-${Date.now()}`,
  },
);

    return {
      message: 'Cleanup job queued',
    };
  }
}

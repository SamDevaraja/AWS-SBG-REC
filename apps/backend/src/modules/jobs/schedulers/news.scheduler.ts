import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ENV_KEYS } from '../../config/env.keys';
import * as net from 'net';
import { FeedCacheService } from '../../feed-cache/services/feed-cache.service';
import { IngestionOrchestratorService } from '../../news-ingestion/ingestion-orchestrator.service';
import {
  JobTriggerPayload,
  NEWS_CLEANUP_QUEUE,
  NEWS_CLEANUP_SCHEDULE_PATTERN,
  NEWS_CLEANUP_SCHEDULER_ID,
  NEWS_INGESTION_QUEUE,
  NEWS_INGESTION_SCHEDULE_PATTERN,
  NEWS_INGESTION_SCHEDULER_ID,
  RUN_NEWS_CLEANUP,
  RUN_NEWS_INGESTION,
} from '../queues/queue.constants';

@Injectable()
export class NewsScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(NewsScheduler.name);

  constructor(
    @InjectQueue(NEWS_INGESTION_QUEUE)
    private readonly newsIngestionQueue: Queue<JobTriggerPayload>,
    @InjectQueue(NEWS_CLEANUP_QUEUE)
    private readonly newsCleanupQueue: Queue<JobTriggerPayload>,
    private readonly configService: ConfigService,
    private readonly ingestionOrchestratorService: IngestionOrchestratorService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const isRedisOffline = process.env.PROCESS_REDIS_OFFLINE === 'true';

    if (isRedisOffline) {
      this.logger.warn(
        'Redis is NOT reachable. Skipping recurring news jobs scheduling. Ingestion background tasks will be disabled.',
      );
      FeedCacheService.isRedisOffline = true;

      // Trigger ingestion once immediately on boot in the background (non-blocking)
      this.logger.log('Triggering initial direct news ingestion on boot...');
      this.runDirectIngestion().catch((err) => {
        this.logger.error('Failed to run initial direct news ingestion on boot:', err);
      });
      return;
    }

    try {
      await Promise.all([
        this.newsIngestionQueue.upsertJobScheduler(
          NEWS_INGESTION_SCHEDULER_ID,
          {
            pattern: NEWS_INGESTION_SCHEDULE_PATTERN,
          },
          {
            name: RUN_NEWS_INGESTION,
            data: { triggeredBy: 'scheduler' },
          },
        ),
        this.newsCleanupQueue.upsertJobScheduler(
          NEWS_CLEANUP_SCHEDULER_ID,
          {
            pattern: NEWS_CLEANUP_SCHEDULE_PATTERN,
          },
          {
            name: RUN_NEWS_CLEANUP,
            data: { triggeredBy: 'scheduler' },
          },
        ),
      ]);

      this.logger.log(
        `Registered recurring jobs: ${NEWS_INGESTION_SCHEDULER_ID}, ${NEWS_CLEANUP_SCHEDULER_ID}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to register recurring jobs: ${this.formatError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  // Native cron fallback for when Redis is offline (runs every 6 hours)
  @Cron('0 0 */6 * * *')
  async handleCronFallback() {
    if (FeedCacheService.isRedisOffline) {
      this.logger.log('Redis is offline. Running direct news ingestion cron fallback...');
      await this.runDirectIngestion();
    }
  }

  private async runDirectIngestion(): Promise<void> {
    try {
      this.logger.log('Starting direct tech news ingestion pipeline...');
      const result = await this.ingestionOrchestratorService.runIngestion();
      this.logger.log(
        `Direct ingestion completed successfully: fetched=${result.fetched}, persisted=${result.persisted}`,
      );
    } catch (error) {
      this.logger.error(
        `Direct news ingestion pipeline failed: ${this.formatError(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private isRedisReachable(host: string, port: number, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      const done = (result: boolean) => {
        if (resolved) return;
        resolved = true;
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(timeoutMs);
      socket.once('connect', () => done(true));
      socket.once('timeout', () => done(false));
      socket.once('error', () => done(false));
      socket.connect(port, host);
    });
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}


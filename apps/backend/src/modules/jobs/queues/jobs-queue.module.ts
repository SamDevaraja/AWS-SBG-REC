import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';
import { ENV_KEYS } from '../../config/env.keys';
import { getQueueToken } from '@nestjs/bullmq';
import {
  NEWS_CLEANUP_QUEUE,
  NEWS_INGESTION_QUEUE,
  QUEUE_DEFAULT_JOB_OPTIONS,
} from './queue.constants';

class MockQueue {
  async add(name: string, data: any, opts?: any) {
    return { id: 'mock-job-id' };
  }
  async upsertJobScheduler(id: string, spec: any, job: any) {
    return {};
  }
  async getJobCounts() {
    return { waiting: 0, active: 0, completed: 0, failed: 0 };
  }
  get client() {
    return Promise.resolve({
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
    });
  }
  on() {
    return this;
  }
}

const mockIngestionQueueProvider = {
  provide: getQueueToken(NEWS_INGESTION_QUEUE),
  useValue: new MockQueue(),
};

const mockCleanupQueueProvider = {
  provide: getQueueToken(NEWS_CLEANUP_QUEUE),
  useValue: new MockQueue(),
};

const isRedisOffline = process.env.PROCESS_REDIS_OFFLINE === 'true';

@Module({
  imports: isRedisOffline
    ? []
    : [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            connection: createRedisConnection(configService),
          }),
        }),
        BullModule.registerQueue(
          {
            name: NEWS_INGESTION_QUEUE,
            defaultJobOptions: QUEUE_DEFAULT_JOB_OPTIONS,
          },
          {
            name: NEWS_CLEANUP_QUEUE,
            defaultJobOptions: QUEUE_DEFAULT_JOB_OPTIONS,
          },
        ),
      ],
  providers: isRedisOffline
    ? [mockIngestionQueueProvider, mockCleanupQueueProvider]
    : [],
  exports: isRedisOffline
    ? [mockIngestionQueueProvider, mockCleanupQueueProvider]
    : [BullModule],
})
export class JobsQueueModule {}

function createRedisConnection(configService: ConfigService): RedisOptions {
  const host = configService.get<string>(ENV_KEYS.REDIS_HOST);
  const portValue = configService.get<string>(ENV_KEYS.REDIS_PORT);

  if (!host) {
    throw new Error('REDIS_HOST is not configured');
  }

  if (!portValue) {
    throw new Error('REDIS_PORT is not configured');
  }

  const port = Number(portValue);

  if (Number.isNaN(port)) {
    throw new Error('REDIS_PORT must be a valid number');
  }

  const password = configService.get<string>(ENV_KEYS.REDIS_PASSWORD);

  return {
    host,
    port,
    password: password || undefined,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      // Reconnect slowly
      return 10000;
    },
  };
}

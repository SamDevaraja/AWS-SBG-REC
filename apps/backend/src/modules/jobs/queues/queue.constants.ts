export const NEWS_INGESTION_QUEUE = 'news-ingestion';
export const NEWS_CLEANUP_QUEUE = 'news-cleanup';

export const RUN_NEWS_INGESTION = 'run-news-ingestion';
export const RUN_NEWS_CLEANUP = 'run-news-cleanup';

export const NEWS_INGESTION_SCHEDULER_ID = 'news-ingestion-scheduler';
export const NEWS_CLEANUP_SCHEDULER_ID = 'news-cleanup-scheduler';

export const NEWS_INGESTION_SCHEDULE_PATTERN = '0 */6 * * *';
export const NEWS_CLEANUP_SCHEDULE_PATTERN = '0 0 * * *';

export const QUEUE_DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 60 * 60,
    count: 100,
  },
  removeOnFail: {
    age: 7 * 24 * 60 * 60,
    count: 200,
  },
};

export interface JobTriggerPayload {
  triggeredBy: 'manual' | 'scheduler';
}

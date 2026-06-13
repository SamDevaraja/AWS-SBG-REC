import { Controller, Get } from '@nestjs/common';
import {
  AdminStatsService,
  SystemStats,
} from './services/admin-stats.service';
import {
  CacheHealth,
  CacheHealthService,
} from './services/cache-health.service';
import {
  IngestionStatus,
  IngestionStatusService,
} from './services/ingestion-status.service';
import {
  QueueHealth,
  QueueHealthService,
} from './services/queue-health.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminStatsService: AdminStatsService,
    private readonly ingestionStatusService: IngestionStatusService,
    private readonly cacheHealthService: CacheHealthService,
    private readonly queueHealthService: QueueHealthService,
  ) {}

  @Get('stats')
  getStats(): Promise<SystemStats> {
    return this.adminStatsService.getSystemStats();
  }

  @Get('ingestion-status')
  getIngestionStatus(): Promise<IngestionStatus> {
    return this.ingestionStatusService.getIngestionStatus();
  }

  @Get('cache')
  getCacheHealth(): Promise<CacheHealth> {
    return this.cacheHealthService.getCacheHealth();
  }

  @Get('queues')
  getQueueHealth(): Promise<QueueHealth> {
    return this.queueHealthService.getQueueHealth();
  }
}

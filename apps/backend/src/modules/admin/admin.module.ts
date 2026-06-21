import { Module } from '@nestjs/common';
import { JobsQueueModule } from '../jobs/queues/jobs-queue.module';
import { PrismaModule } from '@/database/prisma.module';
import { AdminController } from './admin.controller';
import { IngestionRunRepository } from './repositories/ingestion-run.repository';
import { AdminStatsService } from './services/admin-stats.service';
import { CacheHealthService } from './services/cache-health.service';
import { IngestionStatusService } from './services/ingestion-status.service';
import { QueueHealthService } from './services/queue-health.service';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, JobsQueueModule],
  controllers: [AdminController],
  providers: [
    AdminStatsService,
    IngestionStatusService,
    QueueHealthService,
    CacheHealthService,
    IngestionRunRepository,
    AdminService,
  ],
})
export class AdminModule {}

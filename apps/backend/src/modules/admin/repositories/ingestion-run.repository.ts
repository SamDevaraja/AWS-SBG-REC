import { Injectable } from '@nestjs/common';
import { IngestionRun } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

interface IngestionRunSuccessData {
  completedAt: Date;
  durationMs: number;
  fetched: number;
  deduplicated: number;
  persisted: number;
}

interface IngestionRunFailedData extends IngestionRunSuccessData {
  errorMessage: string;
}

@Injectable()
export class IngestionRunRepository {
  constructor(private readonly prisma: PrismaService) {}

  createStartedRun(startedAt: Date): Promise<IngestionRun> {
    return this.prisma.ingestionRun.create({
      data: {
        startedAt,
        status: 'RUNNING',
      },
    });
  }

  markRunSuccess(
    id: string,
    data: IngestionRunSuccessData,
  ): Promise<IngestionRun> {
    return this.prisma.ingestionRun.update({
      where: { id },
      data: {
        completedAt: data.completedAt,
        durationMs: data.durationMs,
        fetched: data.fetched,
        deduplicated: data.deduplicated,
        persisted: data.persisted,
        status: 'SUCCESS',
        errorMessage: null,
      },
    });
  }

  markRunFailed(
    id: string,
    data: IngestionRunFailedData,
  ): Promise<IngestionRun> {
    return this.prisma.ingestionRun.update({
      where: { id },
      data: {
        completedAt: data.completedAt,
        durationMs: data.durationMs,
        fetched: data.fetched,
        deduplicated: data.deduplicated,
        persisted: data.persisted,
        status: 'FAILED',
        errorMessage: data.errorMessage,
      },
    });
  }

  findLatestRun(): Promise<IngestionRun | null> {
    return this.prisma.ingestionRun.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  getRecentRuns(limit: number): Promise<IngestionRun[]> {
    return this.prisma.ingestionRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

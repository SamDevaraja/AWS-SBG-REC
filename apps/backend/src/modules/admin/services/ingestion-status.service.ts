import { Injectable } from '@nestjs/common';
import { IngestionRunRepository } from '../repositories/ingestion-run.repository';

export interface IngestionStatus {
  lastRunAt: Date | null;
  durationMs: number | null;
  fetched: number;
  deduplicated: number;
  persisted: number;
  status: string | null;
  errorMessage: string | null;
}

@Injectable()
export class IngestionStatusService {
  constructor(
    private readonly ingestionRunRepository: IngestionRunRepository,
  ) {}

  async getIngestionStatus(): Promise<IngestionStatus> {
    const latestRun = await this.ingestionRunRepository.findLatestRun();

    if (!latestRun) {
      return {
        lastRunAt: null,
        durationMs: null,
        fetched: 0,
        deduplicated: 0,
        persisted: 0,
        status: null,
        errorMessage: null,
      };
    }

    return {
      lastRunAt: latestRun.startedAt,
      durationMs: latestRun.durationMs,
      fetched: latestRun.fetched,
      deduplicated: latestRun.deduplicated,
      persisted: latestRun.persisted,
      status: latestRun.status,
      errorMessage: latestRun.errorMessage,
    };
  }
}

export interface IngestionResult {
  fetched: number;
  deduplicated: number;
  duplicatesRemoved: number;
  persisted: number;
  alreadyExisting: number;
}

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private extractor: any;

  async onModuleInit() {
    // Defer loading model to first embed request to avoid blocking NestJS bootstrap.
    console.log('[embedder] Lazy initialization configured. Model will load on demand.');
  }

  private async getExtractor() {
    if (!this.extractor) {
      console.log('[embedder] Initializing all-MiniLM-L6-v2 model via @huggingface/transformers (lazy load)...');
      const { pipeline } = await Function('return import("@huggingface/transformers")')();
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('[embedder] Model ready.');
    }
    return this.extractor;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data) as number[];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const extractor = await this.getExtractor();
    const results: number[][] = [];
    for (const text of texts) {
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      results.push(Array.from(output.data) as number[]);
    }
    return results;
  }
}

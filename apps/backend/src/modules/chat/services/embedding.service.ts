import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private extractor: any;

  async onModuleInit() {
    try {
      console.log('[embedder] Loading all-MiniLM-L6-v2 model via @huggingface/transformers...');
      const { pipeline } = await Function('return import("@huggingface/transformers")')();
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('[embedder] Model ready.');
    } catch (err) {
      console.error('[embedder] Failed to load embedding model:', err);
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.extractor) {
      throw new Error('Embedding model not initialized');
    }
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data) as number[];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
}

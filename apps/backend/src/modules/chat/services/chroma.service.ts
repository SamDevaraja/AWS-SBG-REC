import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';

const dummyEmbeddingFunction = {
  name: 'dummy',
  generate: async (texts: string[]) => {
    return texts.map(() => []);
  },
};

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: ChromaClient;
  private knowledgeCollection: Collection;
  private memoryCollection: Collection;

  async onModuleInit() {
    try {
      console.log('[chroma] Initializing ChromaClient connecting to http://localhost:8001');
      this.client = new ChromaClient({ host: 'localhost', port: 8001 });
      this.knowledgeCollection = await this.client.getOrCreateCollection({
        name: 'aws_knowledge_base',
        metadata: { 'hnsw:space': 'cosine' },
        embeddingFunction: dummyEmbeddingFunction,
      });
      this.memoryCollection = await this.client.getOrCreateCollection({
        name: 'conversation_memory',
        metadata: { 'hnsw:space': 'cosine' },
        embeddingFunction: dummyEmbeddingFunction,
      });
      console.log('[chroma] Collections ready.');
    } catch (err) {
      console.error('[chroma] Failed to connect to ChromaDB server at http://localhost:8001:', err.message);
    }
  }

  private async ensureCollections() {
    if (!this.client) {
      this.client = new ChromaClient({ host: 'localhost', port: 8001 });
    }
    if (!this.knowledgeCollection) {
      this.knowledgeCollection = await this.client.getOrCreateCollection({
        name: 'aws_knowledge_base',
        metadata: { 'hnsw:space': 'cosine' },
        embeddingFunction: dummyEmbeddingFunction,
      });
    }
    if (!this.memoryCollection) {
      this.memoryCollection = await this.client.getOrCreateCollection({
        name: 'conversation_memory',
        metadata: { 'hnsw:space': 'cosine' },
        embeddingFunction: dummyEmbeddingFunction,
      });
    }
  }

  async countKnowledge(): Promise<number> {
    try {
      await this.ensureCollections();
      return await this.knowledgeCollection.count();
    } catch (err) {
      console.error('[chroma] Error counting knowledge:', err);
      return 0;
    }
  }

  async countMemory(): Promise<number> {
    try {
      await this.ensureCollections();
      return await this.memoryCollection.count();
    } catch (err) {
      return 0;
    }
  }

  async upsertKnowledge(
    docId: string,
    text: string,
    embedding: number[],
    metadata: Record<string, any>
  ): Promise<void> {
    await this.ensureCollections();
    await this.knowledgeCollection.upsert({
      ids: [docId],
      documents: [text],
      embeddings: [embedding],
      metadatas: [metadata],
    });
  }

  async queryKnowledge(
    queryEmbedding: number[],
    nResults: number = 3
  ): Promise<any[]> {
    await this.ensureCollections();
    const count = await this.countKnowledge();
    if (count === 0) {
      return [];
    }
    const actualN = Math.min(nResults, count);
    const results = await this.knowledgeCollection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: actualN,
      include: ['documents', 'metadatas', 'distances'] as any,
    });

    const docs = [];
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        docs.push({
          id: results.ids[0][i],
          text: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances ? results.distances[0][i] : 0,
        });
      }
    }
    return docs;
  }

  async storeMemory(
    exchangeId: string,
    text: string,
    embedding: number[],
    sessionId: string,
    role: string,
    timestamp: string
  ): Promise<void> {
    await this.ensureCollections();
    await this.memoryCollection.upsert({
      ids: [exchangeId],
      documents: [text],
      embeddings: [embedding],
      metadatas: [{
        session_id: sessionId,
        role: role,
        timestamp: timestamp,
      }],
    });
  }

  async getRecentMemory(sessionId: string, limit: number = 5): Promise<any[]> {
    await this.ensureCollections();
    const count = await this.countMemory();
    if (count === 0) {
      return [];
    }
    try {
      const results = await this.memoryCollection.get({
        where: { session_id: sessionId } as any,
        include: ['documents', 'metadatas'] as any,
      });

      const turns = [];
      if (results.documents) {
        for (let i = 0; i < results.documents.length; i++) {
          const meta = results.metadatas[i] || {};
          turns.push({
            text: results.documents[i],
            role: meta.role || 'user',
            timestamp: meta.timestamp || '',
          });
        }
      }

      turns.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
      return turns.slice(-limit);
    } catch (err) {
      return [];
    }
  }

  async clearSessionMemory(sessionId: string): Promise<number> {
    await this.ensureCollections();
    const count = await this.countMemory();
    if (count === 0) {
      return 0;
    }
    try {
      const results = await this.memoryCollection.get({
        where: { session_id: sessionId } as any,
        include: [] as any,
      });
      const ids = results.ids || [];
      if (ids.length > 0) {
        await this.memoryCollection.delete({ ids });
      }
      return ids.length;
    } catch (err) {
      return 0;
    }
  }

  async dropKnowledgeCollection(): Promise<void> {
    await this.ensureCollections();
    try {
      await this.client.deleteCollection({ name: 'aws_knowledge_base' });
    } catch (err) {
      // ignore
    }
    this.knowledgeCollection = await this.client.getOrCreateCollection({
      name: 'aws_knowledge_base',
      metadata: { 'hnsw:space': 'cosine' },
      embeddingFunction: dummyEmbeddingFunction,
    });
  }
}

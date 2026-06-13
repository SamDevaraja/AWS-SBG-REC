import { NewsCategory } from '@prisma/client';

export interface CreateNewsArticleData {
  title: string;
  description?: string | null;
  fullContent: string | null;
  aiSummary?: string | null;
  imageUrl?: string | null;
  sourceName: string;
  sourceUrl: string;
  articleUrl: string;
  category?: NewsCategory | null;
  publishedAt?: Date | null;
}

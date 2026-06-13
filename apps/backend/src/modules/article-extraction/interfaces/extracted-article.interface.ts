import { NewsCategory } from '@prisma/client';

export interface ExtractedArticle {
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceName: string;
  sourceUrl: string;
  articleUrl: string;
  category: NewsCategory | null;
  publishedAt: Date | null;
  fullContent: string | null;
  provider: string;
}

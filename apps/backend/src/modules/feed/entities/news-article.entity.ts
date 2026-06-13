import { NewsCategory } from '@prisma/client';

export class NewsArticleEntity {
  id!: string;
  title!: string;
  description!: string | null;
  fullContent!: string | null;
  aiSummary!: string | null;
  imageUrl!: string | null;
  sourceName!: string;
  sourceUrl!: string;
  articleUrl!: string;
  category!: NewsCategory | null;
  publishedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  isActive!: boolean;
}

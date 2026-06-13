import { NewsCategory } from '@prisma/client';

export class FeedDetailResponseDto {
  id!: string;
  title!: string;
  description!: string | null;
  aiSummary!: string | null;
  fullContent!: string | null;
  imageUrl!: string | null;
  sourceName!: string;
  articleUrl!: string;
  category!: NewsCategory | null;
  publishedAt!: Date | null;
}

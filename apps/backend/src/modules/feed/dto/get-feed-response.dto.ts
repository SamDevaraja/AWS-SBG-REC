import { NewsCategory } from '@prisma/client';

export class GetFeedResponseDto {
  id!: string;
  title!: string;
  aiSummary!: string | null;
  imageUrl!: string | null;
  sourceName!: string;
  category!: NewsCategory | null;
  publishedAt!: Date | null;
}

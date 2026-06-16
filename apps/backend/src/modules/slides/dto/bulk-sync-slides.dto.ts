import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class SlideItemDto {
  @IsString()
  title: string;

  @IsString()
  layoutType: string;

  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bullets?: string[];
}

export class BulkSyncSlidesDto {
  @IsArray()
  slides: SlideItemDto[];
}

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TopicTheme } from '@prisma/client';

export class CreateTopicDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TopicTheme)
  theme?: TopicTheme;
}

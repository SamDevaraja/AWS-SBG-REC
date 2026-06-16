import { IsString, IsOptional, IsEnum, IsNumber, IsInt } from 'class-validator';
import { ModuleLevel } from '@prisma/client';

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  tier: string;

  @IsNumber()
  xpPoints: number;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsOptional()
  @IsEnum(ModuleLevel)
  level?: ModuleLevel;
}

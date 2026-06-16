import { IsString, IsOptional, IsEnum, IsNumber, IsInt } from 'class-validator';
import { ModuleLevel } from '@prisma/client';

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsNumber()
  xpPoints?: number;

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

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  entity: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsOptional()
  oldValues?: Record<string, any>;

  @IsOptional()
  newValues?: Record<string, any>;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

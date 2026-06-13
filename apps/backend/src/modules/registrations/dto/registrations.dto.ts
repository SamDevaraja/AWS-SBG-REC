import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class GetRegistrationsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Event ID' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Filter by registration status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

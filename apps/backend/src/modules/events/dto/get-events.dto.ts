import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, EventMode } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class GetEventsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: EventStatus, description: 'Status filter' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ enum: EventMode, description: 'Mode filter' })
  @IsOptional()
  @IsEnum(EventMode)
  mode?: EventMode;
}

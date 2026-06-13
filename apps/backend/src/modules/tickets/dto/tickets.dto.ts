import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class GetTicketsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Event ID' })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Filter by ticket status' })
  @IsOptional()
  @IsString()
  status?: string;
}

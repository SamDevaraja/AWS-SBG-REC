import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgendaDto {
  @ApiProperty({ description: 'Agenda item title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Speaker name for this agenda item' })
  @IsString()
  @IsOptional()
  speaker?: string;

  @ApiProperty({ description: 'Start time (e.g., "09:00 AM")' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time (e.g., "10:00 AM")' })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

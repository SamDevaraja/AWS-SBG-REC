import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncidentDto {
  @ApiProperty({ description: 'Incident title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Incident description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Incident priority (HIGH, MEDIUM, LOW)' })
  @IsString()
  @IsNotEmpty()
  priority: string;

  @ApiProperty({ description: 'Associated event ID' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: 'Optional attachment URL', required: false })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

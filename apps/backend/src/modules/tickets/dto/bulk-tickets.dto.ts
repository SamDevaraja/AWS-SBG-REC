import { IsOptional, IsString, IsUUID, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateBulkTicketsDto {
  @ApiProperty({ description: 'Event ID to generate tickets for' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiPropertyOptional({ description: 'Selected registration IDs to generate tickets for. If empty, generates for all registrations.', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  registrationIds?: string[];

  @ApiPropertyOptional({ description: 'Whether to send ticket emails/notifications to users', default: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiPropertyOptional({ description: 'Whether to post an event announcement notifying users', default: false })
  @IsOptional()
  @IsBoolean()
  createAnnouncement?: boolean;
}

export class RegenerateBulkTicketsDto {
  @ApiProperty({ description: 'Ticket IDs to regenerate', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  ticketIds: string[];

  @ApiPropertyOptional({ description: 'Whether to send ticket emails/notifications to users', default: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}

import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Event ID' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: 'Announcement title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Announcement message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Announcement type', default: 'UPDATE' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Send email notification', default: false })
  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;
}

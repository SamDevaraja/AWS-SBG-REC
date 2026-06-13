import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventMode, EventStatus, RegistrationFormType } from '@prisma/client';
import { CreateAgendaDto } from './create-agenda.dto';
import { CreateSpeakerDto } from './create-speaker.dto';
import { CreateFormFieldDto } from './create-form-field.dto';

export class CreateEventDto {
  @ApiProperty({ description: 'Organizer user ID' })
  @IsString()
  @IsNotEmpty()
  organizerId: string;

  @ApiProperty({ description: 'Event title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Event category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Full event description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Short description for listings' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Poster image URL or path' })
  @IsString()
  @IsOptional()
  posterImage?: string;

  @ApiPropertyOptional({ description: 'Event venue' })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiPropertyOptional({ enum: EventMode, description: 'Event mode' })
  @IsEnum(EventMode)
  @IsOptional()
  mode?: EventMode;

  @ApiPropertyOptional({ description: 'Maximum capacity', minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Event date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Event time (e.g., "09:00 AM")' })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiPropertyOptional({ description: 'Registration deadline (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  registrationDeadline?: string;

  @ApiPropertyOptional({ enum: EventStatus, description: 'Event status' })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiPropertyOptional({ enum: RegistrationFormType, description: 'Registration form type' })
  @IsEnum(RegistrationFormType)
  @IsOptional()
  registrationFormType?: RegistrationFormType;

  @ApiPropertyOptional({ type: [CreateAgendaDto], description: 'Event agenda items' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAgendaDto)
  agenda?: CreateAgendaDto[];

  @ApiPropertyOptional({ type: [CreateSpeakerDto], description: 'Event speakers' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSpeakerDto)
  speakers?: CreateSpeakerDto[];

  @ApiPropertyOptional({ type: [CreateFormFieldDto], description: 'Registration form fields' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  formFields?: CreateFormFieldDto[];
}

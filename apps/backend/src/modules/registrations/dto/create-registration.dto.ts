import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationAnswerDto } from './registration-answer.dto';

export class CreateRegistrationDto {
  @ApiProperty({ description: 'User ID registering' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Event ID to register for' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: 'Attendee Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Attendee Roll Number' })
  @IsString()
  @IsNotEmpty()
  roll_number: string;

  @ApiProperty({ description: 'Attendee Email' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._%+-]+@rajalakshmi\.edu\.in$/, {
    message: 'Email must be a valid @rajalakshmi.edu.in address',
  })
  email: string;

  @ApiProperty({ description: 'Attendee Department' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiPropertyOptional({
    type: [RegistrationAnswerDto],
    description: 'Form field answers',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RegistrationAnswerDto)
  answers?: RegistrationAnswerDto[];
}

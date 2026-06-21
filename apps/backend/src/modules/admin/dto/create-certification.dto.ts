import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Exam code is required' })
  examCode: string;

  @IsString()
  @IsOptional()
  badgeImageUrl?: string;

  @IsString()
  @IsNotEmpty({ message: 'Exam duration is required' })
  examDuration: string;

  @IsNumber({}, { message: 'Total questions must be a number' })
  @IsPositive({ message: 'Total questions must be a positive number' })
  totalQuestions: number;

  @IsNumber({}, { message: 'Exam cost must be a number' })
  @Min(0, { message: 'Exam cost cannot be negative' })
  examCost: number;

  @IsString()
  @IsNotEmpty({ message: 'Exam mode is required' })
  examMode: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  displayOrder: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID('4', { message: 'Level ID must be a valid UUID' })
  levelId: string;
}

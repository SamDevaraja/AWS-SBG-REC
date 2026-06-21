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

export class UpdateCertificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty({ message: 'Exam code is required' })
  @IsOptional()
  examCode?: string;

  @IsString()
  @IsOptional()
  badgeImageUrl?: string;

  @IsString()
  @IsNotEmpty({ message: 'Exam duration is required' })
  @IsOptional()
  examDuration?: string;

  @IsNumber({}, { message: 'Total questions must be a number' })
  @IsPositive({ message: 'Total questions must be a positive number' })
  @IsOptional()
  totalQuestions?: number;

  @IsNumber({}, { message: 'Exam cost must be a number' })
  @Min(0, { message: 'Exam cost cannot be negative' })
  @IsOptional()
  examCost?: number;

  @IsString()
  @IsNotEmpty({ message: 'Exam mode is required' })
  @IsOptional()
  examMode?: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID('4', { message: 'Level ID must be a valid UUID' })
  @IsOptional()
  levelId?: string;
}

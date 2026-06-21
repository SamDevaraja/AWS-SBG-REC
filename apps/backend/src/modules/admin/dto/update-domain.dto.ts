import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, IsOptional } from 'class-validator';

export class UpdateDomainDto {
  @IsString()
  @IsNotEmpty({ message: 'Domain name is required' })
  @IsOptional()
  name?: string;

  @IsNumber({}, { message: 'Weightage must be a number' })
  @Min(0, { message: 'Weightage cannot be negative' })
  @IsOptional()
  weightage?: number;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  @IsOptional()
  displayOrder?: number;
}

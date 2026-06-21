import { IsString, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty({ message: 'Domain name is required' })
  name: string;

  @IsNumber({}, { message: 'Weightage must be a number' })
  @Min(0, { message: 'Weightage cannot be negative' })
  weightage: number;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  displayOrder: number;
}

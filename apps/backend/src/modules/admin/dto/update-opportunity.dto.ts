import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class UpdateOpportunityDto {
  @IsString()
  @IsNotEmpty({ message: 'Opportunity title is required' })
  @IsOptional()
  title?: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  @IsOptional()
  displayOrder?: number;
}

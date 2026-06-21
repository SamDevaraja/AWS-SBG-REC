import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty({ message: 'Opportunity title is required' })
  title: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  displayOrder: number;
}

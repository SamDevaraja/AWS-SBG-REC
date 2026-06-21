import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class UpdateTopicDto {
  @IsString()
  @IsNotEmpty({ message: 'Topic name is required' })
  @IsOptional()
  name?: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  @IsOptional()
  displayOrder?: number;
}

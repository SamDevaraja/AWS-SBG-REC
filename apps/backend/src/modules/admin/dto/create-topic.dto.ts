import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty({ message: 'Topic name is required' })
  name: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  @IsPositive({ message: 'Display order must be a positive number' })
  displayOrder: number;
}

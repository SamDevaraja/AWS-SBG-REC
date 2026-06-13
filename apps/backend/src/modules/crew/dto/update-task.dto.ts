import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({ description: 'Task status (PENDING, IN_PROGRESS, COMPLETED)' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status: string;
}

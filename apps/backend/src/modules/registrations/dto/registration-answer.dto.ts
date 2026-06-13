import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationAnswerDto {
  @ApiProperty({ description: 'Form field ID' })
  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @ApiProperty({ description: 'Answer value' })
  @IsNotEmpty()
  value: string | number | boolean | string[];
}

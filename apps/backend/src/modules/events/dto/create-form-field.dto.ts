import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldType } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';

export class CreateFormFieldDto {
  @ApiProperty({ description: 'Field label' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: FieldType, description: 'Field type' })
  @IsEnum(FieldType)
  @IsNotEmpty()
  type: FieldType;

  @ApiPropertyOptional({ description: 'Whether the field is required', default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Field display order' })
  @IsInt()
  @IsOptional()
  fieldOrder?: number;

  @ApiPropertyOptional({
    description: 'Options for dropdown/radio/checkbox fields',
    example: [{ label: 'Option 1', value: 'option1' }],
  })
  @IsOptional()
  options?: InputJsonValue;
}

import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  VOLUNTEER = 'VOLUNTEER',
  SCANNER = 'SCANNER',
}

export class CreateRoleDto {
  @ApiProperty({ enum: RoleName, description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of permission strings' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];
}

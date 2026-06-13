import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@rajalakshmi.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._%+-]+@rajalakshmi\.edu\.in$/, {
    message: 'Email must be a valid @rajalakshmi.edu.in address',
  })
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of role IDs to assign' })
  @IsArray()
  @IsOptional()
  roleIds?: string[];
}

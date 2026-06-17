import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeakerDto {
  @ApiProperty({ description: 'Speaker name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Speaker role or title' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ description: 'Speaker organization' })
  @IsString()
  @IsOptional()
  organization?: string;

  @ApiPropertyOptional({ description: 'Speaker biography' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Path to speaker photo' })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiPropertyOptional({ description: 'Speaker LinkedIn URL' })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;
}

import { IsOptional, IsString, MinLength } from 'class-validator';

export class LeaderboardQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}

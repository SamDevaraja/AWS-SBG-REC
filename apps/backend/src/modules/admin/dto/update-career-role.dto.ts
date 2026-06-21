import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCareerRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @IsOptional()
  description?: string;
}

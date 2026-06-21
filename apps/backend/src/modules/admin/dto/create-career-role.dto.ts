import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCareerRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}

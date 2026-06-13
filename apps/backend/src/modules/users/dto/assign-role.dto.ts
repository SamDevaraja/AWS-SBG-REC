import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'Role ID to assign to the user' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

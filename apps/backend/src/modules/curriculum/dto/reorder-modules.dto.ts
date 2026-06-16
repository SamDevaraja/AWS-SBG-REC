import { IsArray, IsString } from 'class-validator';

export class ReorderModulesDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

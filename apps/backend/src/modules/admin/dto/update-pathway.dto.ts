import { IsArray, IsUUID, ArrayMinSize, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

function NoDuplicates(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'noDuplicates',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? { message: 'Duplicate certification IDs are not allowed' },
      validator: {
        validate(value: unknown[], _args: ValidationArguments) {
          return Array.isArray(value) && new Set(value).size === value.length;
        },
      },
    });
  };
}

export class UpdatePathwayDto {
  @IsArray({ message: 'certificationIds must be an array' })
  @ArrayMinSize(1, { message: 'Pathway must contain at least one certification' })
  @IsUUID('4', { each: true, message: 'Each certification ID must be a valid UUID' })
  @NoDuplicates()
  certificationIds: string[];
}

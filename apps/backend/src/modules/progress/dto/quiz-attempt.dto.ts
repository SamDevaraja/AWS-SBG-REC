import { IsArray, IsIn, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerItemDto {
  @IsNumber()
  questionOrder: number;

  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  selectedAnswer: string;
}

export class QuizAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerItemDto)
  answers: QuizAnswerItemDto[];
}

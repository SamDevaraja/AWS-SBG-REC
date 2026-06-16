import { IsString, IsInt, IsArray } from 'class-validator';

export class QuestionItemDto {
  @IsString()
  question: string;

  @IsString()
  optionA: string;

  @IsString()
  optionB: string;

  @IsString()
  optionC: string;

  @IsString()
  optionD: string;

  @IsString()
  correctAnswer: string;

  @IsString()
  explanation: string;

  @IsInt()
  orderIndex: number;
}

export class BulkSyncQuestionsDto {
  @IsArray()
  questions: QuestionItemDto[];
}

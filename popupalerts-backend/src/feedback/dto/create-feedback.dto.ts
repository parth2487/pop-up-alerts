import { IsIn, IsNotEmpty, IsString } from 'class-validator';
export class CreateFeedbackDto {
  @IsString() @IsNotEmpty() @IsIn(['happy', 'neutral', 'sad','fire','shit','star','rocket','cool'])
  response: string;
}

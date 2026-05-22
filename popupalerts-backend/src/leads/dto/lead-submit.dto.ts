import { IsNotEmpty, IsObject } from 'class-validator';

export class LeadSubmitDto {
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}




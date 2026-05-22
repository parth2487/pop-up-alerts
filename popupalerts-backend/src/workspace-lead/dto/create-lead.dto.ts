import { IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  domain: string;
}

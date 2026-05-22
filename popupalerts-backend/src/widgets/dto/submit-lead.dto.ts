import { IsEmail, IsNotEmpty, IsObject } from 'class-validator';

export class SubmitLeadDto {
  @IsObject()
  @IsNotEmpty()
  data: {
    email: string;
    [key: string]: any; // Izinkan field lain jika ada
  };
}

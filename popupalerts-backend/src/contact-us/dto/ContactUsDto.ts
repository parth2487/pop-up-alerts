import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ContactUsDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  requirementType: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  businessName!: string;

  @IsIn(['RESTAURANT', 'CLOTHING'])
  businessType!: 'RESTAURANT' | 'CLOTHING';
}


export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

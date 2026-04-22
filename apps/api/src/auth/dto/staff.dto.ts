import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsString()
  @Length(4, 4)
  pin?: string;
}

export class LoginPinDto {
  @IsString()
  @Length(4, 4)
  pin!: string;
}

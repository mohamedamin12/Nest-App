import { IsString, IsNotEmpty, MinLength, IsEmail, MaxLength } from 'class-validator';

export class LoginUserDto{
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password:string;
  
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email:string;
}
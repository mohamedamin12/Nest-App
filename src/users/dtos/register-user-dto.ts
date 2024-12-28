import { IsString, IsOptional, Length,  IsNotEmpty, MinLength, IsEmail, MaxLength } from 'class-validator';

export class RegisterUserDto{
  @IsString()
  @IsOptional()
  @Length(2 , 150)
  username:string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password:string;
  
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email:string;
}
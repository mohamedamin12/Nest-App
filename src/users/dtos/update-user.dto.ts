import { IsString, IsOptional, Length,   MinLength } from 'class-validator';

export class UpdateUserDto{
  @IsString()
  @IsOptional()
  @Length(2 , 150)
  username?:string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?:string;

}
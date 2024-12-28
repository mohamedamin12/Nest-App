import { IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2 , 150)
  title:string
  @IsString()
  description:string
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price:number
} 
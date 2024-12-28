import { IsOptional, IsNumber, IsString, Max, Min, MinLength } from "class-validator";

export class UpdateReviewDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  @MinLength(2)
  comment?: string
}
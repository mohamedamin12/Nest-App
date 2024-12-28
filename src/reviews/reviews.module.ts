import { Module } from "@nestjs/common";
import { ReviewsController } from "./reviews.controller";
import { ReviewsServices } from "./reviews.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./reviews.entity";
import { ProductsModule } from "src/products/products.module";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [ReviewsController],
  providers:[ReviewsServices],
  imports:[TypeOrmModule.forFeature([Review]) , ProductsModule , UsersModule , JwtModule]
})
export class ReviewsModule{}
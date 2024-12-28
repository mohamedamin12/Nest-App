import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from "./products.entity";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
  imports:[TypeOrmModule.forFeature([Product]) , UsersModule , JwtModule]
})
export class ProductsModule{}
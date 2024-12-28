import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { AuthRolesGuard } from 'src/users/guards/auth.roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserType } from 'src/utils/enum';
import { GetMeUser } from 'src/users/decorators/get-me.decorator';
import { JwtPayloadType } from 'src/utils/types';

@Controller('api/products')
export class ProductsController {
  constructor(public productService: ProductsService) {}
  @Get()
  getAllProducts(
    @Query('title') title: string,
    @Query('maxPrice') maxPrice: string,
    @Query('minPrice') minPrice: string,
  ) {
    return this.productService.getAll(title , minPrice , maxPrice); ;
  }

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  addProduct(
    @Body() body: CreateProductDto,
    @GetMeUser() payload: JwtPayloadType,
  ) {
    return this.productService.create(body, payload.id);
  }

  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getById(id);
  }

  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}

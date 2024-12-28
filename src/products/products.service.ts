import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Between, Like, Repository } from 'typeorm';
import { Product } from './products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersServices } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly usersServices: UsersServices,
  ) {}

  /**
   * Get all products
   * @returns collection of products
   */
  getAll(title?: string , minPrice?: string, maxPrice?: string) {
    const filters = {
      ...(title ? {title: Like(`%${title.toLowerCase()}%`)} : {}),
      ...(minPrice && maxPrice ? {price : Between(parseInt(minPrice), parseInt(maxPrice))} : {} ) 
    }
    return this.productRepository.find({where: filters});
  }

  /**
   * Create a new product
   * @param dto data for creating new product
   * @param userId id of the logged in user
   * @returns the created product from the database
   */
  async create(dto: CreateProductDto, userId: number) {
    const user = await this.usersServices.getMe(userId);
    const product = this.productRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user,
    });
    await this.productRepository.save(product);
    return product;
  }

  /**
   * Get a product by id
   * @param id id of the product
   * @returns  product from database
   */
  async getById(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product id : ${id} not found`);
    return product;
  }

  /**
   * Update a product
   * @param id id of the product
   * @param dto  data to update the product
   * @returns  the updated product
   */
  async update(id: number, dto: UpdateProductDto) {
    const product = await this.getById(id);

    product.title = dto.title ?? product.title;
    product.description = dto.description ?? product.description;
    product.price = dto.price ?? product.price;

    await this.productRepository.save(product);
    return product;
  }

  /**
   * Delete a product by id
   * @param id id of the product
   * @returns  success message
   */
  async delete(id: number) {
    const product = await this.getById(id);
    await this.productRepository.remove(product);
    return { message: `Product with id: ${id} has been deleted` };
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './reviews.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersServices } from 'src/users/users.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-reviwe.dto';
import { JwtPayloadType } from 'src/utils/types';
import { UserType } from 'src/utils/enum';

@Injectable()
export class ReviewsServices {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersServices: UsersServices,
  ) {}
  
  /**
   * Create a new review
   * @param productId id of the product
   * @param userId id of the user to create the review
   * @param dto data for the created review
   * @returns the review created from the database
   */
  async create(productId: number, userId: number, dto: CreateReviewDto) {
    const product = await this.productsService.getById(productId);
    const user = await this.usersServices.getMe(userId);

    const review = this.reviewRepository.create({ ...dto, product, user });
    const result = await this.reviewRepository.save(review);
    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      userId: user.username,
      productId: product.title,
    };
  }

  /**
   * Get All reviews
   * @param pageNumber number of the current page
   * @param perPage data per page
   * @returns collection of all reviews
   */
  async getAll(pageNumber: number , perPage: number){
    const reviews = await this.reviewRepository.find({
      skip: (pageNumber - 1) * perPage,
      take: perPage,
      order: { createdAt: 'DESC' },
    });
    return reviews;
  }

  /**
   * Get a review by id
   * @param id id of the review
   * @returns  review from database
   */
  async getById(id: number) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review id : ${id} not found`);
    return review;
  }

  /**
   * Update a review
   * @param reviewId id of the review to update
   * @param userId id of the user who created the review
   * @param dto data for the updated review
   */
  async update(reviewId: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.getById(reviewId);
    if (review.user.id !== userId)
      throw new ForbiddenException('access denied , you are not allowed ');

    review.rating = dto.rating ?? review.rating;
    review.comment = dto.comment ?? review.comment;

    return this.reviewRepository.save(review);
  }

  /**
   * delete a review
   * @param reviewId ID of the review to delete
   * @param payload  Jwt payload
   * @returns  true if the review was deleted
   */
  async delete(reviewId: number, payload: JwtPayloadType) {
    const review = await this.getById(reviewId);
    if (review.user.id === payload?.id || payload.userType === UserType.ADMIN) {
      await this.reviewRepository.remove(review);
      return { message: 'review has been deleted' };
    }
    throw new ForbiddenException('access denied, yoo are not allowed ');
  }
}

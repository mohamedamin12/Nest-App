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
import { ReviewsServices } from './reviews.service';
import { AuthRolesGuard } from 'src/users/guards/auth.roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserType } from 'src/utils/enum';
import { CreateReviewDto } from './dtos/create-review.dto';
import { GetMeUser } from 'src/users/decorators/get-me.decorator';
import { JwtPayloadType } from 'src/utils/types';
import { UpdateReviewDto } from './dtos/update-reviwe.dto';

@Controller('api/reviews')
export class ReviewsController {
  constructor(public reviewsServices: ReviewsServices) {}

  //* ~/api/reviews/:productId
  @Post('/:productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.USER)
  createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @GetMeUser() payload: JwtPayloadType,
  ) {
    return this.reviewsServices.create(productId, payload.id, body);
  }
  //* ~/api/reviews
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  getAllReviews(
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('perPage', ParseIntPipe) perPage: number,
  ) {
    return this.reviewsServices.getAll(pageNumber , perPage);
  }

  //* ~/api/reviews/:id
  @Get(':id')
  getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsServices.getById(id);
  }

  //* ~/api/reviews/:reviewId
  @Put(':reviewId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.USER)
  updateReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() body: UpdateReviewDto,
    @GetMeUser() payload: JwtPayloadType,
  ) {
    return this.reviewsServices.update(reviewId, payload.id, body);
  }

  //* ~/api/reviews/:reviewId
  @Delete(':reviewId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  deleteReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @GetMeUser() payload: JwtPayloadType,
  ) {
    return this.reviewsServices.delete(reviewId, payload);
  }
}

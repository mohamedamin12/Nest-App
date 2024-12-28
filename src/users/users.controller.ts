import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UsersServices } from './users.service';
import { RegisterUserDto } from './dtos/register-user-dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { GetMeUser } from './decorators/get-me.decorator';
import { JwtPayloadType } from 'src/utils/types';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/utils/enum';
import { AuthRolesGuard } from './guards/auth.roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller('api/users/')
export class UsersController {
  constructor(public usersService: UsersServices) {}

  //* Post: ~/api/users/auth/register
  @Post('auth/register')
  registerUser(@Body() body: RegisterUserDto) {
    return this.usersService.register(body);
  }

  //* Post: ~/api/users/auth/login
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  loginUser(@Body() body: LoginUserDto) {
    return this.usersService.login(body);
  }

  //* Get: ~/api/users/get-me
  @Get('get-me')
  @UseGuards(AuthGuard)
  getUserMe(@GetMeUser() payload: JwtPayloadType) {
    return this.usersService.getMe(payload.id);
  }

  //* Get: ~/api/users/
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  getAllUsers() {
    return this.usersService.getAll();
  }

  // * Put: ~/api/users/
  @Put()
  @Roles(UserType.ADMIN, UserType.USER)
  @UseGuards(AuthRolesGuard)
  updateUser(
    @GetMeUser() payload: JwtPayloadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(payload.id, body);
  }

  // * Delete: ~/api/users/
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.USER)
  @UseGuards(AuthRolesGuard)
  deleteUser(
    @GetMeUser() payload: JwtPayloadType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.delete(id, payload);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './images/users',
        filename: (req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  @UseGuards(AuthGuard)
  setImageProfile(
    @UploadedFile() file: Express.Multer.File,
    @GetMeUser() payload: JwtPayloadType,
  ) {
    if (!file) throw new BadRequestException('File not provided');
    return this.usersService.setImage(payload.id , file.filename);
  }

  @Get(':image')
  @UseGuards(AuthGuard)
  showUserPhoto(@Param('image') image: string , @Res() res : Response ){
      return res.sendFile(image , { root : 'images/users'});
  }

  // @Delete('remove-profile-image')
  // @UseGuards(AuthGuard)
  // removeProfileImage(@GetMeUser() payload: JwtPayloadType){
  //   return this.usersService.removeImage(payload.id);
  // }
}

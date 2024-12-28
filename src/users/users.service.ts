import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dtos/register-user-dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtPayloadType, AccessTokenType } from 'src/utils/types';
import { UserType } from 'src/utils/enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthProvider } from './auth.provider';
import { join } from 'path';
import { unlinkSync } from 'fs';


@Injectable()
export class UsersServices {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    private readonly authProvider: AuthProvider,
  ) {}

  /**
   * Create a new user
   * @param registerUser data for creating a new user
   * @returns JWt (access token)
   */
  async register(registerUser: RegisterUserDto): Promise<AccessTokenType> {
    return this.authProvider.register(registerUser);
  }

  /**
   * Login user
   * @param loginUser data for login user
   * @returns JWt (access token)
   */
  async login(loginUser: LoginUserDto): Promise<AccessTokenType> {
    return this.authProvider.login(loginUser);
  }

  /**
   * Get user (logged in user)
   * @param id user id for the logged in user
   * @returns the user from the database
   */
  async getMe(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  /**
   * Get All users
   * @returns collection of users
   */
  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * Update user
   * @param id id of the logged in user
   * @param updateDto data for the update user
   * @returns update user from the database
   */

  async update(id: number, updateDto: UpdateUserDto) {
    const { password, username } = updateDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User id : ${id} not found`);

    user.username = username ?? user.username;
    if (password) {
      user.password = await this.authProvider.hashedPassword(password);
    }
    return this.userRepository.save(user);
  }

  /**
   * Delete user
   * @param id id of the user
   * @param payload jwt payload
   * @returns a success message
   */
  async delete(id: number, payload: JwtPayloadType) {
    const user = await this.getMe(id);
    if (user.id === payload?.id || payload.userType === UserType.ADMIN) {
      await this.userRepository.remove(user);
      return { message: 'user has been deleted' };
    }
    throw new ForbiddenException('access denied , yoo are not allowed ');
  }

  async setImage(userId: number, uploadImage: string) {
    const user = await this.getMe(userId);

    if (user.profileImage === null) {
      user.profileImage = uploadImage;
    } else {
      await this.removeImage(userId);
      user.profileImage = uploadImage;
    }

    return this.userRepository.save(user);
  }

  async removeImage(userId: number) {
    const user = await this.getMe(userId);
    if (user.profileImage === null)
      return new BadRequestException('there is no profile image');

    const imagePath = join(
      process.cwd(),
      `../../images/users/${user.profileImage}`,
    );
    unlinkSync(imagePath);

    user.profileImage = null;
    return this.userRepository.save(user);
  }
}

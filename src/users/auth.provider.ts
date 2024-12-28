import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user-dto';
import { JwtPayloadType } from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dtos/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Create a new user
   * @param registerUser data for creating a new user
   * @returns JWt (access token)
   */
  async register(registerUser: RegisterUserDto) {
    const { username, email, password } = registerUser;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException('User already exists');

    const hashedPassword = await this.hashedPassword(password);

    let newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      verifictionToken: randomBytes(32).toString('hex'),
    });
    newUser = await this.userRepository.save(newUser);
    const link = this.generateLink(newUser.id, newUser.verifictionToken);

    await this.mailService.verifyEmailTemplate(email, link);

    return {
      message:
        'verifiction token has be sent to your email please verify your email address',
    };
  }

  /**
   * Login user
   * @param loginUser data for login user
   * @returns JWt (access token)
   */

  async login(loginUser: LoginUserDto) {
    const { email, password } = loginUser;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('invalid email or password');

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      throw new BadRequestException('invalid email or password');

    if (!user.isAccountVerified) {
      let verifictionToken = user.verifictionToken;

      if (!verifictionToken) {
        user.verifictionToken = randomBytes(32).toString('hex');
        const result = await this.userRepository.save(user);
        verifictionToken = result.verifictionToken;
      }

      const link = this.generateLink(user.id, user.verifictionToken);
      await this.mailService.verifyEmailTemplate(email, link);
      return {
        message:
          'verifiction token has be sent to your email please verify your email address',
      };
    }

    const token = await this.generateJwt({
      id: user.id,
      userType: user.userType,
    });
    return { token };
  }

  /**
   * hashed password
   * @param password password hashed fro user
   */
  public async hashedPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * generate JWT token
   * @param payload jwt token
   * @returns token
   */
  private generateJwt(payload: JwtPayloadType) {
    return this.jwtService.signAsync(payload);
  }
  /**
   * Generate email verifiction Link
   */
  private generateLink(userId: number, verifictionToken: string) {
    return `${this.config.get<string>('DOMAIN')}/api/users/verify-email/${userId}/${verifictionToken}`;
  }
}

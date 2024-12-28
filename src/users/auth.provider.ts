import { BadRequestException, Injectable } from "@nestjs/common";
import { RegisterUserDto } from "./dtos/register-user-dto";
import { JwtPayloadType, AccessTokenType } from 'src/utils/types';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from './dtos/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from "src/mail/mail.service";



@Injectable()
export class AuthProvider {

    constructor(
      @InjectRepository(User) private readonly userRepository: Repository<User>,
      private readonly jwtService: JwtService,
      private readonly mailService: MailService
    ) {}

    /**
   * Create a new user
   * @param registerUser data for creating a new user
   * @returns JWt (access token)
   */
    async register(registerUser: RegisterUserDto): Promise<AccessTokenType> {
      const { username, email, password } = registerUser;
  
      const user = await this.userRepository.findOne({ where: { email } });
      if (user) throw new BadRequestException('User already exists');
  
      const hashedPassword = await this.hashedPassword(password);
  
      let newUser = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
      });
      newUser = await this.userRepository.save(newUser);
      const token = await this.generateJwt({
        id: newUser.id,
        userType: newUser.userType,
      });
      return { token };
    }
  
    /**
     * Login user
     * @param loginUser data for login user
     * @returns JWt (access token)
     */
  
    async login(loginUser: LoginUserDto): Promise<AccessTokenType> {
      const { email, password } = loginUser;
  
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new BadRequestException('invalid email or password');
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch)
        throw new BadRequestException('invalid email or password');
  
      const token = await this.generateJwt({
        id: user.id,
        userType: user.userType,
      });
      await this.mailService.sendLoginEmail(user.email)
      return { token };
    }

    /**
     * hashed password 
     * @param password password hashed fro user
     */
    public async hashedPassword(password : string){
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
}
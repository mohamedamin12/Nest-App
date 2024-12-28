import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from 'src/utils/types';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { Reflector } from '@nestjs/core';
import { UsersServices } from '../users.service';
import { UserType } from 'src/utils/enum';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly usersServices: UsersServices,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles : UserType[] = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if(!roles || roles.length === 0) return false; // no roles defined, proceed with the request
    
    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (token && type === 'Bearer') {
      try {
        const payload: JwtPayloadType = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.configService.get<string>('JWT_SECRET'),
          },
        );

        const user = await this.usersServices.getMe(payload.id);

        if (!user) return false;

        if (roles.includes(user.userType)) {
          request[CURRENT_USER_KEY] = payload;
          return true;
        }
      } catch {
        throw new UnauthorizedException('access token denied , invalid token');
      }
    } else {
      throw new UnauthorizedException(
        'access token denied , no token provided',
      );
    }
    return false;
  }
}

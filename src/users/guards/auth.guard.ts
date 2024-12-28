import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from 'src/utils/types';
import { CURRENT_USER_KEY } from 'src/utils/constants';

@Injectable()
export  class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

 async canActivate(context: ExecutionContext) {
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
        request[CURRENT_USER_KEY] = payload;
      } catch {
        throw new UnauthorizedException("access token denied , invalid token");
      }
    } else {
      throw new UnauthorizedException("access token denied , no token provided");
    }
    return true;
  }
}

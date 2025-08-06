// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { Request } from 'express';
// import { ERROR_CODES } from '../constants/error-codes';
// import { ERROR_MESSAGES } from '../constants/error-messages';
// import { AuthService } from './auth.service';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private authService: AuthService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();
//     const token = request.cookies['access_token'];
//     if (!token) {
//       throw new UnauthorizedException({ code: ERROR_CODES.ACCESS_TOKEN_NOT_FOUND, message: ERROR_MESSAGES.ACCESS_TOKEN_NOT_FOUND });
//     }

//     try {
//       const payload = this.authService.verifyToken(token);
//       request['user'] = payload;
//     } catch {
//       throw new UnauthorizedException({ code: ERROR_CODES.ACCESS_TOKEN_INVALID, message: ERROR_MESSAGES.ACCESS_TOKEN_INVALID });
//     }

//     return true;
//   }
// }

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

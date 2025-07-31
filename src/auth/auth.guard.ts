import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ERROR_CODES } from '../constants/error-codes';
import { ERROR_MESSAGES } from '../constants/error-messages';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException({ code: ERROR_CODES.ACCESS_TOKEN_NOT_FOUND, message: ERROR_MESSAGES.ACCESS_TOKEN_NOT_FOUND });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException({ code: ERROR_CODES.ACCESS_TOKEN_INVALID, message: ERROR_MESSAGES.ACCESS_TOKEN_INVALID });
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.['access_token'];
  }
}

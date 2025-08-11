import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_CODES } from 'src/constants/error-codes';
import { ERROR_MESSAGES } from 'src/constants/error-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException({ code: ERROR_CODES.ACCESS_TOKEN_INVALID, message: ERROR_MESSAGES.ACCESS_TOKEN_INVALID });
    }

    return user;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ERROR_CODES } from '../../constants/error-codes';
import { ERROR_MESSAGES } from '../../constants/error-messages';
import { UserDto } from '../../users/dto/user.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserDto> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });
    }

    return user;
  }
}

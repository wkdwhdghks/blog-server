import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { ERROR_CODES } from '../constants/error-codes';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

    return user;
  }

  generateToken(userId: number, expiresIn: string) {
    return this.jwtService.sign({ sub: userId }, { expiresIn });
  }

  generateAccessToken(userId: number) {
    return this.generateToken(userId, '10s');
  }

  generateRefreshToken(userId: number) {
    return this.generateToken(userId, '20s');
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID });
    }

    const newAccessToken = this.generateAccessToken(userId);
    const newRefreshToken = this.generateRefreshToken(userId);

    await this.userService.updateRefreshToken(userId, newRefreshToken);

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }
}

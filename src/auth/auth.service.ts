import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ERROR_CODES } from 'src/constants/error-codes';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

    return user;
  }

  generateAccessToken(userId: number) {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '10s' });
  }

  generateRefreshToken(userId: number) {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '20s' });
  }

  async saveRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: await bcrypt.hash(refreshToken, 10) } });
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID, message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID, message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });
    }

    const newAccessToken = this.generateAccessToken(userId);
    const newRefreshToken = this.generateRefreshToken(userId);

    await this.saveRefreshToken(userId, newRefreshToken);

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }
}

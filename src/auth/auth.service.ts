import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ERROR_CODES } from '../constants/error-codes';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const user = await this.usersService.getUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, refreshToken, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: UserDto): Promise<TokenDto> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    await this.usersService.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<TokenDto> {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.usersService.getUserById(payload.sub);

    if (!user || !user.refreshToken || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID, message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });
    }

    const newAccessToken = this.createAccessToken(payload);
    const newRefreshToken = this.createRefreshToken(payload);

    await this.usersService.saveRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(id: number) {
    await this.usersService.removeRefreshToken(id);
  }

  private createAccessToken({ sub, email }: JwtPayload) {
    return this.jwtService.sign({ sub, email }, { expiresIn: '24h' });
  }

  private createRefreshToken({ sub, email }: JwtPayload) {
    return this.jwtService.sign({ sub, email }, { expiresIn: '7d' });
  }
}

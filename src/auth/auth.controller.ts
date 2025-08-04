import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { ERROR_CODES } from '../constants/error-codes';
import { setAuthCookies } from '../utils/cookie';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인된 사용자의 정보를 반환합니다.' })
  async me(@Req() req: Request) {
    const accessToken = req.cookies['access_token'];
    const defaultUserResponse = { isLogin: false, user: null };

    if (!accessToken) return defaultUserResponse;

    try {
      const payload = this.authService.verifyToken(accessToken);
      const user = await this.userService.findById(payload.sub);
      return user ? { ...defaultUserResponse, isLogin: true, user: { id: user.id, email: user.email } } : defaultUserResponse;
    } catch {
      return defaultUserResponse;
    }
  }

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto);

    const accessToken = this.authService.generateAccessToken(user.id);
    const refreshToken = this.authService.generateRefreshToken(user.id);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    return { code: 1 };
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 재발급', description: '리프레시 토큰으로 액세스 토큰을 재발급합니다.' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_NOT_FOUND });
    }

    const payload = this.authService.verifyToken(refreshToken);
    const userId = payload.sub;

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    setAuthCookies(res, tokens.access_token, tokens.refresh_token);

    return { code: 1 };
  }
}

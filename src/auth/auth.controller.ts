import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/error-codes';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { SUCCESS_MESSAGES } from '../constants/success-messages';
import { UserService } from '../user/user.service';
import { clearAuthCookies, setAuthCookies } from '../utils/cookie';
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
    const defaultUserResponse = { data: { isLogin: false, user: null } };

    if (!accessToken) return defaultUserResponse;

    try {
      const payload = this.authService.verifyToken(accessToken);
      const user = await this.userService.findById(payload.sub);
      return user ? { ...defaultUserResponse, data: { isLogin: true, user: { id: user.id, email: user.email } } } : defaultUserResponse;
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

    return { code: 1, message: SUCCESS_MESSAGES.LOGIN };
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 재발급', description: '리프레시 토큰을 이용해 토큰을 재발급합니다.' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_NOT_FOUND, message: ERROR_MESSAGES.REFRESH_TOKEN_NOT_FOUND });
    }

    try {
      const payload = this.authService.verifyToken(refreshToken);
      const userId = payload.sub;
      const tokens = await this.authService.refreshTokens(userId, refreshToken);
      setAuthCookies(res, tokens.access_token, tokens.refresh_token);
      return { code: 1, message: SUCCESS_MESSAGES.REFRESH };
    } catch {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID, message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });
    }
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '리프레시 토큰을 무효화하고 인증 쿠키를 삭제합니다.' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies['access_token'];

    const logoutSuccess = () => {
      clearAuthCookies(res);
      return { code: 1, message: SUCCESS_MESSAGES.LOGOUT };
    };

    if (!accessToken) return logoutSuccess();

    try {
      const payload = this.authService.verifyToken(accessToken);
      await this.userService.updateRefreshToken(payload.sub, null);
    } catch {
      return logoutSuccess();
    }

    return logoutSuccess();
  }
}

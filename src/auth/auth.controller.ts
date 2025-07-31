import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ERROR_CODES } from 'src/constants/error-codes';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { SUCCESS_MESSAGES } from 'src/constants/success-messages';
import { setAuthCookies } from 'src/utils/cookie';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto);

    const accessToken = this.authService.generateAccessToken(user.id);
    const refreshToken = this.authService.generateRefreshToken(user.id);

    await this.authService.saveRefreshToken(user.id, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    return { code: 1, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 재발급', description: '리프레시 토큰으로 액세스 토큰을 재발급합니다.' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_NOT_FOUND, message: ERROR_MESSAGES.REFRESH_TOKEN_NOT_FOUND });
    }

    const payload = this.authService.verifyToken(refreshToken);
    const userId = payload.sub;

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    setAuthCookies(res, tokens.access_token, tokens.refresh_token);

    return { code: 1, message: SUCCESS_MESSAGES.REFRESH_TOKEN_SUCCESS };
  }
}

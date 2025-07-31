import { Response } from 'express';

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  options?: { accessTokenMaxAge?: number; refreshTokenMaxAge?: number },
) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: options?.accessTokenMaxAge ?? 10 * 1000,
    sameSite: 'lax',
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: options?.refreshTokenMaxAge ?? 20 * 1000,
    sameSite: 'lax',
    path: '/',
  });
}

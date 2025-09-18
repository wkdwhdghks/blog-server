import { Response } from 'express';

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1 * 60 * 60 * 1000, path: '/' });
  res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 2 * 60 * 60 * 1000, path: '/' });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
}

import { IncomingMessage, ServerResponse } from 'http';

import { NestFactory } from '@nestjs/core';
import { Express } from 'express';

import { AppModule } from '../src/app.module';

let cachedHandler: Express | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance() as Express;
  }
  cachedHandler(req, res);
}

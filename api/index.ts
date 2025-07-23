import { IncomingMessage, ServerResponse } from 'http';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

import { AppModule } from '../src/app.module';

const expressApp = express();
let cachedServer: typeof expressApp | null = null;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: false,
    });
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: IncomingMessage & { body: any }, res: ServerResponse) {
  const server = await bootstrap();
  server(req, res);
}

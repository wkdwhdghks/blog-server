import { IncomingMessage, ServerResponse } from 'http';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';

import { AppModule } from '../src/app.module';

let cachedHandler: Express | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('API 문서')
      .setDescription('Nest.js 서버리스 Swagger 문서입니다.')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance() as Express;
  }
  cachedHandler(req, res);
}

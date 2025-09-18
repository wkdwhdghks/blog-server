import type { IncomingMessage, ServerResponse } from 'node:http';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { validationException } from '../src/utils/validation-exception';

let cachedHandler: Express | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);

    app.enableCors({ origin: 'http://localhost:3001', credentials: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS' });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, exceptionFactory: validationException }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder().setTitle('API 문서').setDescription('Nest.js Swagger 문서입니다.').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, config);
    const options = {
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
      ],
    };

    SwaggerModule.setup('swagger', app, document, options);
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance() as Express;
  }

  cachedHandler(req, res);
}

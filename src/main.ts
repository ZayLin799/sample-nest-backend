import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalInterceptors(
    new TransformResponseInterceptor(),
    new ErrorInterceptor()
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sample Nest API')
    .setDescription('The Sample Nest Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<string>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 App running on http://localhost:${port}`);
}
void bootstrap();

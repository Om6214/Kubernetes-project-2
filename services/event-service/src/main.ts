import * as dotenv from 'dotenv';
// Load environment variables FIRST before importing anything else
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Validate configuration before starting
  AppConfig.validate();

  const logger = new Logger('EventService');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('');

  const port = AppConfig.port;

  await app.listen(port);

  logger.log(`🚀 Event Service is running on port ${port}`);
  logger.log(`🌍 Environment: ${AppConfig.nodeEnv}`);
  logger.log(`📊 Database: ${AppConfig.mongoDatabase}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Event Service:', error);
  process.exit(1);
});
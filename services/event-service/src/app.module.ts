import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from './events/events.module';
import { HealthController } from './health/health.controller';
import { AppConfig } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUri, {
      dbName: AppConfig.mongoDatabase,
    }),
    EventModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
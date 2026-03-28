import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingModule } from './bookings/bookings.module';
import { HealthController } from './health/health.controller';
import { AppConfig } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUri, {
      dbName: AppConfig.mongoDatabase,
    }),
    BookingModule,
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
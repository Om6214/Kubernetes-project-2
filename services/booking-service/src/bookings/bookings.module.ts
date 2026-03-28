import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { BookingController } from './bookings.controller';
import { BookingService } from './bookings.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { EventServiceClient } from '../clients/event-service.client';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { AppConfig } from '../config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    PassportModule,
    JwtModule.register({
      secret: AppConfig.jwtSecret,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, JwtStrategy, EventServiceClient],
  exports: [BookingService, EventServiceClient],
})
export class BookingModule {}
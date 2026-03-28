import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventController } from './events.controller';
import { EventService } from './events.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Event, EventSchema } from '../schemas/event.schema';
import { AppConfig } from '../config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    PassportModule,
    JwtModule.register({
      secret: AppConfig.jwtSecret,
    }),
  ],
  controllers: [EventController],
  providers: [EventService, JwtStrategy],
  exports: [EventService],
})
export class EventModule {}
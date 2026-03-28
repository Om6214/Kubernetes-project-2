import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface EventSnapshot {
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  price: number;
}

@Schema({
  timestamps: true,
  collection: 'bookings',
})
export class Booking extends Document {
  @Prop({ required: true })
  userId: string; // Reference to user in auth service

  @Prop({ required: true })
  eventId: string; // Reference to event in event service

  @Prop({ required: true, min: 1 })
  numberOfTickets: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ default: 'confirmed', enum: ['confirmed', 'cancelled', 'pending'] })
  status: string;

  @Prop({ required: true })
  bookingReference: string; // Unique booking reference

  @Prop({
    type: {
      title: String,
      startDate: Date,
      endDate: Date,
      location: String,
      price: Number,
    },
    required: true
  })
  eventSnapshot: EventSnapshot; // Snapshot of event details at booking time

  @Prop()
  cancellationDate: Date;

  @Prop()
  cancellationReason: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
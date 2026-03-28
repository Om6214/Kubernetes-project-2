import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'events',
})
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, min: 1 })
  maxAttendees: number;

  @Prop({ default: 0, min: 0 })
  currentAttendees: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 'active', enum: ['active', 'cancelled', 'completed'] })
  status: string;

  @Prop({ required: true })
  organizer: string; // User ID of the organizer

  @Prop([String])
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Virtual field for availability
  get isAvailable(): boolean {
    return this.status === 'active' &&
           this.isActive &&
           this.currentAttendees < this.maxAttendees &&
           new Date() < this.startDate;
  }

  get spotsRemaining(): number {
    return this.maxAttendees - this.currentAttendees;
  }
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Add virtual fields
EventSchema.virtual('isAvailable').get(function(this: Event) {
  return this.status === 'active' &&
         this.isActive &&
         this.currentAttendees < this.maxAttendees &&
         new Date() < this.startDate;
});

EventSchema.virtual('spotsRemaining').get(function(this: Event) {
  return this.maxAttendees - this.currentAttendees;
});

// Ensure virtual fields are serialized
EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });
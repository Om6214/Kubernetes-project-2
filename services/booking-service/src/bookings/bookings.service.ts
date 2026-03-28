import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from '../schemas/booking.schema';
import { EventServiceClient } from '../clients/event-service.client';
import {
  CreateBookingDto,
  CancelBookingDto,
  BookingResponseDto,
  BookingListResponseDto,
  BookingConfirmationDto,
} from '../dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<Booking>,
    private eventServiceClient: EventServiceClient,
  ) {}

  async createBooking(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingConfirmationDto> {
    const { eventId, numberOfTickets } = createBookingDto;

    // Step 1: Get event details from event service
    const event = await this.eventServiceClient.getEventById(eventId);

    // Step 2: Validate booking constraints
    if (!event.isAvailable) {
      throw new BadRequestException('Event is not available for booking');
    }

    if (event.spotsRemaining < numberOfTickets) {
      throw new BadRequestException(
        `Only ${event.spotsRemaining} tickets available, but ${numberOfTickets} requested`
      );
    }

    // Step 3: Check for duplicate bookings
    const existingBooking = await this.bookingModel.findOne({
      userId,
      eventId,
      status: 'confirmed',
      isActive: true,
    });

    if (existingBooking) {
      throw new ConflictException('You already have a booking for this event');
    }

    // Step 4: Calculate total amount
    const totalAmount = event.price * numberOfTickets;

    // Step 5: Generate booking reference
    const bookingReference = this.generateBookingReference();

    // Step 6: Create booking record
    const booking = new this.bookingModel({
      userId,
      eventId,
      numberOfTickets,
      totalAmount,
      status: 'confirmed',
      bookingReference,
      eventSnapshot: {
        title: event.title,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        location: event.location,
        price: event.price,
      },
    });

    // Step 7: Update event attendee count and save booking in transaction-like manner
    try {
      // First increment the event attendees
      await this.eventServiceClient.incrementEventAttendees(eventId);

      // Then save the booking
      await booking.save();

      return {
        booking: this.transformBookingResponse(booking),
        message: `Booking confirmed! Your reference number is ${bookingReference}`,
      };
    } catch (error) {
      // If anything fails, we need to clean up
      if (booking._id) {
        await this.bookingModel.findByIdAndDelete(booking._id);
      }

      throw error;
    }
  }

  async getUserBookings(userId: string): Promise<BookingListResponseDto> {
    const bookings = await this.bookingModel
      .find({
        userId,
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      bookings: bookings.map(booking => this.transformBookingResponse(booking)),
      total: bookings.length,
    };
  }

  async getBookingById(bookingId: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking || !booking.isActive) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return this.transformBookingResponse(booking);
  }

  async cancelBooking(
    bookingId: string,
    cancelDto: CancelBookingDto,
    userId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking || !booking.isActive) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Check if event has already started
    const eventStartDate = new Date(booking.eventSnapshot.startDate);
    const now = new Date();

    if (eventStartDate <= now) {
      throw new BadRequestException('Cannot cancel booking for an event that has already started');
    }

    // Update event attendee count
    try {
      await this.eventServiceClient.decrementEventAttendees(booking.eventId);
    } catch (error) {
      throw new BadRequestException('Unable to process cancellation at this time');
    }

    // Update booking status
    const updatedBooking = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: 'cancelled',
        cancellationDate: new Date(),
        cancellationReason: cancelDto.reason || 'No reason provided',
      },
      { new: true, runValidators: true },
    );

    return this.transformBookingResponse(updatedBooking);
  }

  /**
   * Admin endpoint to get all bookings for a specific event
   */
  async getEventBookings(eventId: string): Promise<BookingListResponseDto> {
    const bookings = await this.bookingModel
      .find({
        eventId,
        status: 'confirmed',
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      bookings: bookings.map(booking => this.transformBookingResponse(booking)),
      total: bookings.length,
    };
  }

  private generateBookingReference(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `BK-${timestamp}-${randomPart}`.toUpperCase();
  }

  private transformBookingResponse(booking: Booking): BookingResponseDto {
    return {
      id: booking._id as string,
      userId: booking.userId,
      eventId: booking.eventId,
      numberOfTickets: booking.numberOfTickets,
      totalAmount: booking.totalAmount,
      status: booking.status,
      bookingReference: booking.bookingReference,
      eventSnapshot: booking.eventSnapshot,
      cancellationDate: booking.cancellationDate,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
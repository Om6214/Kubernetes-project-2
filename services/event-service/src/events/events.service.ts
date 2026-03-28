import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  EventListResponseDto,
  GetEventsQueryDto,
} from '../dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
  ) {}

  async createEvent(createEventDto: CreateEventDto, organizerId: string): Promise<EventResponseDto> {
    const { startDate, endDate, ...rest } = createEventDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start <= now) {
      throw new BadRequestException('Start date must be in the future');
    }

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = await this.eventModel.create({
      ...rest,
      startDate: start,
      endDate: end,
      organizer: organizerId,
      currentAttendees: 0,
    });

    return this.transformEventResponse(event);
  }

  async getEvents(query: GetEventsQueryDto): Promise<EventListResponseDto> {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 100); // Cap at 100 items per page
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { location: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }

    if (query.startDateFrom || query.startDateTo) {
      filter.startDate = {};
      if (query.startDateFrom) {
        filter.startDate.$gte = new Date(query.startDateFrom);
      }
      if (query.startDateTo) {
        filter.startDate.$lte = new Date(query.startDateTo);
      }
    }

    if (query.tags) {
      const tagsArray = query.tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    // Build sort object
    const sort: any = {};
    const sortBy = query.sortBy || 'startDate';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    sort[sortBy] = sortOrder;

    // Execute queries
    const [events, total] = await Promise.all([
      this.eventModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.eventModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      events: events.map(event => this.transformEventResponse(event)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getEventById(id: string): Promise<EventResponseDto> {
    const event = await this.eventModel.findById(id);

    if (!event || !event.isActive) {
      throw new NotFoundException('Event not found');
    }

    return this.transformEventResponse(event);
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventModel.findById(id);

    if (!event || !event.isActive) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is the organizer
    if (event.organizer !== userId) {
      throw new ForbiddenException('You can only update events you organize');
    }

    // Validate date updates if provided
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const currentStart = event.startDate;
      const currentEnd = event.endDate;
      const newStart = updateEventDto.startDate ? new Date(updateEventDto.startDate) : currentStart;
      const newEnd = updateEventDto.endDate ? new Date(updateEventDto.endDate) : currentEnd;
      const now = new Date();

      if (newStart <= now) {
        throw new BadRequestException('Start date must be in the future');
      }

      if (newEnd <= newStart) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Validate max attendees if being reduced
    if (updateEventDto.maxAttendees && updateEventDto.maxAttendees < event.currentAttendees) {
      throw new BadRequestException('Cannot reduce max attendees below current attendee count');
    }

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      id,
      {
        ...updateEventDto,
        ...(updateEventDto.startDate && { startDate: new Date(updateEventDto.startDate) }),
        ...(updateEventDto.endDate && { endDate: new Date(updateEventDto.endDate) }),
      },
      { new: true, runValidators: true },
    );

    return this.transformEventResponse(updatedEvent);
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    const event = await this.eventModel.findById(id);

    if (!event || !event.isActive) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is the organizer
    if (event.organizer !== userId) {
      throw new ForbiddenException('You can only delete events you organize');
    }

    // Check if event has bookings
    if (event.currentAttendees > 0) {
      throw new BadRequestException('Cannot delete event with existing bookings');
    }

    // Soft delete
    await this.eventModel.findByIdAndUpdate(id, { isActive: false });
  }

  /**
   * Internal method to increment attendee count (called by booking service)
   */
  async incrementAttendeeCount(eventId: string): Promise<void> {
    const event = await this.eventModel.findById(eventId);

    if (!event || !event.isActive) {
      throw new NotFoundException('Event not found');
    }

    if (event.currentAttendees >= event.maxAttendees) {
      throw new BadRequestException('Event is fully booked');
    }

    if (event.status !== 'active') {
      throw new BadRequestException('Event is not available for booking');
    }

    await this.eventModel.findByIdAndUpdate(eventId, {
      $inc: { currentAttendees: 1 },
    });
  }

  /**
   * Internal method to decrement attendee count (called by booking service)
   */
  async decrementAttendeeCount(eventId: string): Promise<void> {
    const event = await this.eventModel.findById(eventId);

    if (!event || !event.isActive) {
      throw new NotFoundException('Event not found');
    }

    if (event.currentAttendees <= 0) {
      throw new BadRequestException('Event has no attendees to remove');
    }

    await this.eventModel.findByIdAndUpdate(eventId, {
      $inc: { currentAttendees: -1 },
    });
  }

  private transformEventResponse(event: Event): EventResponseDto {
    return {
      id: event._id as string,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      price: event.price,
      status: event.status,
      organizer: event.organizer,
      tags: event.tags || [],
      isActive: event.isActive,
      isAvailable: event.isAvailable,
      spotsRemaining: event.spotsRemaining,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
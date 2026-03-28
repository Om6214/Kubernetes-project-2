import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../config';

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  status: string;
  organizer: string;
  isAvailable: boolean;
  spotsRemaining: number;
}

@Injectable()
export class EventServiceClient {
  private readonly logger = new Logger(EventServiceClient.name);
  private readonly eventServiceUrl = AppConfig.eventServiceUrl;

  constructor(private readonly httpService: HttpService) {}

  async getEventById(eventId: string): Promise<EventDetails> {
    try {
      const url = `${this.eventServiceUrl}/api/events/${eventId}`;
      this.logger.log(`Fetching event details from: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get<EventDetails>(url, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch event ${eventId}:`, error.message);

      if (error.response?.status === 404) {
        throw new BadRequestException('Event not found');
      }

      throw new BadRequestException('Unable to fetch event details');
    }
  }

  async incrementEventAttendees(eventId: string): Promise<void> {
    try {
      const url = `${this.eventServiceUrl}/api/events/internal/${eventId}/increment-attendees`;
      this.logger.log(`Incrementing attendees for event ${eventId}`);

      await firstValueFrom(
        this.httpService.post(url, {}, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Successfully incremented attendees for event ${eventId}`);
    } catch (error) {
      this.logger.error(`Failed to increment attendees for event ${eventId}:`, error.message);

      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data?.message || 'Unable to book event');
      }

      throw new BadRequestException('Unable to update event booking count');
    }
  }

  async decrementEventAttendees(eventId: string): Promise<void> {
    try {
      const url = `${this.eventServiceUrl}/api/events/internal/${eventId}/decrement-attendees`;
      this.logger.log(`Decrementing attendees for event ${eventId}`);

      await firstValueFrom(
        this.httpService.post(url, {}, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Successfully decremented attendees for event ${eventId}`);
    } catch (error) {
      this.logger.error(`Failed to decrement attendees for event ${eventId}:`, error.message);

      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data?.message || 'Unable to cancel booking');
      }

      throw new BadRequestException('Unable to update event booking count');
    }
  }
}
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { EventService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  EventListResponseDto,
  GetEventsQueryDto,
} from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getEvents(@Query() query: GetEventsQueryDto): Promise<EventListResponseDto> {
    return this.eventService.getEvents(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEventById(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventService.getEventById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: any): Promise<EventResponseDto> {
    return this.eventService.createEvent(createEventDto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: any,
  ): Promise<EventResponseDto> {
    return this.eventService.updateEvent(id, updateEventDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string, @Req() req: any): Promise<void> {
    return this.eventService.deleteEvent(id, req.user.userId);
  }

  // Internal endpoints for booking service
  @Post('internal/:id/increment-attendees')
  @HttpCode(HttpStatus.OK)
  async incrementAttendees(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.eventService.incrementAttendeeCount(id);
    return { success: true };
  }

  @Post('internal/:id/decrement-attendees')
  @HttpCode(HttpStatus.OK)
  async decrementAttendees(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.eventService.decrementAttendeeCount(id);
    return { success: true };
  }
}
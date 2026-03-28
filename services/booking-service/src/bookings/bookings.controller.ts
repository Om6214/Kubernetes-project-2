import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { BookingService } from './bookings.service';
import {
  CreateBookingDto,
  CancelBookingDto,
  BookingResponseDto,
  BookingListResponseDto,
  BookingConfirmationDto,
} from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: any,
  ): Promise<BookingConfirmationDto> {
    return this.bookingService.createBooking(createBookingDto, req.user.userId);
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  async getUserBookings(@Param('id') userId: string, @Req() req: any): Promise<BookingListResponseDto> {
    // Ensure users can only get their own bookings
    if (userId !== req.user.userId) {
      userId = req.user.userId;
    }
    return this.bookingService.getUserBookings(userId);
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyBookings(@Req() req: any): Promise<BookingListResponseDto> {
    return this.bookingService.getUserBookings(req.user.userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBookingById(@Param('id') id: string, @Req() req: any): Promise<BookingResponseDto> {
    return this.bookingService.getBookingById(id, req.user.userId);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @Param('id') id: string,
    @Body() cancelDto: CancelBookingDto,
    @Req() req: any,
  ): Promise<BookingResponseDto> {
    return this.bookingService.cancelBooking(id, cancelDto, req.user.userId);
  }

  // Admin/internal endpoint for getting event bookings
  @Get('event/:eventId')
  @HttpCode(HttpStatus.OK)
  async getEventBookings(@Param('eventId') eventId: string): Promise<BookingListResponseDto> {
    return this.bookingService.getEventBookings(eventId);
  }
}
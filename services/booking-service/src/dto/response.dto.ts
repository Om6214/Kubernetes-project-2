export class BookingResponseDto {
  id: string;
  userId: string;
  eventId: string;
  numberOfTickets: number;
  totalAmount: number;
  status: string;
  bookingReference: string;
  eventSnapshot: {
    title: string;
    startDate: Date;
    endDate: Date;
    location: string;
    price: number;
  };
  cancellationDate?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BookingListResponseDto {
  bookings: BookingResponseDto[];
  total: number;
}

export class BookingConfirmationDto {
  booking: BookingResponseDto;
  message: string;
}
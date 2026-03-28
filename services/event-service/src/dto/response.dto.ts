export class EventResponseDto {
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
  tags: string[];
  isActive: boolean;
  isAvailable: boolean;
  spotsRemaining: number;
  createdAt: Date;
  updatedAt: Date;
}

export class EventListResponseDto {
  events: EventResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
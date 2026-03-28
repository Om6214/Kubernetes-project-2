import { IsString, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString({ message: 'Event ID must be a string' })
  @IsNotEmpty({ message: 'Event ID is required' })
  eventId: string;

  @IsNumber({}, { message: 'Number of tickets must be a number' })
  @IsPositive({ message: 'Number of tickets must be a positive number' })
  @Min(1, { message: 'Number of tickets must be at least 1' })
  numberOfTickets: number;
}
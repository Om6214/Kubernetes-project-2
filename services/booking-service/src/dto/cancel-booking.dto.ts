import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @IsString({ message: 'Cancellation reason must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Cancellation reason must not exceed 500 characters' })
  reason?: string;
}
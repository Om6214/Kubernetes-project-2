import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsPositive,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description: string;

  @IsString({ message: 'Location must be a string' })
  @IsNotEmpty({ message: 'Location is required' })
  @MaxLength(300, { message: 'Location must not exceed 300 characters' })
  location: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string;

  @IsNumber({}, { message: 'Max attendees must be a number' })
  @IsPositive({ message: 'Max attendees must be a positive number' })
  @Min(1, { message: 'Max attendees must be at least 1' })
  maxAttendees: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be non-negative' })
  price: number;

  @IsArray({ message: 'Tags must be an array' })
  @IsOptional()
  tags?: string[];
}
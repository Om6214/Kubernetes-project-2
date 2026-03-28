import {
  IsString,
  IsDateString,
  IsNumber,
  IsPositive,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';

export class UpdateEventDto {
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsString({ message: 'Location must be a string' })
  @IsOptional()
  @MaxLength(300, { message: 'Location must not exceed 300 characters' })
  location?: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @IsOptional()
  endDate?: string;

  @IsNumber({}, { message: 'Max attendees must be a number' })
  @IsPositive({ message: 'Max attendees must be a positive number' })
  @Min(1, { message: 'Max attendees must be at least 1' })
  @IsOptional()
  maxAttendees?: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be non-negative' })
  @IsOptional()
  price?: number;

  @IsEnum(['active', 'cancelled', 'completed'], { message: 'Status must be active, cancelled, or completed' })
  @IsOptional()
  status?: string;

  @IsArray({ message: 'Tags must be an array' })
  @IsOptional()
  tags?: string[];
}
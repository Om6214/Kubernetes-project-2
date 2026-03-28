import { IsOptional, IsString, IsNumberString, IsEnum, IsDateString } from 'class-validator';

export class GetEventsQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a number' })
  page?: string = '1';

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a number' })
  limit?: string = '10';

  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  search?: string;

  @IsOptional()
  @IsEnum(['active', 'cancelled', 'completed'], { message: 'Status must be active, cancelled, or completed' })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  startDateTo?: string;

  @IsOptional()
  @IsString({ message: 'Tags must be a string' })
  tags?: string; // comma-separated tags

  @IsOptional()
  @IsEnum(['startDate', 'price', 'title', 'createdAt'], { message: 'Sort by must be startDate, price, title, or createdAt' })
  sortBy?: string = 'startDate';

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be asc or desc' })
  sortOrder?: string = 'asc';
}
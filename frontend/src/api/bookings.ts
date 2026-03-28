import { http } from './http';
import type { Booking } from '../types/booking';

export function listBookings(token: string) {
  return http<Booking[]>('/bookings', { token });
}

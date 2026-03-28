import { http } from './http';
import type { Event } from '../types/event';

export function listEvents() {
  return http<Event[]>('/events');
}

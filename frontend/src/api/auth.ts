import { http } from './http';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types/auth';

export function login(body: LoginRequest) {
  return http<AuthResponse>('/auth/login', { method: 'POST', body });
}

export function signup(body: SignupRequest) {
  return http<AuthResponse>('/auth/signup', { method: 'POST', body });
}

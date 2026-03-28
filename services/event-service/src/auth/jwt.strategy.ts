import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AppConfig } from '../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: AppConfig.jwtSecret,
    });
  }

  async validate(payload: { id: string }): Promise<any> {
    if (!payload.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return user info from token
    // In a production app, you might want to verify user still exists in auth service
    return { userId: payload.id };
  }
}
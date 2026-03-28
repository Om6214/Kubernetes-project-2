import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get('live')
  live() {
    return {
      status: 'alive',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    const state = this.connection.readyState;

    // 1 = connected
    if (state !== 1) {
      throw new Error('Database not connected');
    }

    return {
      status: 'ready',
      db: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
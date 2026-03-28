import { SecretsConfig } from './secrets.config';

export class AppConfig {
  // Database Configuration
  static get mongoUri(): string {
    return SecretsConfig.getRequiredSecret('MONGO_URI', 'MONGO_URI');
  }

  static get mongoDatabase(): string {
    return SecretsConfig.getSecret('MONGO_DATABASE', 'MONGO_DATABASE') || 'event_auth_db';
  }

  // JWT Configuration
  static get jwtSecret(): string {
    return SecretsConfig.getRequiredSecret('JWT_SECRET', 'JWT_SECRET');
  }

  static get jwtExpiresIn(): string {
    return SecretsConfig.getSecret('JWT_EXPIRES_IN', 'JWT_EXPIRES_IN') || '24h';
  }

  // Server Configuration
  static get port(): number {
    const port = SecretsConfig.getSecret('PORT', 'PORT');
    return port ? parseInt(port, 10) : 3001;
  }

  static get nodeEnv(): string {
    return SecretsConfig.getSecret('NODE_ENV', 'NODE_ENV') || 'development';
  }

  // Service URLs for inter-service communication
  static get eventServiceUrl(): string {
    return SecretsConfig.getSecret('EVENT_SERVICE_URL', 'EVENT_SERVICE_URL') || 'http://event-svc:3002';
  }

  static get bookingServiceUrl(): string {
    return SecretsConfig.getSecret('BOOKING_SERVICE_URL', 'BOOKING_SERVICE_URL') || 'http://booking-svc:3003';
  }

  /**
   * Validates that all required configuration is present
   */
  static validate(): void {
    try {
      console.log('🔧 Validating configuration...');

      // Test required configs
      this.mongoUri;
      this.jwtSecret;

      console.log('✅ Configuration validation successful');
      console.log(`📊 Database: ${this.mongoDatabase}`);
      console.log(`🚀 Port: ${this.port}`);
      console.log(`🌍 Environment: ${this.nodeEnv}`);

    } catch (error) {
      console.error('❌ Configuration validation failed:', error.message);
      process.exit(1);
    }
  }
}
import { SecretsConfig } from './secrets.config';

export class AppConfig {
  // Database Configuration
  static get mongoUri(): string {
    return SecretsConfig.getRequiredSecret('MONGO_URI', 'MONGO_URI');
  }

  static get mongoDatabase(): string {
    return SecretsConfig.getSecret('MONGO_DATABASE', 'MONGO_DATABASE') || 'event_bookings_db';
  }

  // JWT Configuration (for token verification)
  static get jwtSecret(): string {
    return SecretsConfig.getRequiredSecret('JWT_SECRET', 'JWT_SECRET');
  }

  // Server Configuration
  static get port(): number {
    const port = SecretsConfig.getSecret('PORT', 'PORT');
    return port ? parseInt(port, 10) : 3003;
  }

  static get nodeEnv(): string {
    return SecretsConfig.getSecret('NODE_ENV', 'NODE_ENV') || 'development';
  }

  // Service URLs for inter-service communication - CRITICAL: NO localhost!
  static get eventServiceUrl(): string {
    return SecretsConfig.getRequiredSecret('EVENT_SERVICE_URL', 'EVENT_SERVICE_URL');
  }

  static get authServiceUrl(): string {
    return SecretsConfig.getSecret('AUTH_SERVICE_URL', 'AUTH_SERVICE_URL') || 'http://auth-svc:3001';
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
      this.eventServiceUrl; // This is critical for booking service

      console.log('✅ Configuration validation successful');
      console.log(`📊 Database: ${this.mongoDatabase}`);
      console.log(`🚀 Port: ${this.port}`);
      console.log(`🌍 Environment: ${this.nodeEnv}`);
      console.log(`🔗 Event Service URL: ${this.eventServiceUrl}`);

    } catch (error) {
      console.error('❌ Configuration validation failed:', error.message);
      process.exit(1);
    }
  }
}
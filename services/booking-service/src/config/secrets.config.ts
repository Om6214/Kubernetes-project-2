import * as fs from 'fs';
import * as path from 'path';

export class SecretsConfig {
  private static readonly SECRETS_MOUNT_PATH = '/mnt/secrets-store';

  /**
   * Reads a secret value with file fallback to environment variable
   * @param secretName The name of the secret
   * @param envVarName The environment variable name to fallback to
   * @returns The secret value or undefined if not found
   */
  static getSecret(secretName: string, envVarName?: string): string | undefined {
    try {
      // First: Try to read from Kubernetes CSI mounted file
      const secretFilePath = path.join(this.SECRETS_MOUNT_PATH, secretName);

      if (fs.existsSync(secretFilePath)) {
        const secretValue = fs.readFileSync(secretFilePath, 'utf8').trim();
        if (secretValue) {
          console.log(`✓ Secret '${secretName}' loaded from file`);
          return secretValue;
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read secret file '${secretName}':`, error.message);
    }

    // Second: Fallback to environment variable
    const envVar = envVarName || secretName;
    const envValue = process.env[envVar];

    if (envValue) {
      console.log(`✓ Secret '${secretName}' loaded from environment variable '${envVar}'`);
      return envValue;
    }

    console.error(`❌ Secret '${secretName}' not found in file or environment variable '${envVar}'`);
    return undefined;
  }

  /**
   * Gets a required secret and throws if not found
   */
  static getRequiredSecret(secretName: string, envVarName?: string): string {
    const value = this.getSecret(secretName, envVarName);
    if (!value) {
      throw new Error(`Required secret '${secretName}' not found`);
    }
    return value;
  }
}
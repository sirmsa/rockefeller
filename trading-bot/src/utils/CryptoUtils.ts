import { createHmac } from 'crypto';
import ConfigManager from '@/core/ConfigManager';
import Logger from '@/logging/Logger';

class CryptoUtils {
  private static instance: CryptoUtils;
  private logger = Logger.getInstance();
  private config = ConfigManager.getInstance();

  private constructor() {}

  public static getInstance(): CryptoUtils {
    if (!CryptoUtils.instance) {
      CryptoUtils.instance = new CryptoUtils();
    }
    return CryptoUtils.instance;
  }

  /**
   * Generate HMAC SHA256 signature for Binance API requests
   */
  public generateSignature(queryString: string): string {
    try {
      const secretKey = this.config.binanceConfig.secretKey;
      const signature = createHmac('sha256', secretKey)
        .update(queryString)
        .digest('hex');

      this.logger.debug('HMAC signature generated', {
        type: 'HMAC_SIGNATURE_GENERATED',
        queryStringLength: queryString.length,
        signatureLength: signature.length
      });

      return signature;
    } catch (error) {
      this.logger.error('Failed to generate HMAC signature', {
        type: 'HMAC_SIGNATURE_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Build query string from parameters
   */
  public buildQueryString(params: Record<string, any>): string {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const queryString = queryParams.toString();
      
      this.logger.debug('Query string built', {
        type: 'QUERY_STRING_BUILT',
        paramCount: Object.keys(params).length,
        queryStringLength: queryString.length
      });

      return queryString;
    } catch (error) {
      this.logger.error('Failed to build query string', {
        type: 'QUERY_STRING_ERROR',
        params,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Add timestamp and signature to parameters
   */
  public addSignatureToParams(
    params: Record<string, any>,
    timestamp?: number
  ): Record<string, any> {
    try {
      const timestampToUse = timestamp || Date.now();
      const paramsWithTimestamp = {
        ...params,
        timestamp: timestampToUse
      };

      const queryString = this.buildQueryString(paramsWithTimestamp);
      const signature = this.generateSignature(queryString);

      const finalParams = {
        ...paramsWithTimestamp,
        signature
      };

      this.logger.debug('Signature added to parameters', {
        type: 'SIGNATURE_ADDED',
        originalParamCount: Object.keys(params).length,
        finalParamCount: Object.keys(finalParams).length,
        timestamp: timestampToUse
      });

      return finalParams;
    } catch (error) {
      this.logger.error('Failed to add signature to parameters', {
        type: 'SIGNATURE_ADD_ERROR',
        params,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Generate a random string for client order IDs
   */
  public generateClientOrderId(prefix: string = 'bot'): string {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const clientOrderId = `${prefix}_${timestamp}_${random}`;

      this.logger.debug('Client order ID generated', {
        type: 'CLIENT_ORDER_ID_GENERATED',
        clientOrderId,
        prefix
      });

      return clientOrderId;
    } catch (error) {
      this.logger.error('Failed to generate client order ID', {
        type: 'CLIENT_ORDER_ID_ERROR',
        prefix,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Validate API key format (basic validation)
   */
  public validateApiKey(apiKey: string): boolean {
    try {
      // Basic validation - API keys are typically 64 characters
      const isValid = Boolean(apiKey && apiKey.length === 64 && /^[a-zA-Z0-9]+$/.test(apiKey));
      
      this.logger.debug('API key validation result', {
        type: 'API_KEY_VALIDATION',
        isValid,
        keyLength: apiKey?.length
      });

      return isValid;
    } catch (error) {
      this.logger.error('Failed to validate API key', {
        type: 'API_KEY_VALIDATION_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Validate secret key format (basic validation)
   */
  public validateSecretKey(secretKey: string): boolean {
    try {
      // Basic validation - secret keys are typically 64 characters
      const isValid = Boolean(secretKey && secretKey.length === 64 && /^[a-zA-Z0-9]+$/.test(secretKey));
      
      this.logger.debug('Secret key validation result', {
        type: 'SECRET_KEY_VALIDATION',
        isValid,
        keyLength: secretKey?.length
      });

      return isValid;
    } catch (error) {
      this.logger.error('Failed to validate secret key', {
        type: 'SECRET_KEY_VALIDATION_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Encrypt sensitive data (basic implementation)
   */
  public encryptData(data: string): string {
    try {
      const encryptionKey = this.config.securityConfig.encryptionKey;
      const cipher = createHmac('sha256', encryptionKey);
      const encrypted = cipher.update(data, 'utf8').digest('hex');

      this.logger.debug('Data encrypted', {
        type: 'DATA_ENCRYPTED',
        dataLength: data.length,
        encryptedLength: encrypted.length
      });

      return encrypted;
    } catch (error) {
      this.logger.error('Failed to encrypt data', {
        type: 'DATA_ENCRYPTION_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Generate a secure random string
   */
  public generateSecureRandom(length: number = 32): string {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      this.logger.debug('Secure random string generated', {
        type: 'SECURE_RANDOM_GENERATED',
        length
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to generate secure random string', {
        type: 'SECURE_RANDOM_ERROR',
        length,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

export default CryptoUtils;

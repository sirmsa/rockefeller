import CryptoUtils from '@/utils/CryptoUtils';
import ConfigManager from '@/core/ConfigManager';

describe('CryptoUtils', () => {
  let cryptoUtils: CryptoUtils;

  beforeEach(() => {
    // Reset the singleton by clearing the instance
    (ConfigManager as any).instance = undefined;
    
    // Set up test environment variables
    process.env['BINANCE_API_KEY'] = 'test_api_key_64_characters_long_for_testing_purposes_only';
    process.env['BINANCE_SECRET_KEY'] = 'test_secret_key_64_characters_long_for_testing_purposes_only';
    process.env['JWT_SECRET'] = 'test_jwt_secret_64_characters_long_for_testing_purposes_only';
    process.env['ENCRYPTION_KEY'] = 'test_encryption_key_64_characters_long_for_testing_purposes_only';
    
    cryptoUtils = CryptoUtils.getInstance();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env['BINANCE_API_KEY'];
    delete process.env['BINANCE_SECRET_KEY'];
    delete process.env['JWT_SECRET'];
    delete process.env['ENCRYPTION_KEY'];
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = CryptoUtils.getInstance();
      const instance2 = CryptoUtils.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateSignature', () => {
    it('should generate HMAC SHA256 signature', () => {
      const queryString = 'symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&quantity=1&price=50000&timestamp=1234567890';
      const signature = cryptoUtils.generateSignature(queryString);
      
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex string length
    });

    it('should generate consistent signatures for same input', () => {
      const queryString = 'symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&quantity=1&price=50000&timestamp=1234567890';
      const signature1 = cryptoUtils.generateSignature(queryString);
      const signature2 = cryptoUtils.generateSignature(queryString);
      
      expect(signature1).toBe(signature2);
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from parameters', () => {
      const params = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 1,
        price: 50000
      };
      
      const queryString = cryptoUtils.buildQueryString(params);
      
      expect(queryString).toContain('symbol=BTCUSDT');
      expect(queryString).toContain('side=BUY');
      expect(queryString).toContain('type=LIMIT');
      expect(queryString).toContain('quantity=1');
      expect(queryString).toContain('price=50000');
    });

    it('should handle undefined and null values', () => {
      const params = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        quantity: undefined,
        price: null
      };
      
      const queryString = cryptoUtils.buildQueryString(params);
      
      expect(queryString).toContain('symbol=BTCUSDT');
      expect(queryString).toContain('side=BUY');
      expect(queryString).not.toContain('quantity=');
      expect(queryString).not.toContain('price=');
    });
  });

  describe('addSignatureToParams', () => {
    it('should add timestamp and signature to parameters', () => {
      const params = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 1,
        price: 50000
      };
      
      const result = cryptoUtils.addSignatureToParams(params);
      
      expect(result['symbol']).toBe('BTCUSDT');
      expect(result['side']).toBe('BUY');
      expect(result['type']).toBe('LIMIT');
      expect(result['quantity']).toBe(1);
      expect(result['price']).toBe(50000);
      expect(result['timestamp']).toBeDefined();
      expect(typeof result['timestamp']).toBe('number');
      expect(result['signature']).toBeDefined();
      expect(typeof result['signature']).toBe('string');
      expect(result['signature'].length).toBe(64);
    });

    it('should use provided timestamp', () => {
      const params = { symbol: 'BTCUSDT' };
      const timestamp = 1234567890;
      
      const result = cryptoUtils.addSignatureToParams(params, timestamp);
      
      expect(result['timestamp']).toBe(timestamp);
    });
  });

  describe('generateClientOrderId', () => {
    it('should generate client order ID with default prefix', () => {
      const clientOrderId = cryptoUtils.generateClientOrderId();
      
      expect(clientOrderId).toBeDefined();
      expect(typeof clientOrderId).toBe('string');
      expect(clientOrderId).toMatch(/^bot_\d+_[a-z0-9]+$/);
    });

    it('should generate client order ID with custom prefix', () => {
      const clientOrderId = cryptoUtils.generateClientOrderId('custom');
      
      expect(clientOrderId).toBeDefined();
      expect(typeof clientOrderId).toBe('string');
      expect(clientOrderId).toMatch(/^custom_\d+_[a-z0-9]+$/);
    });

    it('should generate unique client order IDs', () => {
      const id1 = cryptoUtils.generateClientOrderId();
      const id2 = cryptoUtils.generateClientOrderId();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct API key format', () => {
      const validApiKey = 'a'.repeat(64);
      const isValid = cryptoUtils.validateApiKey(validApiKey);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid API key format', () => {
      const invalidApiKeys = [
        'short',
        'a'.repeat(63),
        'a'.repeat(65),
        'a'.repeat(64) + '!',
        ''
      ];
      
      invalidApiKeys.forEach(apiKey => {
        const isValid = cryptoUtils.validateApiKey(apiKey);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validateSecretKey', () => {
    it('should validate correct secret key format', () => {
      const validSecretKey = 'a'.repeat(64);
      const isValid = cryptoUtils.validateSecretKey(validSecretKey);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid secret key format', () => {
      const invalidSecretKeys = [
        'short',
        'a'.repeat(63),
        'a'.repeat(65),
        'a'.repeat(64) + '!',
        ''
      ];
      
      invalidSecretKeys.forEach(secretKey => {
        const isValid = cryptoUtils.validateSecretKey(secretKey);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('generateSecureRandom', () => {
    it('should generate secure random string with default length', () => {
      const random = cryptoUtils.generateSecureRandom();
      
      expect(random).toBeDefined();
      expect(typeof random).toBe('string');
      expect(random.length).toBe(32);
      expect(random).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate secure random string with custom length', () => {
      const length = 16;
      const random = cryptoUtils.generateSecureRandom(length);
      
      expect(random).toBeDefined();
      expect(typeof random).toBe('string');
      expect(random.length).toBe(length);
      expect(random).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate unique random strings', () => {
      const random1 = cryptoUtils.generateSecureRandom();
      const random2 = cryptoUtils.generateSecureRandom();
      
      expect(random1).not.toBe(random2);
    });
  });
});

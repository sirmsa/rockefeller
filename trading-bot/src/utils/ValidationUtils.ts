import { ValidationError } from './errors/CustomErrors';

export interface ValidationRule {
  field: string;
  value: any;
  rule: string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationUtils {
  /**
   * Validate symbol format (e.g., BTCUSDT, ETHUSDT)
   */
  public static validateSymbol(symbol: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!symbol) {
      errors.push(new ValidationError('Symbol is required', 'symbol', symbol, 'required'));
    } else if (typeof symbol !== 'string') {
      errors.push(new ValidationError('Symbol must be a string', 'symbol', symbol, 'string'));
    } else if (!/^[A-Z0-9]{3,20}$/.test(symbol)) {
      errors.push(new ValidationError('Symbol must be 3-20 uppercase alphanumeric characters', 'symbol', symbol, 'format'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate quantity (positive number with proper precision)
   */
  public static validateQuantity(quantity: number, _symbol?: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (quantity === null || quantity === undefined) {
      errors.push(new ValidationError('Quantity is required', 'quantity', quantity, 'required'));
    } else if (typeof quantity !== 'number') {
      errors.push(new ValidationError('Quantity must be a number', 'quantity', quantity, 'number'));
    } else if (quantity <= 0) {
      errors.push(new ValidationError('Quantity must be positive', 'quantity', quantity, 'positive'));
    } else if (!isFinite(quantity)) {
      errors.push(new ValidationError('Quantity must be finite', 'quantity', quantity, 'finite'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate price (positive number with proper precision)
   */
  public static validatePrice(price: number, _symbol?: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (price === null || price === undefined) {
      errors.push(new ValidationError('Price is required', 'price', price, 'required'));
    } else if (typeof price !== 'number') {
      errors.push(new ValidationError('Price must be a number', 'price', price, 'number'));
    } else if (price <= 0) {
      errors.push(new ValidationError('Price must be positive', 'price', price, 'positive'));
    } else if (!isFinite(price)) {
      errors.push(new ValidationError('Price must be finite', 'price', price, 'finite'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate order type
   */
  public static validateOrderType(orderType: string): ValidationResult {
    const validOrderTypes = [
      'MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_LIMIT',
      'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT', 'LIMIT_MAKER'
    ];

    const errors: ValidationError[] = [];

    if (!orderType) {
      errors.push(new ValidationError('Order type is required', 'orderType', orderType, 'required'));
    } else if (!validOrderTypes.includes(orderType)) {
      errors.push(new ValidationError(`Order type must be one of: ${validOrderTypes.join(', ')}`, 'orderType', orderType, 'enum'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate order side
   */
  public static validateOrderSide(side: string): ValidationResult {
    const validSides = ['BUY', 'SELL'];

    const errors: ValidationError[] = [];

    if (!side) {
      errors.push(new ValidationError('Order side is required', 'side', side, 'required'));
    } else if (!validSides.includes(side)) {
      errors.push(new ValidationError('Order side must be BUY or SELL', 'side', side, 'enum'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate time in force
   */
  public static validateTimeInForce(timeInForce: string): ValidationResult {
    const validTimeInForce = ['GTC', 'IOC', 'FOK'];

    const errors: ValidationError[] = [];

    if (!timeInForce) {
      errors.push(new ValidationError('Time in force is required', 'timeInForce', timeInForce, 'required'));
    } else if (!validTimeInForce.includes(timeInForce)) {
      errors.push(new ValidationError(`Time in force must be one of: ${validTimeInForce.join(', ')}`, 'timeInForce', timeInForce, 'enum'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate portfolio budget
   */
  public static validatePortfolioBudget(budget: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (budget === null || budget === undefined) {
      errors.push(new ValidationError('Portfolio budget is required', 'budget', budget, 'required'));
    } else if (typeof budget !== 'number') {
      errors.push(new ValidationError('Portfolio budget must be a number', 'budget', budget, 'number'));
    } else if (budget < 0) {
      errors.push(new ValidationError('Portfolio budget cannot be negative', 'budget', budget, 'non-negative'));
    } else if (!isFinite(budget)) {
      errors.push(new ValidationError('Portfolio budget must be finite', 'budget', budget, 'finite'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate risk level
   */
  public static validateRiskLevel(riskLevel: string): ValidationResult {
    const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];

    const errors: ValidationError[] = [];

    if (!riskLevel) {
      errors.push(new ValidationError('Risk level is required', 'riskLevel', riskLevel, 'required'));
    } else if (!validRiskLevels.includes(riskLevel)) {
      errors.push(new ValidationError(`Risk level must be one of: ${validRiskLevels.join(', ')}`, 'riskLevel', riskLevel, 'enum'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate sentiment score (-1 to 1)
   */
  public static validateSentimentScore(score: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (score === null || score === undefined) {
      errors.push(new ValidationError('Sentiment score is required', 'sentimentScore', score, 'required'));
    } else if (typeof score !== 'number') {
      errors.push(new ValidationError('Sentiment score must be a number', 'sentimentScore', score, 'number'));
    } else if (score < -1 || score > 1) {
      errors.push(new ValidationError('Sentiment score must be between -1 and 1', 'sentimentScore', score, 'range'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate confidence score (0 to 1)
   */
  public static validateConfidenceScore(confidence: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (confidence === null || confidence === undefined) {
      errors.push(new ValidationError('Confidence score is required', 'confidence', confidence, 'required'));
    } else if (typeof confidence !== 'number') {
      errors.push(new ValidationError('Confidence score must be a number', 'confidence', confidence, 'number'));
    } else if (confidence < 0 || confidence > 1) {
      errors.push(new ValidationError('Confidence score must be between 0 and 1', 'confidence', confidence, 'range'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate UUID format
   */
  public static validateUUID(uuid: string, fieldName: string = 'id'): ValidationResult {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const errors: ValidationError[] = [];

    if (!uuid) {
      errors.push(new ValidationError(`${fieldName} is required`, fieldName, uuid, 'required'));
    } else if (typeof uuid !== 'string') {
      errors.push(new ValidationError(`${fieldName} must be a string`, fieldName, uuid, 'string'));
    } else if (!uuidRegex.test(uuid)) {
      errors.push(new ValidationError(`${fieldName} must be a valid UUID`, fieldName, uuid, 'uuid'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  public static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const errors: ValidationError[] = [];

    if (!email) {
      errors.push(new ValidationError('Email is required', 'email', email, 'required'));
    } else if (typeof email !== 'string') {
      errors.push(new ValidationError('Email must be a string', 'email', email, 'string'));
    } else if (!emailRegex.test(email)) {
      errors.push(new ValidationError('Email must be a valid email address', 'email', email, 'email'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate API key format
   */
  public static validateApiKey(apiKey: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!apiKey) {
      errors.push(new ValidationError('API key is required', 'apiKey', apiKey, 'required'));
    } else if (typeof apiKey !== 'string') {
      errors.push(new ValidationError('API key must be a string', 'apiKey', apiKey, 'string'));
    } else if (apiKey.length < 10) {
      errors.push(new ValidationError('API key must be at least 10 characters long', 'apiKey', apiKey, 'length'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate secret key format
   */
  public static validateSecretKey(secretKey: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!secretKey) {
      errors.push(new ValidationError('Secret key is required', 'secretKey', secretKey, 'required'));
    } else if (typeof secretKey !== 'string') {
      errors.push(new ValidationError('Secret key must be a string', 'secretKey', secretKey, 'string'));
    } else if (secretKey.length < 10) {
      errors.push(new ValidationError('Secret key must be at least 10 characters long', 'secretKey', secretKey, 'length'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate date range
   */
  public static validateDateRange(startDate: Date, endDate: Date): ValidationResult {
    const errors: ValidationError[] = [];

    if (!startDate) {
      errors.push(new ValidationError('Start date is required', 'startDate', startDate, 'required'));
    } else if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      errors.push(new ValidationError('Start date must be a valid date', 'startDate', startDate, 'date'));
    }

    if (!endDate) {
      errors.push(new ValidationError('End date is required', 'endDate', endDate, 'required'));
    } else if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      errors.push(new ValidationError('End date must be a valid date', 'endDate', endDate, 'date'));
    }

    if (startDate && endDate && startDate >= endDate) {
      errors.push(new ValidationError('Start date must be before end date', 'dateRange', { startDate, endDate }, 'range'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate array of values
   */
  public static validateArray<T>(array: T[], fieldName: string = 'array', minLength: number = 0, maxLength?: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(array)) {
      errors.push(new ValidationError(`${fieldName} must be an array`, fieldName, array, 'array'));
    } else if (array.length < minLength) {
      errors.push(new ValidationError(`${fieldName} must have at least ${minLength} items`, fieldName, array, 'minLength'));
    } else if (maxLength && array.length > maxLength) {
      errors.push(new ValidationError(`${fieldName} must have at most ${maxLength} items`, fieldName, array, 'maxLength'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate object structure
   */
  public static validateObject(obj: any, requiredFields: string[], fieldName: string = 'object'): ValidationResult {
    const errors: ValidationError[] = [];

    if (!obj || typeof obj !== 'object') {
      errors.push(new ValidationError(`${fieldName} must be an object`, fieldName, obj, 'object'));
    } else {
      for (const field of requiredFields) {
        if (!(field in obj)) {
          errors.push(new ValidationError(`Field '${field}' is required in ${fieldName}`, field, undefined, 'required'));
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Combine multiple validation results
   */
  public static combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    let isValid = true;

    for (const result of results) {
      if (!result.isValid) {
        isValid = false;
        allErrors.push(...result.errors);
      }
    }

    return {
      isValid,
      errors: allErrors
    };
  }

  /**
   * Throw validation error if validation fails
   */
  public static throwIfInvalid(result: ValidationResult, context?: string): void {
    if (!result.isValid) {
      const errorMessage = result.errors.map(error => 
        `${error.field}: ${error.message}`
      ).join(', ');
      
      throw new ValidationError(
        `Validation failed${context ? ` for ${context}` : ''}: ${errorMessage}`,
        undefined,
        undefined,
        'validation',
        { errors: result.errors }
      );
    }
  }
}

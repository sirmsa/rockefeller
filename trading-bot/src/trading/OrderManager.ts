import { EventEmitter } from 'events';
import { BinanceManager } from './BinanceManager';

// Order Management Interfaces
export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  clientOrderId?: string;
}

export interface OrderStatus {
  orderId: string;
  symbol: string;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED';
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT_LIMIT';
  quantity: number;
  executedQty: number;
  remainingQty: number;
  price: number;
  averagePrice: number;
  commission: number;
  commissionAsset: string;
  time: Date;
  updateTime: Date;
  clientOrderId?: string;
}

export interface OrderValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OrderConfig {
  maxOrdersPerSymbol: number;
  maxOrderValue: number; // Maximum order value in USDT
  minOrderValue: number; // Minimum order value in USDT
  maxSlippage: number; // Maximum allowed slippage percentage
  enableOrderValidation: boolean;
  enableOrderMonitoring: boolean;
  orderTimeout: number; // Order timeout in milliseconds
  retryAttempts: number; // Number of retry attempts for failed orders
  retryDelay: number; // Delay between retries in milliseconds
}

export class OrderManager extends EventEmitter {
  private static instance: OrderManager;
  private config: OrderConfig;
  private activeOrders: Map<string, OrderStatus> = new Map();
  private orderHistory: Map<string, OrderStatus[]> = new Map();
  private orderValidationRules: Map<string, (order: OrderRequest) => OrderValidation> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  private binanceManager: BinanceManager;

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.binanceManager = BinanceManager.getInstance();
    this.initializeValidationRules();
  }

  public static getInstance(): OrderManager {
    if (!OrderManager.instance) {
      OrderManager.instance = new OrderManager();
    }
    return OrderManager.instance;
  }

  private getDefaultConfig(): OrderConfig {
    return {
      maxOrdersPerSymbol: 5,
      maxOrderValue: 10000, // $10,000 max order value
      minOrderValue: 10, // $10 min order value
      maxSlippage: 0.02, // 2% maximum slippage
      enableOrderValidation: true,
      enableOrderMonitoring: true,
      orderTimeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000 // 1 second
    };
  }

  public updateConfig(newConfig: Partial<OrderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): OrderConfig {
    return { ...this.config };
  }

  private initializeValidationRules(): void {
    // Basic order validation
    this.orderValidationRules.set('basic', (order: OrderRequest): OrderValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check required fields
      if (!order.symbol) errors.push('Symbol is required');
      if (!order.side) errors.push('Side is required');
      if (!order.type) errors.push('Type is required');
      if (!order.quantity) errors.push('Quantity is required');

      // Check quantity
      const quantity = order.quantity;
      if (isNaN(quantity) || quantity <= 0) {
        errors.push('Quantity must be a positive number');
      }

      // Check price for limit orders
      if (order.type === 'LIMIT' && (!order.price || order.price <= 0)) {
        errors.push('Price is required for limit orders');
      }

      // Check stop price for stop orders
      if ((order.type === 'STOP_LOSS' || order.type === 'TAKE_PROFIT') && !order.stopPrice) {
        errors.push('Stop price is required for stop orders');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });

    // Value validation
    this.orderValidationRules.set('value', (order: OrderRequest): OrderValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const quantity = order.quantity;
      const price = order.price ? order.price : 0;

      if (price > 0) {
        const orderValue = quantity * price;
        
        if (orderValue > this.config.maxOrderValue) {
          errors.push(`Order value (${orderValue}) exceeds maximum allowed (${this.config.maxOrderValue})`);
        }
        
        if (orderValue < this.config.minOrderValue) {
          errors.push(`Order value (${orderValue}) is below minimum required (${this.config.minOrderValue})`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });

    // Quantity validation
    this.orderValidationRules.set('quantity', (order: OrderRequest): OrderValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const quantity = order.quantity;
      
      // Check for reasonable quantity (not too small or too large)
      if (quantity < 0.0001) {
        warnings.push('Quantity is very small, may not be executed');
      }
      
      if (quantity > 1000000) {
        warnings.push('Quantity is very large, may impact market');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });
  }

  public validateOrder(order: OrderRequest): OrderValidation {
    if (!this.config.enableOrderValidation) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Run all validation rules
    for (const [, validationRule] of this.orderValidationRules) {
      const validation = validationRule(order);
      allErrors.push(...validation.errors);
      allWarnings.push(...validation.warnings);
    }

    // Check active orders limit
    const activeOrdersForSymbol = this.getActiveOrdersForSymbol(order.symbol);
    if (activeOrdersForSymbol.length >= this.config.maxOrdersPerSymbol) {
      allErrors.push(`Maximum orders per symbol (${this.config.maxOrdersPerSymbol}) reached`);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  public async placeOrder(orderRequest: OrderRequest): Promise<OrderStatus> {
    try {
      // Validate order
      const validation = this.validateOrder(orderRequest);
      if (!validation.isValid) {
        throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
      }

      // Log warnings
      if (validation.warnings.length > 0) {
        this.emit('order_warning', { order: orderRequest, warnings: validation.warnings });
      }

      // Place order with retry logic
      let orderStatus: OrderStatus;
      let lastError: Error;

      for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
        try {
          const binanceOrder = await this.binanceManager.placeOrder(orderRequest);
          
          orderStatus = {
            orderId: binanceOrder.orderId.toString(),
            symbol: binanceOrder.symbol,
            status: binanceOrder.status as any,
            side: binanceOrder.side as 'BUY' | 'SELL',
            type: binanceOrder.type as any,
            quantity: parseFloat(binanceOrder.origQty),
            executedQty: parseFloat(binanceOrder.executedQty),
            remainingQty: parseFloat(binanceOrder.origQty) - parseFloat(binanceOrder.executedQty),
            price: parseFloat(binanceOrder.price),
            averagePrice: parseFloat(binanceOrder.price), // Use price as average price
            commission: binanceOrder.fills?.[0]?.commission ? parseFloat(binanceOrder.fills[0].commission) : 0,
            commissionAsset: binanceOrder.fills?.[0]?.commissionAsset || '',
            time: new Date(binanceOrder.transactTime),
            updateTime: new Date(binanceOrder.transactTime),
            clientOrderId: binanceOrder.clientOrderId
          };

          // Add to active orders
          this.activeOrders.set(orderStatus.orderId, orderStatus);

          // Start monitoring if enabled
          if (this.config.enableOrderMonitoring) {
            this.startOrderMonitoring(orderStatus.orderId);
          }

          // Add to history
          this.addOrderToHistory(orderStatus);

          this.emit('order_placed', orderStatus);
          return orderStatus;

        } catch (error) {
          lastError = error as Error;
          
          if (attempt < this.config.retryAttempts) {
            await this.delay(this.config.retryDelay);
            this.emit('order_retry', { order: orderRequest, attempt, error: lastError.message });
          }
        }
      }

      throw lastError!;

    } catch (error) {
      this.emit('order_error', { order: orderRequest, error: (error as Error).message });
      throw error;
    }
  }

  public async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const order = this.activeOrders.get(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      await this.binanceManager.cancelOrder(order.symbol, parseInt(orderId));
      
      // Update order status
      order.status = 'CANCELED';
      order.updateTime = new Date();
      
      // Remove from active orders
      this.activeOrders.delete(orderId);
      
      // Stop monitoring
      this.stopOrderMonitoring(orderId);

      this.emit('order_canceled', order);
      return true;

    } catch (error) {
      this.emit('cancel_error', { orderId, error: (error as Error).message });
      return false;
    }
  }

  public async cancelAllOrders(symbol?: string): Promise<boolean[]> {
    const ordersToCancel = symbol 
      ? this.getActiveOrdersForSymbol(symbol)
      : Array.from(this.activeOrders.values());

    const cancelPromises = ordersToCancel.map(order => this.cancelOrder(order.orderId));
    return Promise.all(cancelPromises);
  }

  public async getOrderStatus(orderId: string): Promise<OrderStatus | null> {
    try {
      const order = this.activeOrders.get(orderId);
      if (!order) {
        return null;
      }

      // Get updated status from Binance
      const binanceOrder = await this.binanceManager.getOrder(order.symbol, parseInt(orderId));
      
      const updatedOrder: OrderStatus = {
        orderId: binanceOrder.orderId.toString(),
        symbol: binanceOrder.symbol,
        status: binanceOrder.status as any,
        side: binanceOrder.side as 'BUY' | 'SELL',
        type: binanceOrder.type as any,
        quantity: parseFloat(binanceOrder.origQty),
        executedQty: parseFloat(binanceOrder.executedQty),
        remainingQty: parseFloat(binanceOrder.origQty) - parseFloat(binanceOrder.executedQty),
        price: parseFloat(binanceOrder.price),
        averagePrice: parseFloat(binanceOrder.price), // Use price as average price
        commission: binanceOrder.fills?.[0]?.commission ? parseFloat(binanceOrder.fills[0].commission) : 0,
        commissionAsset: binanceOrder.fills?.[0]?.commissionAsset || '',
        time: new Date(binanceOrder.transactTime),
        updateTime: new Date(binanceOrder.transactTime),
        clientOrderId: binanceOrder.clientOrderId
      };

      // Update active order
      this.activeOrders.set(orderId, updatedOrder);

      // Check if order is completed
      if (updatedOrder.status === 'FILLED' || updatedOrder.status === 'CANCELED' || updatedOrder.status === 'REJECTED') {
        this.activeOrders.delete(orderId);
        this.stopOrderMonitoring(orderId);
        this.emit('order_completed', updatedOrder);
      }

      return updatedOrder;

    } catch (error) {
      this.emit('status_error', { orderId, error: (error as Error).message });
      return null;
    }
  }

  private startOrderMonitoring(orderId: string): void {
    if (this.monitoringIntervals.has(orderId)) {
      return; // Already monitoring
    }

    const interval = setInterval(async () => {
      try {
        await this.getOrderStatus(orderId);
      } catch (error) {
        this.emit('monitoring_error', { orderId, error: (error as Error).message });
      }
    }, 5000); // Check every 5 seconds

    this.monitoringIntervals.set(orderId, interval);

    // Set timeout to stop monitoring
    setTimeout(() => {
      this.stopOrderMonitoring(orderId);
    }, this.config.orderTimeout);
  }

  private stopOrderMonitoring(orderId: string): void {
    const interval = this.monitoringIntervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(orderId);
    }
  }

  private addOrderToHistory(order: OrderStatus): void {
    const history = this.orderHistory.get(order.symbol) || [];
    history.push(order);
    
    // Keep only last 100 orders per symbol
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.orderHistory.set(order.symbol, history);
  }

  public getActiveOrdersForSymbol(symbol: string): OrderStatus[] {
    return Array.from(this.activeOrders.values())
      .filter(order => order.symbol === symbol);
  }

  public getAllActiveOrders(): OrderStatus[] {
    return Array.from(this.activeOrders.values());
  }

  public getOrderHistory(symbol: string): OrderStatus[] {
    return this.orderHistory.get(symbol) || [];
  }

  public getOrder(orderId: string): OrderStatus | undefined {
    return this.activeOrders.get(orderId);
  }

  public getStatus(): { 
    activeOrders: number; 
    monitoringOrders: number; 
    orderHistorySize: number 
  } {
    return {
      activeOrders: this.activeOrders.size,
      monitoringOrders: this.monitoringIntervals.size,
      orderHistorySize: this.orderHistory.size
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

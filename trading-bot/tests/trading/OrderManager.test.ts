import { OrderManager, OrderRequest, OrderConfig } from '../../src/trading/OrderManager';
import { BinanceManager } from '../../src/trading/BinanceManager';

// Mock BinanceManager
jest.mock('../../src/trading/BinanceManager');

describe('OrderManager', () => {
  let orderManager: OrderManager;
  let mockBinanceManager: jest.Mocked<BinanceManager>;

  beforeEach(() => {
    // Reset singleton instance
    (OrderManager as any).instance = undefined;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get mocked instance (simplified approach)
    mockBinanceManager = BinanceManager.getInstance() as any;
    
    // Setup default mock implementations
    mockBinanceManager.placeOrder = jest.fn().mockResolvedValue({
      orderId: 12345,
      symbol: 'BTCUSDT',
      status: 'FILLED',
      side: 'BUY',
      type: 'MARKET',
      origQty: '1.0',
      executedQty: '1.0',
      price: '100.0',
      avgPrice: '100.0',
      commission: '0.1',
      commissionAsset: 'USDT',
      time: Date.now(),
      updateTime: Date.now(),
      clientOrderId: 'test_client_id'
    });

    mockBinanceManager.getOrder = jest.fn().mockResolvedValue({
      orderId: 12345,
      symbol: 'BTCUSDT',
      status: 'FILLED',
      side: 'BUY',
      type: 'MARKET',
      origQty: '1.0',
      executedQty: '1.0',
      price: '100.0',
      avgPrice: '100.0',
      commission: '0.1',
      commissionAsset: 'USDT',
      time: Date.now(),
      updateTime: Date.now(),
      clientOrderId: 'test_client_id'
    });

    mockBinanceManager.cancelOrder = jest.fn().mockResolvedValue({
      orderId: 12345,
      symbol: 'BTCUSDT',
      status: 'CANCELED',
      side: 'BUY',
      type: 'MARKET',
      origQty: '1.0',
      executedQty: '0.0',
      price: '100.0',
      avgPrice: '0.0',
      commission: '0.0',
      commissionAsset: 'USDT',
      time: Date.now(),
      updateTime: Date.now(),
      clientOrderId: 'test_client_id'
    });

    orderManager = OrderManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = OrderManager.getInstance();
      const instance2 = OrderManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = orderManager.getConfig();
      expect(config.maxOrdersPerSymbol).toBe(5);
      expect(config.maxOrderValue).toBe(10000);
      expect(config.minOrderValue).toBe(10);
      expect(config.maxSlippage).toBe(0.02);
      expect(config.enableOrderValidation).toBe(true);
      expect(config.enableOrderMonitoring).toBe(true);
      expect(config.orderTimeout).toBe(30000);
      expect(config.retryAttempts).toBe(3);
      expect(config.retryDelay).toBe(1000);
    });

    it('should update configuration', () => {
      const newConfig: Partial<OrderConfig> = {
        maxOrdersPerSymbol: 10,
        maxOrderValue: 20000,
        enableOrderValidation: false
      };

      const eventSpy = jest.fn();
      orderManager.on('config_updated', eventSpy);

      orderManager.updateConfig(newConfig);
      const config = orderManager.getConfig();

      expect(config.maxOrdersPerSymbol).toBe(10);
      expect(config.maxOrderValue).toBe(20000);
      expect(config.enableOrderValidation).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('Order Validation', () => {
    it('should validate valid order', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject order with missing symbol', () => {
      const orderRequest: OrderRequest = {
        symbol: '',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Symbol is required');
    });

    it('should reject order with missing side', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: '' as any,
        type: 'MARKET',
        quantity: 1.0
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Side is required');
    });

    it('should reject order with missing quantity', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 0
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Quantity is required');
    });

    it('should reject order with invalid quantity', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: -1.0
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Quantity must be a positive number');
    });

    it('should reject limit order without price', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 1.0
        // Missing price
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Price is required for limit orders');
    });

    it('should reject stop order without stop price', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'STOP_LOSS',
        quantity: 1.0
        // Missing stopPrice
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Stop price is required for stop orders');
    });

    it('should warn about very small quantity', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 0.00001
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Quantity is very small, may not be executed');
    });

    it('should warn about very large quantity', () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 10000000
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Quantity is very large, may impact market');
    });

    it('should skip validation when disabled', () => {
      orderManager.updateConfig({ enableOrderValidation: false });

      const orderRequest: OrderRequest = {
        symbol: '',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const validation = orderManager.validateOrder(orderRequest);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Order Placement', () => {
    it('should place order successfully', async () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const eventSpy = jest.fn();
      orderManager.on('order_placed', eventSpy);

      const order = await orderManager.placeOrder(orderRequest);

      expect(order).toBeDefined();
      expect(order.orderId).toBe('12345');
      expect(order.symbol).toBe('BTCUSDT');
      expect(order.side).toBe('BUY');
      expect(order.type).toBe('MARKET');
      expect(order.status).toBe('FILLED');
      expect(mockBinanceManager.placeOrder).toHaveBeenCalledWith(orderRequest);
      expect(eventSpy).toHaveBeenCalledWith(order);
    });

    it('should handle order placement errors', async () => {
      mockBinanceManager.placeOrder = jest.fn().mockRejectedValue(new Error('API Error'));

      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const eventSpy = jest.fn();
      orderManager.on('order_error', eventSpy);

      await expect(orderManager.placeOrder(orderRequest)).rejects.toThrow('API Error');
      expect(eventSpy).toHaveBeenCalledWith({
        order: orderRequest,
        error: 'API Error'
      });
    });

    it('should retry failed orders', async () => {
      let attemptCount = 0;
      mockBinanceManager.placeOrder = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary error');
        }
        return Promise.resolve({
          orderId: 12345,
          symbol: 'BTCUSDT',
          status: 'FILLED',
          side: 'BUY',
          type: 'MARKET',
          origQty: '1.0',
          executedQty: '1.0',
          price: '100.0',
          avgPrice: '100.0',
          commission: '0.1',
          commissionAsset: 'USDT',
          time: Date.now(),
          updateTime: Date.now(),
          clientOrderId: 'test_client_id'
        });
      });

      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const retrySpy = jest.fn();
      orderManager.on('order_retry', retrySpy);

      const order = await orderManager.placeOrder(orderRequest);

      expect(order).toBeDefined();
      expect(retrySpy).toHaveBeenCalledTimes(2);
      expect(mockBinanceManager.placeOrder).toHaveBeenCalledTimes(3);
    });

    it('should emit warnings for order validation warnings', async () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 0.00001 // Very small quantity
      };

      const warningSpy = jest.fn();
      orderManager.on('order_warning', warningSpy);

      await orderManager.placeOrder(orderRequest);

      expect(warningSpy).toHaveBeenCalledWith({
        order: orderRequest,
        warnings: ['Quantity is very small, may not be executed']
      });
    });
  });

  describe('Order Cancellation', () => {
    it('should cancel order successfully', async () => {
      // First place an order
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const order = await orderManager.placeOrder(orderRequest);
      const orderId = order.orderId;

      const eventSpy = jest.fn();
      orderManager.on('order_canceled', eventSpy);

      const result = await orderManager.cancelOrder(orderId);

      expect(result).toBe(true);
      expect(mockBinanceManager.cancelOrder).toHaveBeenCalledWith('BTCUSDT', orderId);
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle cancellation errors', async () => {
      mockBinanceManager.cancelOrder = jest.fn().mockRejectedValue(new Error('Cancel failed'));

      const eventSpy = jest.fn();
      orderManager.on('cancel_error', eventSpy);

      const result = await orderManager.cancelOrder('non-existent');

      expect(result).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith({
        orderId: 'non-existent',
        error: 'Cancel failed'
      });
    });

    it('should cancel all orders for symbol', async () => {
      // Place multiple orders
      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'SELL',
        type: 'MARKET',
        quantity: 1.0
      });

      const results = await orderManager.cancelAllOrders('BTCUSDT');

      expect(results).toHaveLength(2);
      expect(results.every(result => result === true)).toBe(true);
    });

    it('should cancel all orders when no symbol specified', async () => {
      // Place orders for different symbols
      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      await orderManager.placeOrder({
        symbol: 'ETHUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      const results = await orderManager.cancelAllOrders();

      expect(results).toHaveLength(2);
      expect(results.every(result => result === true)).toBe(true);
    });
  });

  describe('Order Status', () => {
    it('should get order status', async () => {
      const orderRequest: OrderRequest = {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      };

      const order = await orderManager.placeOrder(orderRequest);
      const orderId = order.orderId;

      const status = await orderManager.getOrderStatus(orderId);

      expect(status).toBeDefined();
      expect(status?.orderId).toBe(orderId);
      expect(mockBinanceManager.getOrder).toHaveBeenCalledWith('BTCUSDT', orderId);
    });

    it('should return null for non-existent order', async () => {
      const status = await orderManager.getOrderStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should handle status errors', async () => {
      mockBinanceManager.getOrder = jest.fn().mockRejectedValue(new Error('Status error'));

      const eventSpy = jest.fn();
      orderManager.on('status_error', eventSpy);

      const status = await orderManager.getOrderStatus('test-order');

      expect(status).toBeNull();
      expect(eventSpy).toHaveBeenCalledWith({
        orderId: 'test-order',
        error: 'Status error'
      });
    });
  });

  describe('Order Management', () => {
    it('should get active orders for symbol', async () => {
      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'SELL',
        type: 'MARKET',
        quantity: 1.0
      });

      const orders = orderManager.getActiveOrdersForSymbol('BTCUSDT');
      expect(orders).toHaveLength(2);
      expect(orders.every(order => order.symbol === 'BTCUSDT')).toBe(true);
    });

    it('should get all active orders', async () => {
      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      await orderManager.placeOrder({
        symbol: 'ETHUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      const orders = orderManager.getAllActiveOrders();
      expect(orders).toHaveLength(2);
    });

    it('should get order by ID', async () => {
      const order = await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      const foundOrder = orderManager.getOrder(order.orderId);
      expect(foundOrder).toBeDefined();
      expect(foundOrder?.orderId).toBe(order.orderId);
    });

    it('should return undefined for non-existent order', () => {
      const order = orderManager.getOrder('non-existent');
      expect(order).toBeUndefined();
    });
  });

  describe('Order History', () => {
    it('should add orders to history', async () => {
      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      const history = orderManager.getOrderHistory('BTCUSDT');
      expect(history).toHaveLength(1);
      expect(history[0]?.symbol).toBe('BTCUSDT');
    });

    it('should return empty array for unknown symbol', () => {
      const history = orderManager.getOrderHistory('UNKNOWN');
      expect(history).toEqual([]);
    });
  });

  describe('Status Management', () => {
    it('should return correct status', () => {
      const status = orderManager.getStatus();
      
      expect(status.activeOrders).toBe(0);
      expect(status.monitoringOrders).toBe(0);
      expect(status.orderHistorySize).toBe(0);
    });

    it('should update status after placing orders', async () => {
      await orderManager.placeOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1.0
      });

      const status = orderManager.getStatus();
      
      expect(status.activeOrders).toBe(1);
      expect(status.monitoringOrders).toBe(1);
      expect(status.orderHistorySize).toBe(1);
    });
  });
});

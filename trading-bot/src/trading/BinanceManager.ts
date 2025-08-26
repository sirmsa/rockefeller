import Binance from 'binance-api-node';
import Logger from '@/logging/Logger';
import ConfigManager from '@/core/ConfigManager';
import RateLimiter from '@/utils/RateLimiter';
import { WebSocketManager } from '@/utils/WebSocketManager';
import CryptoUtils from '@/utils/CryptoUtils';
import { 
  BinanceAPIError, 
  RateLimitError, 
  WebSocketError
} from '@/utils/errors/CustomErrors';
import { ErrorRecovery } from '@/utils/errors/ErrorRecovery';

export interface BinanceConfig {
  apiKey: string;
  secretKey: string;
  testnet: boolean;
  recvWindow: number;
  useServerTime: boolean;
}

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER';
  quantity?: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  newClientOrderId?: string;
  icebergQty?: number;
  newOrderRespType?: 'ACK' | 'RESULT' | 'FULL';
}

export interface OrderResponse {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  fills?: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
  }>;
}

export interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
  permissions: string[];
}

export interface SymbolInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: Array<{
    filterType: string;
    [key: string]: any;
  }>;
  permissions: string[];
}

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignore: string;
}

export interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface UserDataStreamEvent {
  e: string; // Event type
  E: number; // Event time
  s?: string; // Symbol
  c?: string; // Client order ID / Contingency type
  S?: string; // Side
  o?: string; // Order type / Order list ID
  f?: string; // Time in force
  q?: string; // Original quantity
  p?: string; // Price
  ap?: string; // Average price
  sp?: string; // Stop price
  x?: string; // Execution type
  X?: string; // Order status
  i?: number; // Order ID
  l?: string; // Last filled quantity / List status type
  z?: string; // Filled accumulated quantity
  L?: string; // Last filled price / List order status
  n?: string; // Commission / Transaction time
  N?: string; // Commission asset / List client order ID
  T?: number; // Trade time / Transaction time
  t?: number; // Trade ID
  b?: string; // Bids notional
  a?: string; // Asks notional
  B?: string; // Bids quantity
  A?: string; // Asks quantity
}

export class BinanceManager {
  private static instance: BinanceManager;
  private client: any;
  private logger = Logger.getInstance();
  private config = ConfigManager.getInstance();
  private rateLimiter = RateLimiter.getInstance();
  private wsManager = WebSocketManager.getInstance();
  private cryptoUtils = CryptoUtils.getInstance();
  private errorRecovery = ErrorRecovery.getInstance();
  
  private userDataStreamListenKey: string | null = null;
  private serverTimeOffset: number = 0;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;

  private constructor() {
    this.initializeClient();
  }

  public static getInstance(): BinanceManager {
    if (!BinanceManager.instance) {
      BinanceManager.instance = new BinanceManager();
    }
    return BinanceManager.instance;
  }

  /**
   * Initialize Binance client with configuration
   */
  private initializeClient(): void {
    try {
      const binanceConfig = this.config.binanceConfig;
      
      this.client = Binance({
        apiKey: binanceConfig.apiKey,
        apiSecret: binanceConfig.secretKey,
        httpBase: binanceConfig.testnet ? 'https://testnet.binance.vision' : 'https://api.binance.com',
        wsBase: binanceConfig.testnet ? 'wss://testnet.binance.vision' : 'wss://stream.binance.com:9443'
      });

      this.logger.info('Binance client initialized', {
        type: 'BINANCE_CLIENT_INITIALIZED',
        testnet: binanceConfig.testnet,
        recvWindow: binanceConfig.recvWindow,
        useServerTime: binanceConfig.useServerTime
      });

      // Sync server time if enabled
      if (binanceConfig.useServerTime) {
        this.syncServerTime();
      }
    } catch (error) {
      this.logger.error('Failed to initialize Binance client', {
        type: 'BINANCE_CLIENT_INIT_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      throw new BinanceAPIError(
        'Failed to initialize Binance client',
        undefined,
        undefined,
        undefined,
        undefined,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Sync server time with Binance
   */
  private async syncServerTime(): Promise<void> {
    try {
      const serverTime = await this.client.time();
      const localTime = Date.now();
      this.serverTimeOffset = serverTime.serverTime - localTime;

      this.logger.info('Server time synchronized', {
        type: 'BINANCE_SERVER_TIME_SYNC',
        serverTime: serverTime.serverTime,
        localTime,
        offset: this.serverTimeOffset
      });
    } catch (error) {
      this.logger.warn('Failed to sync server time, using local time', {
        type: 'BINANCE_SERVER_TIME_SYNC_FAILED',
        error: error instanceof Error ? error.message : String(error)
      });
      this.serverTimeOffset = 0;
    }
  }



  /**
   * Check rate limits before making API calls
   */
  private async checkRateLimit(endpoint: string): Promise<void> {
    const rateLimitConfig = this.rateLimiter.getDefaultConfigs().restApi;
    const result = await this.rateLimiter.checkLimit(endpoint, rateLimitConfig);
    
    if (!result.allowed) {
      throw new RateLimitError(
        `Rate limit exceeded for ${endpoint}`,
        rateLimitConfig.limit,
        rateLimitConfig.window,
        result.resetTime
      );
    }
  }

  /**
   * Make API call with error handling and retry logic
   */
  private async makeApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    context?: Record<string, any>
  ): Promise<T> {
    return this.errorRecovery.retryWithBackoff(
      async () => {
        await this.checkRateLimit(endpoint);
        
        try {
          const result = await apiCall();
          
          this.logger.debug('API call successful', {
            type: 'BINANCE_API_SUCCESS',
            endpoint,
            context
          });
          
          return result;
        } catch (error) {
          this.errorRecovery.handleAPIError(error, endpoint, context);
          throw error;
        }
      },
      this.errorRecovery.getDefaultRetryConfig(),
      `Binance API: ${endpoint}`
    );
  }

  /**
   * Get exchange information
   */
  public async getExchangeInfo(): Promise<{ symbols: SymbolInfo[] }> {
    return this.makeApiCall(
      () => this.client.exchangeInfo(),
      'exchangeInfo'
    );
  }

  /**
   * Get symbol information
   */
  public async getSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
    const exchangeInfo = await this.getExchangeInfo();
    return exchangeInfo.symbols.find(s => s.symbol === symbol) || null;
  }

  /**
   * Get account information
   */
  public async getAccountInfo(): Promise<AccountInfo> {
    return this.makeApiCall(
      () => this.client.accountInfo(),
      'accountInfo'
    );
  }

  /**
   * Get account balance for specific asset
   */
  public async getBalance(asset: string): Promise<{ free: string; locked: string } | null> {
    const accountInfo = await this.getAccountInfo();
    const balance = accountInfo.balances.find(b => b.asset === asset);
    
    if (!balance) {
      return null;
    }

    return {
      free: balance.free,
      locked: balance.locked
    };
  }

  /**
   * Get 24hr ticker statistics
   */
  public async getTicker24hr(symbol?: string): Promise<TickerData | TickerData[]> {
    if (symbol) {
      return this.makeApiCall(
        () => this.client.dailyStats({ symbol }),
        'ticker24hr'
      );
    } else {
      return this.makeApiCall(
        () => this.client.dailyStats(),
        'ticker24hr'
      );
    }
  }

  /**
   * Get kline/candlestick data
   */
  public async getKlines(
    symbol: string,
    interval: string,
    limit: number = 500,
    startTime?: number,
    endTime?: number
  ): Promise<KlineData[]> {
    const params: any = { symbol, interval, limit };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    return this.makeApiCall(
      () => this.client.candles(params),
      'klines'
    );
  }

  /**
   * Place a new order
   */
  public async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    const params: any = {
      symbol: orderRequest.symbol,
      side: orderRequest.side,
      type: orderRequest.type,
      quantity: orderRequest.quantity,
      price: orderRequest.price,
      stopPrice: orderRequest.stopPrice,
      timeInForce: orderRequest.timeInForce,
      newClientOrderId: orderRequest.newClientOrderId || this.cryptoUtils.generateClientOrderId(),
      icebergQty: orderRequest.icebergQty,
      newOrderRespType: orderRequest.newOrderRespType || 'RESULT'
    };

    this.logger.info('Placing order', {
      type: 'BINANCE_ORDER_PLACE',
      symbol: orderRequest.symbol,
      side: orderRequest.side,
      orderType: orderRequest.type,
      quantity: orderRequest.quantity,
      price: orderRequest.price
    });

    return this.makeApiCall(
      () => this.client.order(params),
      'order',
      { orderRequest }
    );
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(
    symbol: string,
    orderId?: number,
    clientOrderId?: string
  ): Promise<OrderResponse> {
    const params: any = { symbol };
    if (orderId) params.orderId = orderId;
    if (clientOrderId) params.origClientOrderId = clientOrderId;

    this.logger.info('Canceling order', {
      type: 'BINANCE_ORDER_CANCEL',
      symbol,
      orderId,
      clientOrderId
    });

    return this.makeApiCall(
      () => this.client.cancelOrder(params),
      'cancelOrder',
      { symbol, orderId, clientOrderId }
    );
  }

  /**
   * Get order status
   */
  public async getOrder(
    symbol: string,
    orderId?: number,
    clientOrderId?: string
  ): Promise<OrderResponse> {
    const params: any = { symbol };
    if (orderId) params.orderId = orderId;
    if (clientOrderId) params.origClientOrderId = clientOrderId;

    return this.makeApiCall(
      () => this.client.getOrder(params),
      'getOrder',
      { symbol, orderId, clientOrderId }
    );
  }

  /**
   * Get open orders
   */
  public async getOpenOrders(symbol?: string): Promise<OrderResponse[]> {
    const params = symbol ? { symbol } : {};

    return this.makeApiCall(
      () => this.client.openOrders(params),
      'openOrders'
    );
  }

  /**
   * Get all orders
   */
  public async getAllOrders(
    symbol: string,
    orderId?: number,
    limit: number = 500,
    startTime?: number,
    endTime?: number
  ): Promise<OrderResponse[]> {
    const params: any = { symbol, limit };
    if (orderId) params.orderId = orderId;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    return this.makeApiCall(
      () => this.client.allOrders(params),
      'allOrders'
    );
  }

  /**
   * Get recent trades
   */
  public async getRecentTrades(
    symbol: string,
    limit: number = 500
  ): Promise<any[]> {
    return this.makeApiCall(
      () => this.client.trades({ symbol, limit }),
      'recentTrades'
    );
  }

  /**
   * Get order book
   */
  public async getOrderBook(
    symbol: string,
    limit: number = 100
  ): Promise<any> {
    return this.makeApiCall(
      () => this.client.depth({ symbol, limit }),
      'orderBook'
    );
  }

  /**
   * Create user data stream
   */
  public async createUserDataStream(): Promise<string> {
    try {
      const response = await this.client.ws.userDataStream();
      this.userDataStreamListenKey = response.listenKey;
      
      this.logger.info('User data stream created', {
        type: 'BINANCE_USER_DATA_STREAM_CREATED',
        listenKey: this.userDataStreamListenKey
      });

      return this.userDataStreamListenKey || '';
    } catch (error) {
      this.logger.error('Failed to create user data stream', {
        type: 'BINANCE_USER_DATA_STREAM_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      throw new BinanceAPIError(
        'Failed to create user data stream',
        undefined,
        undefined,
        undefined,
        undefined,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Keep user data stream alive
   */
  public async keepUserDataStreamAlive(): Promise<void> {
    if (!this.userDataStreamListenKey) {
      throw new Error('No user data stream active');
    }

    try {
      await this.client.ws.userDataStreamKeepAlive(this.userDataStreamListenKey);
      
      this.logger.debug('User data stream kept alive', {
        type: 'BINANCE_USER_DATA_STREAM_KEEPALIVE',
        listenKey: this.userDataStreamListenKey
      });
    } catch (error) {
      this.logger.error('Failed to keep user data stream alive', {
        type: 'BINANCE_USER_DATA_STREAM_KEEPALIVE_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      throw new BinanceAPIError(
        'Failed to keep user data stream alive',
        undefined,
        undefined,
        undefined,
        undefined,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Close user data stream
   */
  public async closeUserDataStream(): Promise<void> {
    if (!this.userDataStreamListenKey) {
      return;
    }

    try {
      await this.client.ws.userDataStreamClose(this.userDataStreamListenKey);
      
      this.logger.info('User data stream closed', {
        type: 'BINANCE_USER_DATA_STREAM_CLOSED',
        listenKey: this.userDataStreamListenKey
      });

      this.userDataStreamListenKey = null;
    } catch (error) {
      this.logger.error('Failed to close user data stream', {
        type: 'BINANCE_USER_DATA_STREAM_CLOSE_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Connect to WebSocket streams
   */
  public async connectWebSocket(
    streams: string[],
    onMessage: (data: any) => void,
    onError?: (error: WebSocketError) => void
  ): Promise<string> {
    const streamString = streams.join('/');
    
    const wsConfig = {
      url: `wss://stream.binance.com:9443/ws/${streamString}`,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      heartbeatTimeout: 60000,
      maxMessageSize: 1024 * 1024 // 1MB
    };

    const connectionId = `binance_${Date.now()}`;
    
    this.wsManager.createConnection(
      connectionId,
      wsConfig,
      onMessage,
      onError,
      (state: any) => {
        this.logger.info('WebSocket state changed', {
          type: 'BINANCE_WEBSOCKET_STATE_CHANGE',
          connectionId,
          state
        });
      }
    );

    this.logger.info('WebSocket connection created', {
      type: 'BINANCE_WEBSOCKET_CONNECTED',
      connectionId,
      streams
    });

    return connectionId;
  }

  /**
   * Disconnect WebSocket
   */
  public async disconnectWebSocket(connectionId: string): Promise<void> {
    await this.wsManager.closeConnection(connectionId);
    
    this.logger.info('WebSocket disconnected', {
      type: 'BINANCE_WEBSOCKET_DISCONNECTED',
      connectionId
    });
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    isConnected: boolean;
    serverTimeOffset: number;
    userDataStreamActive: boolean;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      serverTimeOffset: this.serverTimeOffset,
      userDataStreamActive: !!this.userDataStreamListenKey,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Test connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      this.logger.info('Binance connection test successful', {
        type: 'BINANCE_CONNECTION_TEST_SUCCESS'
      });
      
      return true;
    } catch (error) {
      this.isConnected = false;
      
      this.logger.error('Binance connection test failed', {
        type: 'BINANCE_CONNECTION_TEST_FAILED',
        error: error instanceof Error ? error.message : String(error)
      });
      
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      await this.closeUserDataStream();
      await this.wsManager.closeAllConnections();
      
      this.logger.info('BinanceManager cleanup completed', {
        type: 'BINANCE_MANAGER_CLEANUP'
      });
    } catch (error) {
      this.logger.error('BinanceManager cleanup failed', {
        type: 'BINANCE_MANAGER_CLEANUP_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

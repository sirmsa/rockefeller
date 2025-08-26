import WebSocket from 'ws';
import Logger from '@/logging/Logger';

import { WebSocketError } from './errors/CustomErrors';

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  maxMessageSize: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;
export type WebSocketErrorHandler = (error: WebSocketError) => void;
export type WebSocketStateHandler = (state: 'connected' | 'disconnected' | 'reconnecting') => void;

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocketConnection> = new Map();
  private logger = Logger.getInstance();


  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Create a new WebSocket connection
   */
  public createConnection(
    id: string,
    config: WebSocketConfig,
    onMessage?: WebSocketEventHandler,
    onError?: WebSocketErrorHandler,
    onStateChange?: WebSocketStateHandler
  ): WebSocketConnection {
    if (this.connections.has(id)) {
      this.logger.warn('WebSocket connection already exists', {
        type: 'WEBSOCKET_CONNECTION_EXISTS',
        connectionId: id
      });
      return this.connections.get(id)!;
    }

    const connection = new WebSocketConnection(
      id,
      config,
      onMessage,
      onError,
      onStateChange,
      this.logger
    );

    this.connections.set(id, connection);
    
    this.logger.info('WebSocket connection created', {
      type: 'WEBSOCKET_CONNECTION_CREATED',
      connectionId: id,
      url: config.url
    });

    return connection;
  }

  /**
   * Get an existing connection
   */
  public getConnection(id: string): WebSocketConnection | undefined {
    return this.connections.get(id);
  }

  /**
   * Close a specific connection
   */
  public async closeConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (connection) {
      await connection.close();
      this.connections.delete(id);
      
      this.logger.info('WebSocket connection closed', {
        type: 'WEBSOCKET_CONNECTION_CLOSED',
        connectionId: id
      });
    }
  }

  /**
   * Close all connections
   */
  public async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.connections.keys()).map(id => 
      this.closeConnection(id)
    );
    
    await Promise.all(closePromises);
    
    this.logger.info('All WebSocket connections closed', {
      type: 'WEBSOCKET_ALL_CONNECTIONS_CLOSED',
      connectionCount: this.connections.size
    });
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    connectionIds: string[];
  } {
    const connectionIds = Array.from(this.connections.keys());
    const activeConnections = connectionIds.filter(id => 
      this.connections.get(id)?.isConnected()
    ).length;

    return {
      totalConnections: this.connections.size,
      activeConnections,
      connectionIds
    };
  }

  /**
   * Send message to a specific connection
   */
  public sendMessage(id: string, message: WebSocketMessage): boolean {
    const connection = this.connections.get(id);
    if (connection && connection.isConnected()) {
      return connection.sendMessage(message);
    }
    
    this.logger.warn('Cannot send message to inactive connection', {
      type: 'WEBSOCKET_SEND_FAILED',
      connectionId: id,
      messageType: message.type
    });
    
    return false;
  }

  /**
   * Broadcast message to all active connections
   */
  public broadcastMessage(message: WebSocketMessage): number {
    let sentCount = 0;
    
    for (const [, connection] of this.connections) {
      if (connection.isConnected() && connection.sendMessage(message)) {
        sentCount++;
      }
    }

    this.logger.debug('Message broadcasted', {
      type: 'WEBSOCKET_BROADCAST',
      messageType: message.type,
      sentCount,
      totalConnections: this.connections.size
    });

    return sentCount;
  }
}

export class WebSocketConnection {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isClosing = false;
  private lastHeartbeat = 0;

  constructor(
    private readonly id: string,
    private readonly config: WebSocketConfig,
    private readonly onMessage?: WebSocketEventHandler,
    private readonly onError?: WebSocketErrorHandler,
    private readonly onStateChange?: WebSocketStateHandler,
    private readonly logger = Logger.getInstance()
  ) {
    this.connect();
  }

  /**
   * Connect to WebSocket
   */
  private connect(): void {
    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      
      this.ws.on('open', () => this.handleOpen());
      this.ws.on('message', (data: WebSocket.Data) => this.handleMessage(data));
      this.ws.on('error', (error: Error) => this.handleError(error));
      this.ws.on('close', (code: number, reason: Buffer) => this.handleClose(code, reason));
      this.ws.on('ping', () => this.handlePing());
      this.ws.on('pong', () => this.handlePong());

      this.logger.info('WebSocket connection initiated', {
        type: 'WEBSOCKET_CONNECT_INITIATED',
        connectionId: this.id,
        url: this.config.url
      });
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle connection open
   */
  private handleOpen(): void {
    this.reconnectAttempts = 0;
    this.isClosing = false;
    this.lastHeartbeat = Date.now();
    
    this.startHeartbeat();
    this.notifyStateChange('connected');

    this.logger.info('WebSocket connection opened', {
      type: 'WEBSOCKET_CONNECTED',
      connectionId: this.id,
      url: this.config.url
    });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message: WebSocketMessage = {
        type: 'message',
        data: JSON.parse(data.toString()),
        timestamp: Date.now()
      };

      this.logger.debug('WebSocket message received', {
        type: 'WEBSOCKET_MESSAGE_RECEIVED',
        connectionId: this.id,
        messageType: message.data?.e || 'unknown',
        dataSize: typeof data === 'string' ? data.length : (data as any).byteLength || 0
      });

      if (this.onMessage) {
        this.onMessage(message);
      }
    } catch (error) {
      this.logger.error('Failed to parse WebSocket message', {
        type: 'WEBSOCKET_MESSAGE_PARSE_ERROR',
        connectionId: this.id,
        error: error instanceof Error ? error.message : String(error),
        data: data.toString().substring(0, 100)
      });
    }
  }

  /**
   * Handle connection error
   */
  private handleError(error: Error): void {
    const wsError = new WebSocketError(
      error.message,
      this.id,
      'error',
      { originalError: error.message }
    );

    this.logger.error('WebSocket connection error', {
      type: 'WEBSOCKET_ERROR',
      connectionId: this.id,
      error: error.message
    });

    if (this.onError) {
      this.onError(wsError);
    }
  }

  /**
   * Handle connection close
   */
  private handleClose(code: number, reason: Buffer): void {
    this.stopHeartbeat();
    this.notifyStateChange('disconnected');

    this.logger.info('WebSocket connection closed', {
      type: 'WEBSOCKET_CLOSED',
      connectionId: this.id,
      code,
      reason: reason.toString()
    });

    // Attempt reconnection if not manually closing
    if (!this.isClosing && this.reconnectAttempts < this.config.reconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle ping
   */
  private handlePing(): void {
    this.lastHeartbeat = Date.now();
    this.logger.debug('WebSocket ping received', {
      type: 'WEBSOCKET_PING',
      connectionId: this.id
    });
  }

  /**
   * Handle pong
   */
  private handlePong(): void {
    this.lastHeartbeat = Date.now();
    this.logger.debug('WebSocket pong received', {
      type: 'WEBSOCKET_PONG',
      connectionId: this.id
    });
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.logger.info('Scheduling WebSocket reconnection', {
      type: 'WEBSOCKET_RECONNECT_SCHEDULED',
      connectionId: this.id,
      attempt: this.reconnectAttempts,
      delay,
      maxAttempts: this.config.reconnectAttempts
    });

    this.notifyStateChange('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.checkHeartbeat();
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Check heartbeat and reconnect if necessary
   */
  private checkHeartbeat(): void {
    const now = Date.now();
    const timeSinceLastHeartbeat = now - this.lastHeartbeat;

    if (timeSinceLastHeartbeat > this.config.heartbeatTimeout) {
      this.logger.warn('WebSocket heartbeat timeout, reconnecting', {
        type: 'WEBSOCKET_HEARTBEAT_TIMEOUT',
        connectionId: this.id,
        timeSinceLastHeartbeat,
        timeout: this.config.heartbeatTimeout
      });

      this.ws?.terminate();
    } else {
      // Send ping if supported
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }
  }

  /**
   * Send message
   */
  public sendMessage(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const messageStr = JSON.stringify(message.data);
      
      if (messageStr.length > this.config.maxMessageSize) {
        this.logger.warn('Message too large, skipping', {
          type: 'WEBSOCKET_MESSAGE_TOO_LARGE',
          connectionId: this.id,
          messageSize: messageStr.length,
          maxSize: this.config.maxMessageSize
        });
        return false;
      }

      this.ws.send(messageStr);
      
      this.logger.debug('WebSocket message sent', {
        type: 'WEBSOCKET_MESSAGE_SENT',
        connectionId: this.id,
        messageType: message.type,
        messageSize: messageStr.length
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send WebSocket message', {
        type: 'WEBSOCKET_SEND_ERROR',
        connectionId: this.id,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Close connection
   */
  public async close(): Promise<void> {
    this.isClosing = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connection is active
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  public getState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'closed';
    }
  }

  /**
   * Get connection statistics
   */
  public getStats(): {
    id: string;
    state: string;
    reconnectAttempts: number;
    lastHeartbeat: number;
    isConnected: boolean;
  } {
    return {
      id: this.id,
      state: this.getState(),
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      isConnected: this.isConnected()
    };
  }

  /**
   * Notify state change
   */
  private notifyStateChange(state: 'connected' | 'disconnected' | 'reconnecting'): void {
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }
}

import { Pool, PoolClient, QueryResult } from 'pg';
import ConfigManager from '@/core/ConfigManager';
import Logger from '@/logging/Logger';

class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;
  private logger = Logger.getInstance();
  private config = ConfigManager.getInstance();

  private constructor() {
    const dbConfig = this.config.databaseConfig;
    
    this.pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
      max: dbConfig.connectionPool,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool events
    this.pool.on('connect', (client: PoolClient) => {
      this.logger.debug('Database client connected', {
        type: 'DB_CONNECT',
        clientId: client.processID
      });
    });

    this.pool.on('error', (err: Error, client: PoolClient) => {
      this.logger.error('Database pool error', {
        type: 'DB_POOL_ERROR',
        error: err.message,
        clientId: client.processID
      });
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.logger.debug('Database client removed', {
        type: 'DB_REMOVE',
        clientId: client.processID
      });
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Execute a query with parameters
   */
  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - startTime;
      
      this.logger.debug('Database query executed', {
        type: 'DB_QUERY',
        query: text,
        params,
        duration: `${duration}ms`,
        rowCount: result.rowCount
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('Database query error', {
        type: 'DB_QUERY_ERROR',
        query: text,
        params,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  public async getClient(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      this.logger.debug('Database client acquired', {
        type: 'DB_CLIENT_ACQUIRED',
        clientId: client.processID
      });
      return client;
    } catch (error) {
      this.logger.error('Failed to acquire database client', {
        type: 'DB_CLIENT_ACQUIRE_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      this.logger.debug('Database transaction started', {
        type: 'DB_TRANSACTION_START'
      });
      
      const result = await callback(client);
      
      await client.query('COMMIT');
      this.logger.debug('Database transaction committed', {
        type: 'DB_TRANSACTION_COMMIT'
      });
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Database transaction rolled back', {
        type: 'DB_TRANSACTION_ROLLBACK',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    } finally {
      client.release();
      this.logger.debug('Database client released', {
        type: 'DB_CLIENT_RELEASED',
        clientId: client.processID
      });
    }
  }

  /**
   * Check database connectivity
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      this.logger.info('Database connection test successful', {
        type: 'DB_CONNECTION_TEST',
        currentTime: result.rows[0].current_time
      });
      return true;
    } catch (error) {
      this.logger.error('Database connection test failed', {
        type: 'DB_CONNECTION_TEST_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Get pool statistics
   */
  public getPoolStats(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Close the database pool
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info('Database pool closed', {
        type: 'DB_POOL_CLOSED'
      });
    } catch (error) {
      this.logger.error('Error closing database pool', {
        type: 'DB_POOL_CLOSE_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get the underlying pool instance
   */
  public getPool(): Pool {
    return this.pool;
  }
}

export default DatabaseManager;

import fs from 'fs';
import path from 'path';
import Logger from '@/logging/Logger';
import { v4 as uuidv4 } from 'uuid';

export interface SessionData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  data: Record<string, any>;
}

export interface PortfolioSession {
  id: string;
  name: string;
  totalBudget: number;
  maxBudgetPerSymbol: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  symbols: string[];
  trades: TradeSession[];
  performance: PerformanceSession;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeSession {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: string;
  quantity: number;
  price: number;
  executedQty: number;
  status: string;
  timestamp: Date;
  aiSentiment?: any;
  technicalAnalysis?: any;
  reasoning?: string;
  pnl?: number;
  fees: number;
  binanceOrderId: number;
}

export interface PerformanceSession {
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  lastUpdated: Date;
}

export interface AISession {
  symbol: string;
  sentimentScore: number;
  confidence: number;
  sources: string[];
  reasoning?: string;
  timestamp: Date;
}

export interface TechnicalSession {
  symbol: string;
  rsi?: number;
  ma20?: number;
  ma50?: number;
  ema12?: number;
  ema26?: number;
  volume?: number;
  volumeMA?: number;
  trend?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength?: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
}

export class SessionManager {
  private static instance: SessionManager;
  private logger = Logger.getInstance();
  private sessionsDir: string;
  private currentSession: SessionData | null = null;

  private constructor() {
    this.sessionsDir = path.join(process.cwd(), 'sessions');
    this.ensureSessionsDirectory();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Ensure sessions directory exists
   */
  private ensureSessionsDirectory(): void {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
      this.logger.info('Sessions directory created', {
        type: 'SESSION_DIR_CREATED',
        path: this.sessionsDir
      });
    }
  }

  /**
   * Create a new session
   */
  public createSession(name: string, initialData: Record<string, any> = {}): SessionData {
    const session: SessionData = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: initialData
    };

    this.currentSession = session;
    this.saveSession(session);

    this.logger.info('New session created', {
      type: 'SESSION_CREATED',
      sessionId: session.id,
      sessionName: session.name
    });

    return session;
  }

  /**
   * Load an existing session
   */
  public loadSession(sessionId: string): SessionData | null {
    try {
      const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
      if (!fs.existsSync(sessionPath)) {
        return null;
      }

      const sessionData = fs.readFileSync(sessionPath, 'utf8');
      const session = JSON.parse(sessionData);
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);

      this.currentSession = session;

      this.logger.info('Session loaded', {
        type: 'SESSION_LOADED',
        sessionId: session.id,
        sessionName: session.name
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to load session', {
        type: 'SESSION_LOAD_ERROR',
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Save session data
   */
  public saveSession(session: SessionData): void {
    try {
      session.updatedAt = new Date();
      const sessionPath = path.join(this.sessionsDir, `${session.id}.json`);
      fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));

      this.logger.debug('Session saved', {
        type: 'SESSION_SAVED',
        sessionId: session.id
      });
    } catch (error) {
      this.logger.error('Failed to save session', {
        type: 'SESSION_SAVE_ERROR',
        sessionId: session.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get current session
   */
  public getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  /**
   * Update current session data
   */
  public updateSessionData(key: string, value: any): void {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.data[key] = value;
    this.currentSession.updatedAt = new Date();
    this.saveSession(this.currentSession);

    this.logger.debug('Session data updated', {
      type: 'SESSION_DATA_UPDATED',
      sessionId: this.currentSession.id,
      key
    });
  }

  /**
   * Get session data
   */
  public getSessionData(key: string): any {
    if (!this.currentSession) {
      return null;
    }
    return this.currentSession.data[key];
  }

  /**
   * List all sessions
   */
  public listSessions(): { id: string; name: string; createdAt: Date; updatedAt: Date }[] {
    try {
      const files = fs.readdirSync(this.sessionsDir);
      const sessions: { id: string; name: string; createdAt: Date; updatedAt: Date }[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionPath = path.join(this.sessionsDir, file);
          const sessionData = fs.readFileSync(sessionPath, 'utf8');
          const session = JSON.parse(sessionData);

          sessions.push({
            id: session.id,
            name: session.name,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          });
        }
      }

      return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      this.logger.error('Failed to list sessions', {
        type: 'SESSION_LIST_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Delete a session
   */
  public deleteSession(sessionId: string): boolean {
    try {
      const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
        
        if (this.currentSession?.id === sessionId) {
          this.currentSession = null;
        }

        this.logger.info('Session deleted', {
          type: 'SESSION_DELETED',
          sessionId
        });

        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to delete session', {
        type: 'SESSION_DELETE_ERROR',
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Portfolio management methods
   */
  public savePortfolio(portfolio: PortfolioSession): void {
    this.updateSessionData(`portfolio_${portfolio.id}`, portfolio);
  }

  public getPortfolio(portfolioId: string): PortfolioSession | null {
    return this.getSessionData(`portfolio_${portfolioId}`);
  }

  public getAllPortfolios(): PortfolioSession[] {
    if (!this.currentSession) return [];

    const portfolios: PortfolioSession[] = [];
    for (const [key, value] of Object.entries(this.currentSession.data)) {
      if (key.startsWith('portfolio_') && typeof value === 'object') {
        portfolios.push(value as PortfolioSession);
      }
    }
    return portfolios;
  }

  /**
   * Trade management methods
   */
  public saveTrade(portfolioId: string, trade: TradeSession): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (portfolio) {
      portfolio.trades.push(trade);
      portfolio.updatedAt = new Date();
      this.savePortfolio(portfolio);
    }
  }

  public getTrades(portfolioId: string): TradeSession[] {
    const portfolio = this.getPortfolio(portfolioId);
    return portfolio?.trades || [];
  }

  /**
   * AI Analysis management methods
   */
  public saveAIAnalysis(analysis: AISession): void {
    const analyses = this.getSessionData('ai_analyses') || [];
    analyses.push(analysis);
    this.updateSessionData('ai_analyses', analyses);
  }

  public getAIAnalyses(symbol?: string): AISession[] {
    const analyses = this.getSessionData('ai_analyses') || [];
    if (symbol) {
      return analyses.filter((a: AISession) => a.symbol === symbol);
    }
    return analyses;
  }

  /**
   * Technical Analysis management methods
   */
  public saveTechnicalAnalysis(analysis: TechnicalSession): void {
    const analyses = this.getSessionData('technical_analyses') || [];
    analyses.push(analysis);
    this.updateSessionData('technical_analyses', analyses);
  }

  public getTechnicalAnalyses(symbol?: string): TechnicalSession[] {
    const analyses = this.getSessionData('technical_analyses') || [];
    if (symbol) {
      return analyses.filter((a: TechnicalSession) => a.symbol === symbol);
    }
    return analyses;
  }

  /**
   * Performance tracking methods
   */
  public updatePerformance(portfolioId: string, performance: PerformanceSession): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (portfolio) {
      portfolio.performance = performance;
      portfolio.updatedAt = new Date();
      this.savePortfolio(portfolio);
    }
  }

  /**
   * Cache management methods
   */
  public setCache(key: string, value: any, ttl?: number): void {
    const cacheData = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 3600000 // Default 1 hour
    };
    this.updateSessionData(`cache_${key}`, cacheData);
  }

  public getCache(key: string): any {
    const cacheData = this.getSessionData(`cache_${key}`);
    if (!cacheData) return null;

    const now = Date.now();
    if (now - cacheData.timestamp > cacheData.ttl) {
      // Cache expired
      this.updateSessionData(`cache_${key}`, null);
      return null;
    }

    return cacheData.value;
  }

  /**
   * Clean up expired cache entries
   */
  public cleanupCache(): void {
    if (!this.currentSession) return;

    const keysToRemove: string[] = [];
    for (const [key, value] of Object.entries(this.currentSession.data)) {
      if (key.startsWith('cache_') && value) {
        const now = Date.now();
        if (now - value.timestamp > value.ttl) {
          keysToRemove.push(key);
        }
      }
    }

    for (const key of keysToRemove) {
      delete this.currentSession.data[key];
    }

    if (keysToRemove.length > 0) {
      this.saveSession(this.currentSession);
      this.logger.debug('Cache cleaned up', {
        type: 'CACHE_CLEANUP',
        removedEntries: keysToRemove.length
      });
    }
  }

  /**
   * Export session data
   */
  public exportSession(sessionId: string): string | null {
    try {
      const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
      if (!fs.existsSync(sessionPath)) {
        return null;
      }
      return fs.readFileSync(sessionPath, 'utf8');
    } catch (error) {
      this.logger.error('Failed to export session', {
        type: 'SESSION_EXPORT_ERROR',
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Import session data
   */
  public importSession(sessionData: string): SessionData | null {
    try {
      const session = JSON.parse(sessionData);
      session.id = uuidv4(); // Generate new ID for imported session
      session.createdAt = new Date();
      session.updatedAt = new Date();

      this.saveSession(session);

      this.logger.info('Session imported', {
        type: 'SESSION_IMPORTED',
        sessionId: session.id,
        sessionName: session.name
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to import session', {
        type: 'SESSION_IMPORT_ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
}

// Portfolio Data Models
export interface Portfolio {
  id: string;
  name: string;
  description?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  budget: {
    total: number;
    maxPerSymbol: number;
    currency: string;
  };
  symbols: PortfolioSymbol[];
  constraints: PortfolioConstraints;
  performance: PortfolioPerformance;
  history: PortfolioHistory[];
}

export interface PortfolioSymbol {
  symbol: string;
  allocation: number; // Percentage of portfolio budget
  maxAllocation: number; // Maximum percentage allowed
  minAllocation: number; // Minimum percentage required
  isActive: boolean;
  addedAt: Date;
  lastTradeAt?: Date;
  currentPosition?: Position;
  performance: SymbolPerformance;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  entryTime: Date;
  lastUpdateTime: Date;
}

export interface PortfolioConstraints {
  maxSymbols: number;
  maxDrawdown: number; // Percentage
  maxDailyLoss: number; // Percentage
  maxPositionSize: number; // Percentage
  correlationThreshold: number; // Maximum correlation between symbols
  rebalanceFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  stopLossPercentage: number;
  takeProfitPercentage: number;
}

export interface PortfolioPerformance {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  dailyPnL: number;
  dailyPnLPercentage: number;
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  lastCalculated: Date;
}

export interface SymbolPerformance {
  totalPnL: number;
  totalPnLPercentage: number;
  trades: number;
  winRate: number;
  averageHoldTime: number;
  maxDrawdown: number;
  sharpeRatio: number;
  lastCalculated: Date;
}

export interface PortfolioHistory {
  timestamp: Date;
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  dailyPnL: number;
  dailyPnLPercentage: number;
  symbolCount: number;
  activePositions: number;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  budget: number;
  maxPerSymbol: number;
  currency?: string;
  constraints?: Partial<PortfolioConstraints>;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
  budget?: number;
  maxPerSymbol?: number;
  constraints?: Partial<PortfolioConstraints>;
}

export interface AddSymbolRequest {
  symbol: string;
  allocation: number;
  maxAllocation?: number;
  minAllocation?: number;
}

export class PortfolioManager {
  private static instance: PortfolioManager;
  private portfolios: Map<string, Portfolio> = new Map();
  private activePortfolioId: string | null = null;

  private constructor() {
    this.loadPortfolios();
  }

  public static getInstance(): PortfolioManager {
    if (!PortfolioManager.instance) {
      PortfolioManager.instance = new PortfolioManager();
    }
    return PortfolioManager.instance;
  }

  // Portfolio CRUD Operations
  public async createPortfolio(request: CreatePortfolioRequest): Promise<Portfolio> {
    // Validate request
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Portfolio name is required');
    }

    if (request.budget <= 0) {
      throw new Error('Portfolio budget must be greater than 0');
    }

    if (request.maxPerSymbol <= 0 || request.maxPerSymbol > 100) {
      throw new Error('Max per symbol must be between 0 and 100');
    }

    // Check if portfolio name already exists
    const existingPortfolio = Array.from(this.portfolios.values()).find(
      p => p.name.toLowerCase() === request.name.toLowerCase()
    );

    if (existingPortfolio) {
      throw new Error('Portfolio with this name already exists');
    }

    const portfolioId = this.generatePortfolioId();
    const now = new Date();

    const portfolio: Portfolio = {
      id: portfolioId,
      name: request.name.trim(),
      description: request.description?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      budget: {
        total: request.budget,
        maxPerSymbol: request.maxPerSymbol,
        currency: request.currency || 'USDT'
      },
      symbols: [],
      constraints: {
        maxSymbols: 20,
        maxDrawdown: 20,
        maxDailyLoss: 5,
        maxPositionSize: 25,
        correlationThreshold: 0.7,
        rebalanceFrequency: 'WEEKLY',
        stopLossPercentage: 5,
        takeProfitPercentage: 10,
        ...request.constraints
      },
      performance: this.initializePortfolioPerformance(),
      history: []
    };

    this.portfolios.set(portfolioId, portfolio);
    await this.savePortfolios();

    // Set as active if it's the first portfolio
    if (this.portfolios.size === 1) {
      this.activePortfolioId = portfolioId;
    }

    return portfolio;
  }

  public async updatePortfolio(portfolioId: string, request: UpdatePortfolioRequest): Promise<Portfolio> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Validate updates
    if (request.name && request.name.trim().length === 0) {
      throw new Error('Portfolio name cannot be empty');
    }

    if (request.budget !== undefined && request.budget <= 0) {
      throw new Error('Portfolio budget must be greater than 0');
    }

    if (request.maxPerSymbol !== undefined && (request.maxPerSymbol <= 0 || request.maxPerSymbol > 100)) {
      throw new Error('Max per symbol must be between 0 and 100');
    }

    // Check name uniqueness if changing name
    if (request.name && request.name.toLowerCase() !== portfolio.name.toLowerCase()) {
      const existingPortfolio = Array.from(this.portfolios.values()).find(
        p => p.id !== portfolioId && p.name.toLowerCase() === request.name!.toLowerCase()
      );

      if (existingPortfolio) {
        throw new Error('Portfolio with this name already exists');
      }
    }

    // Apply updates
    if (request.name) portfolio.name = request.name.trim();
    if (request.description !== undefined) portfolio.description = request.description?.trim();
    if (request.budget !== undefined) portfolio.budget.total = request.budget;
    if (request.maxPerSymbol !== undefined) portfolio.budget.maxPerSymbol = request.maxPerSymbol;
    if (request.constraints) {
      portfolio.constraints = { ...portfolio.constraints, ...request.constraints };
    }

    portfolio.updatedAt = new Date();
    this.portfolios.set(portfolioId, portfolio);
    await this.savePortfolios();

    return portfolio;
  }

  public async deletePortfolio(portfolioId: string): Promise<void> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Check if it's the active portfolio
    if (this.activePortfolioId === portfolioId) {
      this.activePortfolioId = null;
    }

    this.portfolios.delete(portfolioId);
    await this.savePortfolios();

    // Set another portfolio as active if available
    if (this.activePortfolioId === null && this.portfolios.size > 0) {
      this.activePortfolioId = Array.from(this.portfolios.keys())[0] || null;
    }
  }

  public getPortfolio(portfolioId: string): Portfolio | null {
    return this.portfolios.get(portfolioId) || null;
  }

  public getAllPortfolios(): Portfolio[] {
    return Array.from(this.portfolios.values());
  }

  public getActivePortfolio(): Portfolio | null {
    if (!this.activePortfolioId) return null;
    return this.portfolios.get(this.activePortfolioId) || null;
  }

  public async setActivePortfolio(portfolioId: string): Promise<void> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    if (!portfolio.isActive) {
      throw new Error('Cannot set inactive portfolio as active');
    }

    this.activePortfolioId = portfolioId;
    await this.savePortfolios();
  }

  // Symbol Management
  public async addSymbol(portfolioId: string, request: AddSymbolRequest): Promise<PortfolioSymbol> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Validate symbol
    if (!request.symbol || request.symbol.trim().length === 0) {
      throw new Error('Symbol is required');
    }

    // Check if symbol already exists
    const existingSymbol = portfolio.symbols.find(s => s.symbol === request.symbol);
    if (existingSymbol) {
      throw new Error('Symbol already exists in portfolio');
    }

    // Check portfolio constraints
    if (portfolio.symbols.length >= portfolio.constraints.maxSymbols) {
      throw new Error(`Portfolio cannot have more than ${portfolio.constraints.maxSymbols} symbols`);
    }

    // Validate allocation
    if (request.allocation <= 0 || request.allocation > 100) {
      throw new Error('Allocation must be between 0 and 100');
    }

    // Check total allocation
    const totalAllocation = portfolio.symbols.reduce((sum, s) => sum + s.allocation, 0) + request.allocation;
    if (totalAllocation > 100) {
      throw new Error('Total allocation cannot exceed 100%');
    }

    const portfolioSymbol: PortfolioSymbol = {
      symbol: request.symbol,
      allocation: request.allocation,
      maxAllocation: request.maxAllocation || request.allocation * 1.5,
      minAllocation: request.minAllocation || request.allocation * 0.5,
      isActive: true,
      addedAt: new Date(),
      performance: this.initializeSymbolPerformance()
    };

    portfolio.symbols.push(portfolioSymbol);
    portfolio.updatedAt = new Date();
    this.portfolios.set(portfolioId, portfolio);
    await this.savePortfolios();

    return portfolioSymbol;
  }

  public async removeSymbol(portfolioId: string, symbol: string): Promise<void> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const symbolIndex = portfolio.symbols.findIndex(s => s.symbol === symbol);
    if (symbolIndex === -1) {
      throw new Error('Symbol not found in portfolio');
    }

    // Check if symbol has active position
    const portfolioSymbol = portfolio.symbols[symbolIndex];
    if (portfolioSymbol?.currentPosition) {
      throw new Error('Cannot remove symbol with active position');
    }

    portfolio.symbols.splice(symbolIndex, 1);
    portfolio.updatedAt = new Date();
    this.portfolios.set(portfolioId, portfolio);
    await this.savePortfolios();
  }

  public async updateSymbolAllocation(portfolioId: string, symbol: string, allocation: number): Promise<PortfolioSymbol> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const portfolioSymbol = portfolio.symbols.find(s => s.symbol === symbol);
    if (!portfolioSymbol) {
      throw new Error('Symbol not found in portfolio');
    }

    // Validate allocation
    if (allocation <= 0 || allocation > 100) {
      throw new Error('Allocation must be between 0 and 100');
    }

    // Check total allocation
    const totalAllocation = portfolio.symbols.reduce((sum, s) => 
      s.symbol === symbol ? sum + allocation : sum + s.allocation, 0
    );
    if (totalAllocation > 100) {
      throw new Error('Total allocation cannot exceed 100%');
    }

    portfolioSymbol.allocation = allocation;
    portfolio.updatedAt = new Date();
    this.portfolios.set(portfolioId, portfolio);
    await this.savePortfolios();

    return portfolioSymbol;
  }

  // Portfolio Analytics
  public async calculatePortfolioPerformance(portfolioId: string): Promise<PortfolioPerformance> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // This is a simplified calculation - in a real implementation,
    // you would fetch current prices and calculate actual P&L
    const performance: PortfolioPerformance = {
      totalValue: portfolio.budget.total,
      totalPnL: 0,
      totalPnLPercentage: 0,
      dailyPnL: 0,
      dailyPnLPercentage: 0,
      maxDrawdown: 0,
      maxDrawdownPercentage: 0,
      sharpeRatio: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      lastCalculated: new Date()
    };

    portfolio.performance = performance;
    this.portfolios.set(portfolioId, portfolio);
    await this.savePortfolios();

    return performance;
  }

  // Budget Management
  public async updateBudget(portfolioId: string, newBudget: number): Promise<void> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    if (newBudget <= 0) {
      throw new Error('Budget must be greater than 0');
    }

    portfolio.budget.total = newBudget;
    portfolio.updatedAt = new Date();
    this.portfolios.set(portfolioId, portfolio);
    await this.savePortfolios();
  }

  // Validation
  public validatePortfolioConstraints(portfolio: Portfolio): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check symbol count
    if (portfolio.symbols.length > portfolio.constraints.maxSymbols) {
      errors.push(`Portfolio exceeds maximum symbol count of ${portfolio.constraints.maxSymbols}`);
    }

    // Check total allocation
    const totalAllocation = portfolio.symbols.reduce((sum, s) => sum + s.allocation, 0);
    if (totalAllocation > 100) {
      errors.push('Total symbol allocation exceeds 100%');
    }

    // Check individual symbol allocations
    portfolio.symbols.forEach(symbol => {
      if (symbol.allocation > portfolio.budget.maxPerSymbol) {
        errors.push(`Symbol ${symbol.symbol} allocation exceeds maximum per symbol limit`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Private Methods
  private generatePortfolioId(): string {
    return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePortfolioPerformance(): PortfolioPerformance {
    return {
      totalValue: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      dailyPnL: 0,
      dailyPnLPercentage: 0,
      maxDrawdown: 0,
      maxDrawdownPercentage: 0,
      sharpeRatio: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      lastCalculated: new Date()
    };
  }

  private initializeSymbolPerformance(): SymbolPerformance {
    return {
      totalPnL: 0,
      totalPnLPercentage: 0,
      trades: 0,
      winRate: 0,
      averageHoldTime: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      lastCalculated: new Date()
    };
  }

  private async loadPortfolios(): Promise<void> {
    try {
      // For now, we'll use localStorage or a simple file system approach
      // In a real implementation, this would load from persistent storage
      console.log('Loading portfolios...');
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    }
  }

  private async savePortfolios(): Promise<void> {
    try {
      // For now, we'll use localStorage or a simple file system approach
      // In a real implementation, this would save to persistent storage
      console.log('Saving portfolios...');
    } catch (error) {
      console.error('Failed to save portfolios:', error);
      throw error;
    }
  }

  public cleanup(): void {
    this.portfolios.clear();
    this.activePortfolioId = null;
  }
}

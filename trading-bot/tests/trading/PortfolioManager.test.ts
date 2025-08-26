import { PortfolioManager, Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest, AddSymbolRequest } from '@/trading/PortfolioManager';

describe('PortfolioManager', () => {
  let portfolioManager: PortfolioManager;

  beforeEach(() => {
    // Reset singleton instance
    (PortfolioManager as any).instance = undefined;
    portfolioManager = PortfolioManager.getInstance();
  });

  afterEach(() => {
    portfolioManager.cleanup();
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = PortfolioManager.getInstance();
      const instance2 = PortfolioManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Portfolio CRUD Operations', () => {
    const mockCreateRequest: CreatePortfolioRequest = {
      name: 'Test Portfolio',
      description: 'A test portfolio',
      budget: 10000,
      maxPerSymbol: 25,
      currency: 'USDT'
    };

    test('should create portfolio successfully', async () => {
      const portfolio = await portfolioManager.createPortfolio(mockCreateRequest);

      expect(portfolio).toBeDefined();
      expect(portfolio.name).toBe('Test Portfolio');
      expect(portfolio.description).toBe('A test portfolio');
      expect(portfolio.budget.total).toBe(10000);
      expect(portfolio.budget.maxPerSymbol).toBe(25);
      expect(portfolio.budget.currency).toBe('USDT');
      expect(portfolio.isActive).toBe(true);
      expect(portfolio.symbols).toHaveLength(0);
    });

    test('should fail to create portfolio with empty name', async () => {
      const invalidRequest = { ...mockCreateRequest, name: '' };

      await expect(portfolioManager.createPortfolio(invalidRequest)).rejects.toThrow('Portfolio name is required');
    });

    test('should fail to create portfolio with invalid budget', async () => {
      const invalidRequest = { ...mockCreateRequest, budget: 0 };

      await expect(portfolioManager.createPortfolio(invalidRequest)).rejects.toThrow('Portfolio budget must be greater than 0');
    });

    test('should fail to create portfolio with invalid maxPerSymbol', async () => {
      const invalidRequest = { ...mockCreateRequest, maxPerSymbol: 150 };

      await expect(portfolioManager.createPortfolio(invalidRequest)).rejects.toThrow('Max per symbol must be between 0 and 100');
    });

    test('should fail to create portfolio with duplicate name', async () => {
      await portfolioManager.createPortfolio(mockCreateRequest);

      await expect(portfolioManager.createPortfolio(mockCreateRequest)).rejects.toThrow('Portfolio with this name already exists');
    });

    test('should update portfolio successfully', async () => {
      const portfolio = await portfolioManager.createPortfolio(mockCreateRequest);
      
      const updateRequest: UpdatePortfolioRequest = {
        name: 'Updated Portfolio',
        budget: 15000,
        maxPerSymbol: 30
      };

      const updatedPortfolio = await portfolioManager.updatePortfolio(portfolio.id, updateRequest);

      expect(updatedPortfolio.name).toBe('Updated Portfolio');
      expect(updatedPortfolio.budget.total).toBe(15000);
      expect(updatedPortfolio.budget.maxPerSymbol).toBe(30);
    });

    test('should fail to update non-existent portfolio', async () => {
      const updateRequest: UpdatePortfolioRequest = { name: 'Updated Portfolio' };

      await expect(portfolioManager.updatePortfolio('non-existent-id', updateRequest)).rejects.toThrow('Portfolio not found');
    });

    test('should delete portfolio successfully', async () => {
      const portfolio = await portfolioManager.createPortfolio(mockCreateRequest);

      await portfolioManager.deletePortfolio(portfolio.id);

      const deletedPortfolio = portfolioManager.getPortfolio(portfolio.id);
      expect(deletedPortfolio).toBeNull();
    });

    test('should fail to delete non-existent portfolio', async () => {
      await expect(portfolioManager.deletePortfolio('non-existent-id')).rejects.toThrow('Portfolio not found');
    });

    test('should get portfolio by id', async () => {
      const createdPortfolio = await portfolioManager.createPortfolio(mockCreateRequest);
      
      const retrievedPortfolio = portfolioManager.getPortfolio(createdPortfolio.id);
      
      expect(retrievedPortfolio).toEqual(createdPortfolio);
    });

    test('should get all portfolios', async () => {
      await portfolioManager.createPortfolio(mockCreateRequest);
      const portfolio2 = await portfolioManager.createPortfolio({
        ...mockCreateRequest,
        name: 'Test Portfolio 2'
      });

      const allPortfolios = portfolioManager.getAllPortfolios();

      expect(allPortfolios).toHaveLength(2);
      expect(allPortfolios).toContainEqual(portfolio2);
    });
  });

  describe('Active Portfolio Management', () => {
    const mockCreateRequest: CreatePortfolioRequest = {
      name: 'Test Portfolio',
      budget: 10000,
      maxPerSymbol: 25
    };

    test('should set first portfolio as active automatically', async () => {
      const portfolio = await portfolioManager.createPortfolio(mockCreateRequest);

      const activePortfolio = portfolioManager.getActivePortfolio();
      expect(activePortfolio).toEqual(portfolio);
    });

    test('should set active portfolio successfully', async () => {
      await portfolioManager.createPortfolio(mockCreateRequest);
      const portfolio2 = await portfolioManager.createPortfolio({
        ...mockCreateRequest,
        name: 'Test Portfolio 2'
      });

      await portfolioManager.setActivePortfolio(portfolio2.id);

      const activePortfolio = portfolioManager.getActivePortfolio();
      expect(activePortfolio).toEqual(portfolio2);
    });

    test('should fail to set non-existent portfolio as active', async () => {
      await expect(portfolioManager.setActivePortfolio('non-existent-id')).rejects.toThrow('Portfolio not found');
    });

    test('should return null when no active portfolio', () => {
      const activePortfolio = portfolioManager.getActivePortfolio();
      expect(activePortfolio).toBeNull();
    });
  });

  describe('Symbol Management', () => {
    let portfolio: Portfolio;
    const mockCreateRequest: CreatePortfolioRequest = {
      name: 'Test Portfolio',
      budget: 10000,
      maxPerSymbol: 25
    };

    beforeEach(async () => {
      portfolio = await portfolioManager.createPortfolio(mockCreateRequest);
    });

    test('should add symbol to portfolio successfully', async () => {
      const addSymbolRequest: AddSymbolRequest = {
        symbol: 'BTCUSDT',
        allocation: 50,
        maxAllocation: 75,
        minAllocation: 25
      };

      const portfolioSymbol = await portfolioManager.addSymbol(portfolio.id, addSymbolRequest);

      expect(portfolioSymbol.symbol).toBe('BTCUSDT');
      expect(portfolioSymbol.allocation).toBe(50);
      expect(portfolioSymbol.maxAllocation).toBe(75);
      expect(portfolioSymbol.minAllocation).toBe(25);
      expect(portfolioSymbol.isActive).toBe(true);

      const updatedPortfolio = portfolioManager.getPortfolio(portfolio.id);
      expect(updatedPortfolio?.symbols).toHaveLength(1);
      expect(updatedPortfolio?.symbols[0]).toEqual(portfolioSymbol);
    });

    test('should fail to add invalid symbol', async () => {
      const addSymbolRequest: AddSymbolRequest = {
        symbol: '',
        allocation: 50
      };

      await expect(portfolioManager.addSymbol(portfolio.id, addSymbolRequest)).rejects.toThrow('Symbol is required');
    });

    test('should fail to add duplicate symbol', async () => {
      const addSymbolRequest: AddSymbolRequest = {
        symbol: 'BTCUSDT',
        allocation: 50
      };

      await portfolioManager.addSymbol(portfolio.id, addSymbolRequest);

      await expect(portfolioManager.addSymbol(portfolio.id, addSymbolRequest)).rejects.toThrow('Symbol already exists in portfolio');
    });

    test('should fail to add symbol with invalid allocation', async () => {
      const addSymbolRequest: AddSymbolRequest = {
        symbol: 'BTCUSDT',
        allocation: 150
      };

      await expect(portfolioManager.addSymbol(portfolio.id, addSymbolRequest)).rejects.toThrow('Allocation must be between 0 and 100');
    });

    test('should fail to add symbol when total allocation exceeds 100%', async () => {
      await portfolioManager.addSymbol(portfolio.id, {
        symbol: 'BTCUSDT',
        allocation: 60
      });

      await expect(portfolioManager.addSymbol(portfolio.id, {
        symbol: 'ETHUSDT',
        allocation: 50
      })).rejects.toThrow('Total allocation cannot exceed 100%');
    });

    test('should remove symbol from portfolio successfully', async () => {
      const addSymbolRequest: AddSymbolRequest = {
        symbol: 'BTCUSDT',
        allocation: 50
      };

      await portfolioManager.addSymbol(portfolio.id, addSymbolRequest);
      await portfolioManager.removeSymbol(portfolio.id, 'BTCUSDT');

      const updatedPortfolio = portfolioManager.getPortfolio(portfolio.id);
      expect(updatedPortfolio?.symbols).toHaveLength(0);
    });

    test('should fail to remove non-existent symbol', async () => {
      await expect(portfolioManager.removeSymbol(portfolio.id, 'BTCUSDT')).rejects.toThrow('Symbol not found in portfolio');
    });

    test('should update symbol allocation successfully', async () => {
      await portfolioManager.addSymbol(portfolio.id, {
        symbol: 'BTCUSDT',
        allocation: 50
      });

      const updatedSymbol = await portfolioManager.updateSymbolAllocation(portfolio.id, 'BTCUSDT', 75);

      expect(updatedSymbol.allocation).toBe(75);

      const updatedPortfolio = portfolioManager.getPortfolio(portfolio.id);
      expect(updatedPortfolio?.symbols[0]?.allocation).toBe(75);
    });

    test('should fail to update allocation of non-existent symbol', async () => {
      await expect(portfolioManager.updateSymbolAllocation(portfolio.id, 'BTCUSDT', 75)).rejects.toThrow('Symbol not found in portfolio');
    });

    test('should fail to update allocation to invalid value', async () => {
      await portfolioManager.addSymbol(portfolio.id, {
        symbol: 'BTCUSDT',
        allocation: 50
      });

      await expect(portfolioManager.updateSymbolAllocation(portfolio.id, 'BTCUSDT', 150)).rejects.toThrow('Allocation must be between 0 and 100');
    });
  });

  describe('Portfolio Analytics', () => {
    let portfolio: Portfolio;
    const mockCreateRequest: CreatePortfolioRequest = {
      name: 'Test Portfolio',
      budget: 10000,
      maxPerSymbol: 25
    };

    beforeEach(async () => {
      portfolio = await portfolioManager.createPortfolio(mockCreateRequest);
    });

    test('should calculate portfolio performance', async () => {
      const performance = await portfolioManager.calculatePortfolioPerformance(portfolio.id);

      expect(performance).toBeDefined();
      expect(performance.totalValue).toBe(10000);
      expect(performance.totalPnL).toBe(0);
      expect(performance.totalPnLPercentage).toBe(0);
      expect(performance.lastCalculated).toBeInstanceOf(Date);
    });

    test('should fail to calculate performance for non-existent portfolio', async () => {
      await expect(portfolioManager.calculatePortfolioPerformance('non-existent-id')).rejects.toThrow('Portfolio not found');
    });
  });

  describe('Budget Management', () => {
    let portfolio: Portfolio;
    const mockCreateRequest: CreatePortfolioRequest = {
      name: 'Test Portfolio',
      budget: 10000,
      maxPerSymbol: 25
    };

    beforeEach(async () => {
      portfolio = await portfolioManager.createPortfolio(mockCreateRequest);
    });

    test('should update portfolio budget successfully', async () => {
      await portfolioManager.updateBudget(portfolio.id, 15000);

      const updatedPortfolio = portfolioManager.getPortfolio(portfolio.id);
      expect(updatedPortfolio?.budget.total).toBe(15000);
    });

    test('should fail to update budget to invalid value', async () => {
      await expect(portfolioManager.updateBudget(portfolio.id, 0)).rejects.toThrow('Budget must be greater than 0');
    });

    test('should fail to update budget for non-existent portfolio', async () => {
      await expect(portfolioManager.updateBudget('non-existent-id', 15000)).rejects.toThrow('Portfolio not found');
    });
  });

  describe('Portfolio Validation', () => {
    let portfolio: Portfolio;
    const mockCreateRequest: CreatePortfolioRequest = {
      name: 'Test Portfolio',
      budget: 10000,
      maxPerSymbol: 25
    };

    beforeEach(async () => {
      portfolio = await portfolioManager.createPortfolio(mockCreateRequest);
    });

    test('should validate portfolio constraints successfully', () => {
      const validation = portfolioManager.validatePortfolioConstraints(portfolio);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect total allocation exceeding 100%', async () => {
      // Add symbols that don't exceed 100% first
      await portfolioManager.addSymbol(portfolio.id, {
        symbol: 'BTCUSDT',
        allocation: 60
      });

      await portfolioManager.addSymbol(portfolio.id, {
        symbol: 'ETHUSDT',
        allocation: 30
      });

      // Manually modify the allocation to exceed 100% for testing validation
      const updatedPortfolio = portfolioManager.getPortfolio(portfolio.id);
      if (updatedPortfolio && updatedPortfolio.symbols[1]) {
        updatedPortfolio.symbols[1].allocation = 50; // This makes total 110%
      }

      const validation = portfolioManager.validatePortfolioConstraints(updatedPortfolio!);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Total symbol allocation exceeds 100%');
    });

    test('should detect symbol allocation exceeding max per symbol', async () => {
      await portfolioManager.addSymbol(portfolio.id, {
        symbol: 'BTCUSDT',
        allocation: 30 // Exceeds maxPerSymbol of 25
      });

      const updatedPortfolio = portfolioManager.getPortfolio(portfolio.id);
      const validation = portfolioManager.validatePortfolioConstraints(updatedPortfolio!);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Symbol BTCUSDT allocation exceeds maximum per symbol limit');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup portfolios and active portfolio', async () => {
      await portfolioManager.createPortfolio({
        name: 'Test Portfolio',
        budget: 10000,
        maxPerSymbol: 25
      });

      expect(portfolioManager.getAllPortfolios()).toHaveLength(1);
      expect(portfolioManager.getActivePortfolio()).toBeDefined();

      portfolioManager.cleanup();

      expect(portfolioManager.getAllPortfolios()).toHaveLength(0);
      expect(portfolioManager.getActivePortfolio()).toBeNull();
    });
  });
});

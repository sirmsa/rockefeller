# MockRealTimeService - Realistic Market Noise Features

## Overview

The `MockRealTimeService` has been enhanced with sophisticated market noise simulation to provide realistic trading data for testing and development purposes. This service now generates market movements that closely resemble real-world trading behavior using **Next.js API routes** and **WebSocket connections**.

## Key Features

### 1. **Realistic Price Movements**

#### Brownian Motion with Drift
- **Random Walk**: Price changes follow a random walk pattern with configurable volatility
- **Trend Persistence**: Prices maintain directional momentum (80% persistence factor)
- **Mean Reversion**: Prices gradually return toward base levels (10% reversion factor)

#### Volatility Clustering
- **Volatility Persistence**: High volatility periods tend to cluster together
- **Dynamic Volatility**: Volatility levels adjust based on recent price movements
- **Asset-Specific Volatility**: Different symbols have different base volatility levels

### 2. **Time-Based Market Patterns**

#### Intraday Volatility Cycles
- **Opening Volatility**: 2.5x normal volatility during market open (9-10 AM)
- **Lunch Hour Lull**: 0.6x normal volatility during lunch (11 AM-1 PM)
- **Closing Volatility**: 1.8x normal volatility during market close (3-4 PM)
- **After Hours**: 0.8x normal volatility outside trading hours

#### Market Hours Simulation
- Assumes US market hours (9 AM - 4 PM EST)
- Automatic adjustment of volatility based on time of day
- Configurable time multipliers for different periods

### 3. **Asset Class Differentiation**

#### Symbol-Specific Characteristics
- **Cryptocurrencies (BTC, ETH)**: 2.5x base volatility, $20K-$50K price range
- **High-Beta Stocks (TSLA)**: 2.0x base volatility, $200-$300 price range
- **Large-Cap Tech (AAPL, MSFT)**: 1.2x base volatility, $100-$300 price range
- **Other Assets**: 1.0x base volatility, $50-$200 price range

#### Base Price Ranges
- Realistic starting prices based on asset class
- Random variation within reasonable ranges
- Maintains price consistency across updates

### 4. **Volume Patterns**

#### Price-Volume Correlation
- **Movement Correlation**: Volume increases with price movement magnitude
- **Volatility Relationship**: Higher volatility leads to higher volume
- **Correlation Factor**: 60% correlation between price changes and volume

#### Intraday Volume Cycles
- **Sinusoidal Patterns**: Volume follows cyclical patterns throughout the day
- **Random Variation**: Additional randomness to prevent predictable patterns
- **Dynamic Adjustment**: Volume responds to market conditions

### 5. **News and Event Simulation**

#### Random Market Events
- **Event Frequency**: Random news events every 1-4 hours per symbol
- **Volatility Impact**: 3x normal volatility during news events
- **Gradual Decay**: Volatility gradually returns to normal over 30 minutes

#### Event Characteristics
- Unpredictable timing for realistic testing
- Symbol-specific event tracking
- Gradual return to normal market conditions

### 6. **Correlation Effects**

#### Inter-Symbol Relationships
- **Correlation Groups**: Symbols grouped by asset class and sector
- **Cross-Asset Effects**: Price movements in one symbol affect related symbols
- **Correlation Strength**: 30% correlation effect between related assets

#### Group Classifications
- **Crypto Group**: BTC, ETH (correlation 1.0)
- **Tech Group**: AAPL, MSFT (correlation 2.0)
- **High-Tech**: TSLA (correlation 2.1)
- **Other Assets**: General assets (correlation 3.0)

## Configuration Parameters

### Volatility Settings
```typescript
const VOLATILITY_CONFIG = {
  BASE_VOLATILITY: 0.0015, // 0.15% base volatility
  VOLATILITY_CLUSTERING_FACTOR: 0.7,
  MEAN_REVERSION_FACTOR: 0.1,
  TREND_PERSISTENCE: 0.8,
} as const;
```

### Time Multipliers
```typescript
const TIME_MULTIPLIERS = {
  OPENING_VOLATILITY_MULTIPLIER: 2.5,
  LUNCH_VOLATILITY_MULTIPLIER: 0.6,
  CLOSING_VOLATILITY_MULTIPLIER: 1.8,
} as const;
```

### Event Settings
```typescript
const EVENT_CONFIG = {
  NEWS_VOLATILITY_MULTIPLIER: 3.0,
  VOLUME_PRICE_CORRELATION: 0.6,
} as const;
```

## API Routes Implementation

### Market Data API Routes (`/api/market-data`)
```typescript
// GET /api/market-data/:symbol
export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    const marketData = await generateMockMarketData(symbol);
    
    return Response.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/market-data/add-symbol
export async function POST(request: Request) {
  try {
    const { symbol } = await request.json();
    await addSymbolToRealTime(symbol);
    
    return Response.json({
      success: true,
      message: `Symbol ${symbol} added to real-time monitoring`
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### WebSocket Implementation (`/api/websocket`)
```typescript
// WebSocket connection handler
export function GET(request: Request) {
  const { socket, response } = Deno.upgradeWebSocket(request);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    startRealTimeUpdates(socket);
  };
  
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleWebSocketMessage(socket, message);
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    stopRealTimeUpdates(socket);
  };
  
  return response;
}
```

## Usage Examples

### Basic Symbol Addition
```typescript
// Add symbols to monitoring via API
const response = await fetch('/api/market-data/add-symbol', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ symbol: 'BTC' })
});

const result = await response.json();
console.log(result.message); // "Symbol BTC added to real-time monitoring"
```

### Starting Real-Time Updates
```typescript
// Connect to WebSocket for real-time updates
const ws = new WebSocket('/api/websocket');

ws.onopen = () => {
  console.log('Connected to real-time market data');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received market data:', data);
};

ws.onclose = () => {
  console.log('Disconnected from real-time market data');
};
```

### Getting Real-Time Data
```typescript
// Get current market data for a symbol
const response = await fetch('/api/market-data/BTC');
const { data: btcData } = await response.json();

// Get all real-time data
const allDataResponse = await fetch('/api/market-data');
const { data: allData } = await allDataResponse.json();
```

## React Hook Integration

### useMarketData Hook
```typescript
import { useState, useEffect } from 'react';

export function useMarketData(symbol: string) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/market-data/${symbol}`);
        const { data, success } = await response.json();
        
        if (success) {
          setMarketData(data);
        } else {
          setError('Failed to fetch market data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time updates via WebSocket
    const ws = new WebSocket('/api/websocket');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbol === symbol) {
        setMarketData(data);
      }
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  return { marketData, loading, error };
}
```

## Benefits for Testing

### 1. **Realistic Market Conditions**
- Price movements that resemble actual trading
- Volume patterns that correlate with price changes
- Time-based volatility that matches real markets

### 2. **Predictable but Unpredictable**
- Configurable parameters for consistent testing
- Random elements for realistic market behavior
- Reproducible scenarios when needed

### 3. **Comprehensive Testing**
- Multiple asset classes with different characteristics
- Various market conditions (calm, volatile, trending)
- Real-time data generation for UI testing

### 4. **Performance Testing**
- Sub-100ms update frequency
- Multiple symbols simultaneously
- Realistic data volumes for stress testing

## Future Enhancements

### 1. **Advanced Market Models**
- GARCH volatility models
- Jump-diffusion processes
- Regime-switching models

### 2. **Market Microstructure**
- Bid-ask spread simulation
- Order book depth
- Market impact modeling

### 3. **Economic Events**
- Earnings announcements
- Economic data releases
- Central bank decisions

### 4. **Sector Rotation**
- Industry-specific correlations
- Sector momentum effects
- Cross-sector relationships

### 5. **Next.js Specific Enhancements**
- **Edge Functions**: Deploy market data generation globally
- **Server-Side Rendering**: Pre-render market data for SEO
- **Static Generation**: Generate static market data snapshots
- **Incremental Static Regeneration**: Update market data periodically

## Conclusion

The enhanced `MockRealTimeService` provides a robust foundation for testing day trading strategies with realistic market conditions using **Next.js** and **WebSocket technology**. The sophisticated noise generation ensures that trading algorithms are tested against data that closely resembles real market behavior, improving the reliability of strategy testing and development.

The **Next.js architecture** provides additional benefits:
- **Global deployment** via Vercel edge network
- **Real-time updates** via WebSocket connections
- **Type safety** with TypeScript
- **Scalable architecture** for production use

# AI Analysis Architecture - Polling vs Real-Time

## Overview

The Rockefeller AI system has been restructured to implement a **dual-layer analysis approach** that separates **AI analysis** (comprehensive, periodic) from **technical analysis** (lightweight, real-time) using **Next.js API routes** and **WebSocket connections**.

## Architecture Components

### 1. Polling-Based AI Analysis (Periodic)
- **Frequency**: Every 5 minutes (configurable per symbol)
- **Scope**: Comprehensive analysis including sentiment, market regime, risk assessment
- **Performance**: Slower (500ms) but thorough
- **Use Case**: Strategic decisions, portfolio management, long-term positioning

### 2. Real-Time Technical Analysis (On Every Update)
- **Frequency**: Every symbol price update (100ms intervals)
- **Scope**: Lightweight technical indicators and patterns
- **Performance**: Fast (50-75ms) for immediate trading decisions
- **Use Case**: Entry/exit signals, stop-loss management, scalping opportunities

## API Routes Structure

### AI Analysis API Routes (`/api/ai-analysis`)
- **Primary Role**: Coordinates analysis timing and triggers
- **AI Analysis Timer**: Runs every minute to check which symbols need AI analysis
- **Real-Time Triggers**: Automatically triggers technical analysis on every symbol update
- **Event System**: Fires events for different analysis types

### Real-Time WebSocket Service (`/api/websocket`)
- **WebSocket Connection**: Real-time bidirectional communication
- **Market Data Streams**: Live price and volume updates
- **Analysis Results**: Real-time analysis results streaming
- **Event Broadcasting**: Broadcasting analysis events to connected clients

### Technical Analysis API Routes (`/api/technical-analysis`)
- **Comprehensive Analysis**: Full indicator suite calculations
- **Real-Time Methods**: Fast calculations for RSI, MACD, Bollinger Bands, SMA
- **Performance Optimization**: Different calculation depths for different use cases

## Analysis Flow

### AI Analysis Polling (Every 5 Minutes)
```
1. AI Analysis Timer triggers
2. Check symbols that need analysis
3. Perform comprehensive analysis:
   - Technical indicators (full suite)
   - Market sentiment analysis
   - Market regime detection
   - Risk assessment
   - Performance prediction
4. Store results and update last analysis time
5. Fire AI analysis event via WebSocket
```

### Real-Time Technical Analysis (Every 100ms)
```
1. Symbol price update occurs
2. WebSocket service triggers analysis
3. Perform fast technical analysis:
   - RSI, MACD, Bollinger Bands, SMA
   - Trend direction and strength
   - Volatility calculation
4. Fire real-time analysis event via WebSocket
5. Update real-time analysis cache
```

## Configuration

### AI Analysis Intervals
- **Default**: 5 minutes per symbol
- **Configurable**: Per-symbol intervals via API
- **Startup**: Initial analysis on service start
- **Dynamic**: Can be adjusted based on market conditions

### Real-Time Analysis
- **Frequency**: 100ms (configurable)
- **Scope**: All active symbols
- **Performance**: Optimized for sub-100ms response
- **Memory**: Efficient caching of recent results

## Benefits

### Performance
- **AI Analysis**: Comprehensive but slower, runs periodically
- **Technical Analysis**: Fast and lightweight, runs continuously
- **Resource Management**: Efficient use of computational resources

### Trading Decisions
- **Strategic**: AI analysis provides long-term positioning guidance
- **Tactical**: Real-time analysis provides immediate entry/exit signals
- **Risk Management**: Continuous monitoring with periodic deep analysis

### Scalability
- **Symbol Management**: Easy to add/remove symbols from analysis
- **Interval Control**: Different symbols can have different analysis frequencies
- **Event-Driven**: Asynchronous processing prevents blocking

## Implementation Details

### WebSocket Event System
```typescript
// Real-time analysis events
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// Event types
const EventTypes = {
  TECHNICAL: 'TECHNICAL',           // Real-time technical analysis
  DAY_TRADING: 'DAY_TRADING',       // Real-time day trading analysis  
  RISK: 'RISK',                     // Real-time risk assessment
  PERFORMANCE: 'PERFORMANCE',       // Real-time performance prediction
  AI_ANALYSIS: 'AI_ANALYSIS',       // Periodic AI analysis
} as const;
```

### API Routes Structure
```typescript
// AI Analysis API Routes
app/api/ai-analysis/
├── route.ts                    // Main AI analysis endpoint
├── strategy/
│   └── route.ts               // Strategy analysis
├── market-regime/
│   └── route.ts               // Market regime detection
├── risk-assessment/
│   └── route.ts               // Risk assessment
├── technical/
│   └── route.ts               // Technical analysis
├── sentiment/
│   └── route.ts               // Sentiment analysis
├── signals/
│   └── route.ts               // Trading signals
├── performance-prediction/
│   └── route.ts               // Performance prediction
└── real-time/
    └── route.ts               // Real-time analysis

// WebSocket API
app/api/websocket/
└── route.ts                   // WebSocket connection handler
```

### Analysis Methods
```typescript
// Periodic AI Analysis
interface AIAnalysisService {
  analyzeStrategyOnTheFly(symbol: string, strategyType: string, parameters: Record<string, any>): Promise<AIStrategyAnalysis>
  detectIntradayMarketRegime(symbol: string, timeframe?: string): Promise<MarketRegime>
  assessDayTradeRisk(symbol: string, strategyType: string, positionSize: number): Promise<RiskAssessment>
}

// Real-Time Technical Analysis
interface TechnicalAnalysisService {
  performRealTimeTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysisResult>
  performRealTimeDayTradingAnalysis(symbol: string): Promise<DayTradingAnalysis>
  performRealTimeRiskAssessment(symbol: string): Promise<RiskAssessment>
  performRealTimePerformancePrediction(symbol: string): Promise<PerformancePrediction>
}
```

### Service Management
```typescript
// Start/Stop periodic analysis
interface AnalysisManager {
  startPeriodicAIAnalysis(): Promise<void>
  stopPeriodicAIAnalysis(): Promise<void>
  isPeriodicAIAnalysisRunning(): Promise<boolean>
}
```

## Usage Examples

### Starting the System
```typescript
// Start real-time updates via WebSocket
const ws = new WebSocket('/api/websocket');

// Start AI analysis polling via API
await fetch('/api/ai-analysis/start', { method: 'POST' });

// Add symbols to monitoring
await fetch('/api/market-data/add-symbol', {
  method: 'POST',
  body: JSON.stringify({ symbol: 'AAPL' })
});
```

### Handling Analysis Events
```typescript
// Subscribe to real-time analysis events via WebSocket
ws.onmessage = (event) => {
  const message: WebSocketMessage = JSON.parse(event.data);
  
  switch (message.type) {
    case 'TECHNICAL':
      // Handle real-time technical analysis
      handleTechnicalAnalysis(message.data);
      break;
      
    case 'AI_ANALYSIS':
      // Handle periodic AI analysis
      handleAIAnalysis(message.data);
      break;
  }
};
```

### API Route Implementation
```typescript
// /api/ai-analysis/strategy/route.ts
export async function POST(request: Request) {
  try {
    const { symbol, strategyType, parameters } = await request.json();
    
    const analysis = await aiAnalysisService.analyzeStrategyOnTheFly(
      symbol, 
      strategyType, 
      parameters
    );
    
    // Broadcast result via WebSocket
    await broadcastToWebSocket({
      type: 'AI_ANALYSIS',
      data: analysis,
      timestamp: new Date().toISOString()
    });
    
    return Response.json({ success: true, data: analysis });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

## Future Enhancements

### Adaptive Intervals
- **Market Volatility**: Increase frequency during volatile periods
- **Symbol Activity**: Higher frequency for actively traded symbols
- **Performance Metrics**: Adjust based on analysis quality

### Machine Learning Integration
- **Pattern Recognition**: Learn from successful analysis patterns
- **Interval Optimization**: ML-driven analysis timing
- **Signal Quality**: Continuous improvement of analysis accuracy

### Multi-Exchange Support
- **Exchange-Specific**: Different analysis strategies per exchange
- **Latency Optimization**: Exchange-specific timing considerations
- **Regulatory Compliance**: Exchange-specific risk parameters

### Edge Computing
- **Vercel Edge Functions**: Deploy analysis functions globally
- **Regional Optimization**: Analysis closer to data sources
- **Reduced Latency**: Sub-100ms analysis response times

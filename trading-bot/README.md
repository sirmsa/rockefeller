# AI-Regulated Trading Bot (Local Environment)

An automated trading bot leveraging technical analysis and AI sentiment analysis, built for **local operation** with Binance as the primary data and broker provider.

## 🚀 Features

- **Local-First Architecture**: No external databases or Redis required
- **Binance API Integration**: Full integration with Binance REST API and WebSocket streams
- **AI Sentiment Analysis**: Real-time sentiment polling from multiple sources
- **Technical Analysis**: AI-optimized technical indicators and trend analysis
- **Portfolio Management**: Multi-portfolio system with budget management
- **Risk Management**: Advanced risk metrics and position sizing
- **Real-time Monitoring**: WebSocket-based real-time data and alerts
- **Comprehensive Logging**: Structured logging with daily file rotation
- **Local Session Storage**: File-based data persistence with import/export
- **Backtesting Engine**: Historical data simulation and strategy validation

## 📋 Prerequisites

- Node.js 18+ 
- Binance API account with trading permissions
- Local file system access for session storage

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config/env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Or production mode
   npm run build
   npm start
   ```

**That's it!** No database setup, Redis installation, or complex configuration required.

## ⚙️ Configuration

### Required Environment Variables

```bash
# Binance API (Required)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Security (Required)
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Session Storage (Optional - defaults provided)
SESSION_DIR=sessions
SESSION_CLEANUP_INTERVAL=3600000
```

### Local Session Storage

The trading bot uses local file-based storage for all data:

```
trading-bot/
├── sessions/           # Session data storage
│   ├── session1.json  # Portfolio and trade data
│   ├── session2.json  # AI analysis results
│   └── ...            # Additional sessions
├── logs/              # Application logs
└── config/            # Configuration files
```

**Session data includes:**
- Portfolio configurations and balances
- Trade history and performance metrics
- AI sentiment analysis results
- Technical analysis data
- Cache and temporary data

**Benefits:**
- No external database required
- Easy backup and restore
- Portable between machines
- Fast local access

### Optional Configuration

See `config/env.example` for all available configuration options including:
- Trading parameters
- AI analysis settings
- Risk management thresholds
- API rate limiting
- Logging configuration

## 🏃‍♂️ Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

## 📁 Project Structure

```
trading-bot/
├── src/
│   ├── core/                 # Core system components
│   │   ├── ConfigManager.ts  # Configuration management
│   │   ├── BinanceManager.ts # Binance API integration
│   │   └── models/           # Core data models
│   ├── portfolio/            # Portfolio management
│   ├── ai/                   # AI analysis engine
│   ├── trading/              # Trading engine
│   ├── analytics/            # Analytics and monitoring
│   ├── logging/              # Logging system
│   ├── database/             # Database management
│   ├── api/                  # REST API and WebSocket
│   └── utils/                # Utility functions
├── tests/                    # Test files
├── config/                   # Configuration files
├── logs/                     # Log files
└── docs/                     # Documentation
```

## 📁 Project Structure

```
trading-bot/
├── src/
│   ├── core/              # Core application logic
│   │   ├── ConfigManager.ts
│   │   └── models/
│   ├── utils/             # Utility functions
│   │   ├── SessionManager.ts    # Local file storage
│   │   ├── RateLimiter.ts       # In-memory rate limiting
│   │   ├── WebSocketManager.ts  # WebSocket connections
│   │   ├── CryptoUtils.ts       # Cryptographic utilities
│   │   └── ValidationUtils.ts   # Data validation
│   ├── logging/           # Logging system
│   ├── portfolio/         # Portfolio management
│   ├── ai/               # AI analysis engine
│   ├── trading/          # Trading engine
│   └── api/              # REST API endpoints
├── sessions/             # Local session storage
├── logs/                 # Application logs
├── config/               # Configuration files
└── tests/                # Test files
```

## 🔧 Core Components

### SessionManager
- Local file-based data persistence
- Portfolio and trade data storage
- AI analysis result caching
- Session import/export functionality

### BinanceManager
- REST API integration with rate limiting
- WebSocket streams for real-time data
- User Data Stream for account updates
- Order management and execution

### PortfolioManager
- Multi-portfolio system
- Budget allocation and management
- Portfolio analytics and performance tracking
- Risk management integration

### AISymbolAnalysis
- Sentiment analysis from multiple sources
- News and social media sentiment
- Market sentiment aggregation
- Confidence scoring and reasoning

### TechnicalAnalysis
- RSI, MA, EMA calculations
- Fibonacci retracements
- Support/resistance detection
- AI-optimized parameters

### TradingEngine
- Automated decision making
- Position management
- Order execution and monitoring
- Stop-loss and take-profit automation

## 🔒 Security

- HMAC SHA256 signature generation for Binance API
- API key encryption and secure storage
- JWT authentication for internal API
- Rate limiting and DDoS protection
- Comprehensive audit logging

## 📊 Monitoring

- Real-time performance tracking
- Risk metrics monitoring
- System health checks
- Alert notifications
- Comprehensive logging

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ConfigManager.test.ts
```

## 📈 Performance

- **Latency**: < 100ms for trade execution
- **Throughput**: Handle 1000+ symbols simultaneously
- **Local Storage**: Fast file-based data access
- **Memory Usage**: Efficient in-memory rate limiting and caching
- **Rate Limits**: Compliant with Binance API limits
- **No External Dependencies**: No database or Redis overhead

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is for educational and research purposes only. Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. The value of cryptocurrencies can go down as well as up, and you may lose some or all of your investment. Past performance does not guarantee future results.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the configuration examples

## 🔄 Roadmap

- [ ] Advanced AI models integration
- [ ] Machine learning optimization
- [ ] Multi-exchange support
- [ ] Mobile application
- [ ] Advanced backtesting features
- [ ] Social trading features

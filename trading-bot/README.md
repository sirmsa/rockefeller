# AI-Regulated Trading Bot

An automated trading bot leveraging technical analysis and AI sentiment analysis, built on Binance as the primary data and broker provider.

## 🚀 Features

- **Binance API Integration**: Full integration with Binance REST API and WebSocket streams
- **AI Sentiment Analysis**: Real-time sentiment polling from multiple sources
- **Technical Analysis**: AI-optimized technical indicators and trend analysis
- **Portfolio Management**: Multi-portfolio system with budget management
- **Risk Management**: Advanced risk metrics and position sizing
- **Real-time Monitoring**: WebSocket-based real-time data and alerts
- **Comprehensive Logging**: Structured logging with daily file rotation
- **Backtesting Engine**: Historical data simulation and strategy validation

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- Binance API account with trading permissions

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

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb trading_bot
   
   # Run migrations
   npm run migrate
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

## ⚙️ Configuration

### Required Environment Variables

```bash
# Binance API (Required)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Security (Required)
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Database (Required)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_bot
DB_USER=trading_bot_user
DB_PASSWORD=your_db_password

# Redis (Required)
REDIS_HOST=localhost
REDIS_PORT=6379
```

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

## 🔧 Core Components

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
- **Uptime**: 99.9% availability target
- **Rate Limits**: Compliant with Binance API limits

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

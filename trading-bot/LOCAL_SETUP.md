# Local Environment Quick Start Guide

This guide will help you get the AI Trading Bot running on your local machine in minutes.

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- Binance API account with trading permissions
- Basic knowledge of cryptocurrency trading

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd trading-bot

# Install dependencies
npm install

# Copy environment configuration
cp config/env.example .env
```

### 3. Configuration
Edit `.env` file with your Binance API credentials:
```bash
# Required - Get these from your Binance account
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET_KEY=your_binance_secret_key_here

# Required - Generate secure random strings
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

### 4. Start the Bot
```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm run build
npm start
```

**That's it!** The bot is now running locally on your machine.

## 📁 What Gets Created

When you first run the bot, these directories will be created automatically:

```
trading-bot/
├── sessions/           # Your trading data
│   └── (session files created automatically)
├── logs/              # Application logs
│   ├── app.log        # Daily rotating logs
│   └── error.log      # Error logs
└── .env               # Your configuration
```

## 🔧 Local Environment Benefits

### ✅ **No External Dependencies**
- No PostgreSQL database to install
- No Redis server to configure
- No complex infrastructure setup

### ✅ **Fast and Simple**
- Instant startup (no database connections)
- Local file access (no network latency)
- In-memory operations where possible

### ✅ **Portable**
- Easy to backup (just copy the `sessions/` folder)
- Can move between machines easily
- No data migration needed

### ✅ **Secure**
- All data stays on your machine
- No external database security concerns
- Local file system security only

## 📊 Monitoring Your Bot

### Session Data
- Portfolio configurations and balances
- Trade history and performance
- AI analysis results
- Technical analysis data

### Logs
- Application logs in `logs/app.log`
- Error logs in `logs/error.log`
- Daily rotation to manage disk space

### Performance
- Memory usage (in-memory rate limiting)
- Disk usage (session files)
- Network usage (Binance API calls only)

## 🔄 Backup and Restore

### Backup
```bash
# Backup your sessions
cp -r sessions/ backup-sessions-$(date +%Y%m%d)/

# Backup your configuration
cp .env backup-config-$(date +%Y%m%d)/
```

### Restore
```bash
# Restore sessions
cp -r backup-sessions-YYYYMMDD/* sessions/

# Restore configuration
cp backup-config-YYYYMMDD .env
```

## 🛠️ Troubleshooting

### Common Issues

**Bot won't start:**
- Check that Node.js 18+ is installed
- Verify your `.env` file has all required fields
- Check the logs in `logs/error.log`

**API errors:**
- Verify your Binance API keys are correct
- Check API key permissions (trading enabled)
- Ensure your IP is whitelisted if required

**Performance issues:**
- Monitor disk space in `sessions/` directory
- Check memory usage for long-running sessions
- Review log files for errors

### Getting Help
- Check the main README.md for detailed documentation
- Review the logs in `logs/` directory
- Create an issue in the repository

## 🎯 Next Steps

Once your bot is running locally:

1. **Create your first portfolio** using the API
2. **Configure trading parameters** in your `.env` file
3. **Monitor performance** through logs and session data
4. **Backup regularly** to protect your trading data

## ⚠️ Important Notes

- **This is for educational purposes** - trade at your own risk
- **Start with small amounts** to test the system
- **Monitor the bot regularly** - it's running on your machine
- **Keep your API keys secure** - they control your Binance account
- **Backup your sessions** - they contain your trading history

Happy trading! 🚀

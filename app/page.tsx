'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-bg-dark-grey to-bg-dark-grey-light texture-subtle">
      {/* App Bar */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-red-500/20 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-clean">
                <span className="text-black font-black text-sm">R</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight">Rockefeller</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#dashboard" className="text-white font-medium">
                Dashboard
              </a>
              <a href="#trading" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Trading
              </a>
              <a href="#analytics" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Analytics
              </a>
              <a href="#portfolio" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Portfolio
              </a>
              <Link href="/design-system" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Design System
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-white/80 hover:text-white transition-colors duration-200">
                <div className="w-5 h-5 icon-bell"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JD</span>
                </div>
                <span className="text-white font-medium hidden sm:block">John Doe</span>
                <button className="p-1 text-white/60 hover:text-white transition-colors duration-200">
                  <div className="w-4 h-4 icon-chevron-down"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-bg-dark-grey"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-rgba(220, 38, 38, 0.05)"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rgba(220, 38, 38, 0.03)"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 animate-fade-in tracking-tight">
              <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                Rockefeller
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-8 font-bold animate-fade-in tracking-wide">
              The World's Most Intelligent
              <span className="text-red-500 font-black ml-2 animate-pulse-subtle">Automated Trading Platform</span>
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in font-medium">
              Create portfolios, let AI trade for you, and watch your wealth grow with institutional-grade technology. 
              Powered by advanced algorithms and real-time sentiment analysis.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Link 
                href="/dashboard"
                className="group relative px-8 py-4 gradient-clean text-white font-bold rounded-lg shadow-clean hover:shadow-clean-hover transition-all duration-300 hover-lift outline-red outline-red-hover"
              >
                <span className="relative z-10">Start Trading</span>
              </Link>
              
              <Link 
                href="/analytics"
                className="group px-8 py-4 border-red-subtle text-red-500 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 hover-glow border-red-subtle-hover bg-dark-grey"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Dashboard */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 animate-fade-in tracking-tight">
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Trading Performance
            </span>
          </h2>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Total Portfolio Value */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card hover:shadow-card-hover border-clean animate-fade-in animate-stagger-1">
              <div className="card-icon-svg icon-trending-up"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">Portfolio Value</div>
                <div className="card-icon-subtitle">$2,847,392</div>
              </div>
            </div>

            {/* Daily P&L */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card-red hover:shadow-card-red-hover border-clean animate-fade-in animate-stagger-2">
              <div className="card-icon-svg icon-chart"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">Daily P&L</div>
                <div className="card-icon-subtitle text-green-400">+$23,847</div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card hover:shadow-card-hover outline-card hover:outline-card-hover animate-fade-in animate-stagger-3">
              <div className="card-icon-svg icon-shield"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">Win Rate</div>
                <div className="card-icon-subtitle">87.3%</div>
              </div>
            </div>

            {/* Active Trades */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card-red hover:shadow-card-red-hover border-clean animate-fade-in animate-stagger-4">
              <div className="card-icon-svg icon-cog"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">Active Trades</div>
                <div className="card-icon-subtitle">24</div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Trades */}
            <div className="lg:col-span-2">
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h3 className="text-2xl font-black text-white mb-6 tracking-wide">Recent Trades</h3>
                <div className="space-y-4">
                  {/* Trade 1 */}
                  <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TSLA</span>
                      </div>
                      <div>
                        <div className="text-white font-bold">Tesla Inc.</div>
                        <div className="text-white/60 text-sm">Bought 100 shares @ $245.67</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+$1,234</div>
                      <div className="text-white/60 text-sm">2 min ago</div>
                    </div>
                  </div>

                  {/* Trade 2 */}
                  <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AAPL</span>
                      </div>
                      <div>
                        <div className="text-white font-bold">Apple Inc.</div>
                        <div className="text-white/60 text-sm">Sold 50 shares @ $178.92</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold">-$567</div>
                      <div className="text-white/60 text-sm">15 min ago</div>
                    </div>
                  </div>

                  {/* Trade 3 */}
                  <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">NVDA</span>
                      </div>
                      <div>
                        <div className="text-white font-bold">NVIDIA Corp.</div>
                        <div className="text-white/60 text-sm">Bought 75 shares @ $892.45</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+$2,891</div>
                      <div className="text-white/60 text-sm">1 hour ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Quick Trade */}
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h3 className="text-xl font-black text-white mb-4 tracking-wide">Quick Trade</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Symbol</label>
                    <input 
                      type="text" 
                      placeholder="Enter symbol..."
                      className="w-full px-4 py-3 bg-dark-grey-light border-clean rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Amount</label>
                    <input 
                      type="text" 
                      placeholder="$1,000"
                      className="w-full px-4 py-3 bg-dark-grey-light border-clean rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    />
                  </div>
                  <button className="w-full px-4 py-3 gradient-clean text-white font-bold rounded-lg shadow-clean hover:shadow-clean-hover transition-all duration-300 hover-lift">
                    Execute Trade
                  </button>
                </div>
              </div>

              {/* Market Status */}
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h3 className="text-xl font-black text-white mb-4 tracking-wide">Market Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">S&P 500</span>
                    <span className="text-green-400 font-bold">+1.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">NASDAQ</span>
                    <span className="text-green-400 font-bold">+0.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">DOW</span>
                    <span className="text-red-400 font-bold">-0.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-grey border-t border-red-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-clean">
                  <span className="text-black font-black text-sm">R</span>
                </div>
                <span className="text-xl font-black text-white tracking-tight">Rockefeller</span>
              </div>
              <p className="text-white/60 text-sm">
                The World's Most Intelligent Automated Trading Platform
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Dashboard</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Trading</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Analytics</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Portfolio</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Status</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Security</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2024 Rockefeller Trading System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}



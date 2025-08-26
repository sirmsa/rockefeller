import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  
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
                {t('navigation.dashboard')}
              </a>
              <a href="#trading" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                {t('navigation.trading')}
              </a>
              <a href="#analytics" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                {t('navigation.analytics')}
              </a>
              <a href="#portfolio" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                {t('navigation.portfolio')}
              </a>
              <Link href="/design-system" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                {t('navigation.designSystem')}
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex items-center space-x-2">
                <Link 
                  href="/en"
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 border rounded-lg ${
                    locale === 'en' 
                      ? 'text-white border-red-500/50 bg-red-500/10' 
                      : 'text-white/80 hover:text-white border-white/20 hover:border-red-500/50 hover:bg-red-500/10'
                  }`}
                >
                  🇺🇸 English
                </Link>
                <Link 
                  href="/pl"
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 border rounded-lg ${
                    locale === 'pl' 
                      ? 'text-white border-red-500/50 bg-red-500/10' 
                      : 'text-white/80 hover:text-white border-white/20 hover:border-red-500/50 hover:bg-red-500/10'
                  }`}
                >
                  🇵🇱 Polski
                </Link>
              </div>

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
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-8 font-bold animate-fade-in tracking-wide">
              {t('hero.subtitle')}
              <span className="text-red-500 font-black ml-2 animate-pulse-subtle">{t('hero.highlight')}</span>
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in font-medium">
              {t('hero.description')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Link 
                href="/dashboard"
                className="group relative px-8 py-4 gradient-clean text-white font-bold rounded-lg shadow-clean hover:shadow-clean-hover transition-all duration-300 hover-lift outline-red outline-red-hover"
              >
                <span className="relative z-10">{t('hero.startTrading')}</span>
              </Link>
              
              <Link 
                href="/analytics"
                className="group px-8 py-4 border-red-subtle text-red-500 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 hover-glow border-red-subtle-hover bg-dark-grey"
              >
                {t('hero.viewAnalytics')}
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
              {t('dashboard.title')}
            </span>
          </h2>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Total Portfolio Value */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card hover:shadow-card-hover border-clean animate-fade-in animate-stagger-1">
              <div className="card-icon-svg icon-trending-up"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">{t('dashboard.portfolioValue')}</div>
                <div className="card-icon-subtitle">$2,847,392</div>
              </div>
            </div>

            {/* Daily P&L */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card-red hover:shadow-card-red-hover border-clean animate-fade-in animate-stagger-2">
              <div className="card-icon-svg icon-chart"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">{t('dashboard.dailyPL')}</div>
                <div className="card-icon-subtitle text-green-400">+$23,847</div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card hover:shadow-card-hover outline-card hover:outline-card-hover animate-fade-in animate-stagger-3">
              <div className="card-icon-svg icon-shield"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">{t('dashboard.winRate')}</div>
                <div className="card-icon-subtitle">87.3%</div>
              </div>
            </div>

            {/* Active Trades */}
            <div className="card-icon bg-dark-grey rounded-lg shadow-card-red hover:shadow-card-red-hover border-clean animate-fade-in animate-stagger-4">
              <div className="card-icon-svg icon-cog"></div>
              <div className="card-icon-content">
                <div className="card-icon-title">{t('dashboard.activeTrades')}</div>
                <div className="card-icon-subtitle">24</div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Trades */}
            <div className="lg:col-span-2">
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h3 className="text-2xl font-black text-white mb-6 tracking-wide">{t('dashboard.recentTrades')}</h3>
                <div className="space-y-4">
                  {/* Trade 1 */}
                  <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TSLA</span>
                      </div>
                      <div>
                        <div className="text-white font-bold">{t('trades.tesla')}</div>
                        <div className="text-white/60 text-sm">{t('trades.bought', { shares: 100, price: '245.67' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+$1,234</div>
                      <div className="text-white/60 text-sm">{t('trades.ago', { time: `2 ${t('trades.min')}` })}</div>
                    </div>
                  </div>

                  {/* Trade 2 */}
                  <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AAPL</span>
                      </div>
                      <div>
                        <div className="text-white font-bold">{t('trades.apple')}</div>
                        <div className="text-white/60 text-sm">{t('trades.sold', { shares: 50, price: '178.92' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold">-$567</div>
                      <div className="text-white/60 text-sm">{t('trades.ago', { time: `15 ${t('trades.min')}` })}</div>
                    </div>
                  </div>

                  {/* Trade 3 */}
                  <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">NVDA</span>
                      </div>
                      <div>
                        <div className="text-white font-bold">{t('trades.nvidia')}</div>
                        <div className="text-white/60 text-sm">{t('trades.bought', { shares: 75, price: '892.45' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+$2,891</div>
                      <div className="text-white/60 text-sm">{t('trades.ago', { time: `1 ${t('trades.hour')}` })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Quick Trade */}
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h3 className="text-xl font-black text-white mb-4 tracking-wide">{t('dashboard.quickTrade')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">{t('dashboard.symbol')}</label>
                    <input 
                      type="text" 
                      placeholder={t('dashboard.enterSymbol')}
                      className="w-full px-4 py-3 bg-dark-grey-light border-clean rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">{t('dashboard.amount')}</label>
                    <input 
                      type="text" 
                      placeholder={t('dashboard.enterAmount')}
                      className="w-full px-4 py-3 bg-dark-grey-light border-clean rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    />
                  </div>
                  <button className="w-full px-4 py-3 gradient-clean text-white font-bold rounded-lg shadow-clean hover:shadow-clean-hover transition-all duration-300 hover-lift">
                    {t('dashboard.executeTrade')}
                  </button>
                </div>
              </div>

              {/* Market Status */}
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h3 className="text-xl font-black text-white mb-4 tracking-wide">{t('dashboard.marketStatus')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{t('markets.sp500')}</span>
                    <span className="text-green-400 font-bold">+1.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{t('markets.nasdaq')}</span>
                    <span className="text-green-400 font-bold">+0.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{t('markets.dow')}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-clean">
                  <span className="text-black font-black text-sm">R</span>
                </div>
                <span className="text-xl font-black text-white tracking-tight">Rockefeller</span>
              </div>
              <p className="text-white/60 text-sm">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.platform')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('navigation.dashboard')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('navigation.trading')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('navigation.analytics')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('navigation.portfolio')}</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.helpCenter')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.apiDocumentation')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.status')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.contact')}</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.privacyPolicy')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.termsOfService')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.security')}</a></li>
                <li><a href="#" className="text-white/60 hover:text-red-400 transition-colors">{t('footer.compliance')}</a></li>
              </ul>
            </div>

            {/* Language Selector */}
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.language')}</h4>
              <div className="space-y-3">
                <Link 
                  href="/en"
                  className={`flex items-center space-x-2 transition-colors text-sm ${
                    locale === 'en' 
                      ? 'text-red-400' 
                      : 'text-white/60 hover:text-red-400'
                  }`}
                >
                  <span>🇺🇸</span>
                  <span>{t('footer.english')}</span>
                </Link>
                <Link 
                  href="/pl"
                  className={`flex items-center space-x-2 transition-colors text-sm ${
                    locale === 'pl' 
                      ? 'text-red-400' 
                      : 'text-white/60 hover:text-red-400'
                  }`}
                >
                  <span>🇵🇱</span>
                  <span>{t('footer.polish')}</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}



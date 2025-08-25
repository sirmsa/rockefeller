'use client'

import Link from 'next/link'

export default function DesignSystem() {
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
              <Link href="/" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Dashboard
              </Link>
              <a href="#design-system" className="text-white font-medium">
                Design System
              </a>
              <a href="#components" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Components
              </a>
              <a href="#guidelines" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Guidelines
              </a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="px-4 py-2 border-red-subtle text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover-glow border-red-subtle-hover bg-dark-grey"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-bg-dark-grey"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-rgba(220, 38, 38, 0.05)"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rgba(220, 38, 38, 0.03)"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 animate-fade-in tracking-tight">
              <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                Design System
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-8 font-bold animate-fade-in tracking-wide">
              Complete Component Library for
              <span className="text-red-500 font-black ml-2 animate-pulse-subtle">Rockefeller Platform</span>
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in font-medium">
              Comprehensive design system showcasing all UI components, typography, colors, and interactive elements 
              used throughout the Rockefeller trading platform.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Design System Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 animate-fade-in tracking-tight">
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Enhanced Design System
            </span>
          </h2>

          {/* Font Variants */}
          <div className="mb-20 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">Font Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">Monospace Font</h4>
                <p className="font-mono text-white/80 mb-2 font-medium">Perfect for code, data, and technical content.</p>
                <code className="text-xs text-red-500 block font-bold">font-mono</code>
              </div>
              
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">UI Font</h4>
                <p className="font-ui text-white/80 mb-2 font-medium">Clean sans-serif for user interface elements.</p>
                <code className="text-xs text-red-500 block font-bold">font-ui</code>
              </div>
            </div>
          </div>

          {/* Enhanced Form Elements */}
          <div className="mb-20 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">Enhanced Form Elements</h3>
            
            {/* Enhanced Select Dropdowns */}
            <div className="mb-12">
              <h4 className="text-xl font-black text-white mb-6 tracking-wide">Enhanced Select Dropdowns</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Glass Select</label>
                  <select className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-white/40 focus:outline-none select-glass">
                    <option value="" className="text-white/40">Choose an option...</option>
                    <option value="option1" className="text-white">Trading Strategy</option>
                    <option value="option2" className="text-white">Risk Level</option>
                    <option value="option3" className="text-white">Portfolio Type</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Dark Grey Select</label>
                  <select className="w-full px-4 py-3 bg-dark-grey border-clean rounded-lg text-white placeholder-white/40 focus:outline-none select-clean">
                    <option value="" className="text-white/40">Choose an option...</option>
                    <option value="option1" className="text-white">Conservative</option>
                    <option value="option2" className="text-white">Moderate</option>
                    <option value="option3" className="text-white">Aggressive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Red Outline Select</label>
                  <select className="w-full px-4 py-3 bg-dark-grey rounded-lg text-white placeholder-white/40 focus:outline-none select-red-outline">
                    <option value="" className="text-white/40">Choose an option...</option>
                    <option value="option1" className="text-white">Daily</option>
                    <option value="option2" className="text-white">Weekly</option>
                    <option value="option3" className="text-white">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Gradient Select</label>
                  <select className="w-full px-4 py-3 bg-dark-grey rounded-lg text-white placeholder-white/40 focus:outline-none select-gradient">
                    <option value="" className="text-white/40">Choose an option...</option>
                    <option value="option1" className="text-white">Stocks</option>
                    <option value="option2" className="text-white">Crypto</option>
                    <option value="option3" className="text-white">Forex</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Checkboxes and Radio Buttons */}
            <div className="mb-12">
              <h4 className="text-xl font-black text-white mb-6 tracking-wide">Checkboxes & Radio Buttons</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-lg font-black text-white mb-4 tracking-wide">Checkboxes</h5>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="checkbox-clean" />
                      <span className="text-white/80">Enable notifications</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="checkbox-clean" defaultChecked />
                      <span className="text-white/80">Auto-trading enabled</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="checkbox-clean" />
                      <span className="text-white/80">Risk management</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-lg font-black text-white mb-4 tracking-wide">Radio Buttons</h5>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="strategy" className="radio-clean" defaultChecked />
                      <span className="text-white/80">Conservative</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="strategy" className="radio-clean" />
                      <span className="text-white/80">Moderate</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="strategy" className="radio-clean" />
                      <span className="text-white/80">Aggressive</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="mb-12">
              <h4 className="text-xl font-black text-white mb-6 tracking-wide">Enhanced Input Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Glass Input</label>
                  <input 
                    type="text" 
                    placeholder="Enter your portfolio name..."
                    className="w-full px-4 py-3 glass-effect rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-clean"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Dark Grey Input</label>
                  <input 
                    type="text" 
                    placeholder="Enter investment amount..."
                    className="w-full px-4 py-3 bg-dark-grey border-clean rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-clean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Red Outline Input</label>
                  <input 
                    type="text" 
                    placeholder="Enter risk tolerance level..."
                    className="w-full px-4 py-3 bg-dark-grey border-red-subtle rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-clean border-red-subtle-hover"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mb-12">
              <h4 className="text-xl font-black text-white mb-6 tracking-wide">Enhanced Buttons</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Primary Button */}
                <div>
                  <button className="w-full px-6 py-3 gradient-clean text-white font-bold rounded-lg shadow-clean hover:shadow-clean-hover transition-all duration-300 hover-lift outline-red outline-red-hover">
                    Primary Button
                  </button>
                  <p className="text-sm text-white/60 mt-2">Main action</p>
                </div>

                {/* Secondary Button */}
                <div>
                  <button className="w-full px-6 py-3 border-red-subtle text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover-glow border-red-subtle-hover bg-dark-grey">
                    Secondary Button
                  </button>
                  <p className="text-sm text-white/60 mt-2">Secondary action</p>
                </div>

                {/* Glass Button */}
                <div>
                  <button className="w-full px-6 py-3 glass-effect text-white font-bold rounded-lg hover:glass-effect-hover transition-all duration-300 hover-lift">
                    Glass Button
                  </button>
                  <p className="text-sm text-white/60 mt-2">Glass effect</p>
                </div>

                {/* Ghost Button */}
                <div>
                  <button className="w-full px-6 py-3 text-red-400 font-bold rounded-lg hover:bg-red-500/10 transition-all duration-300 hover-glow bg-dark-grey">
                    Ghost Button
                  </button>
                  <p className="text-sm text-white/60 mt-2">Subtle action</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Examples with Icons */}
          <div className="mb-20 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">Card Examples with Icons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Trading Performance Card */}
              <div className="card-icon bg-dark-grey rounded-lg shadow-card hover:shadow-card-hover border-clean">
                <div className="card-icon-svg icon-trending-up"></div>
                <div className="card-icon-content">
                  <div className="card-icon-title">Trading Performance</div>
                  <div className="card-icon-subtitle">+23.4% this month</div>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="card-icon bg-dark-grey rounded-lg shadow-card-red hover:shadow-card-red-hover border-clean">
                <div className="card-icon-svg icon-chart"></div>
                <div className="card-icon-content">
                  <div className="card-icon-title">Analytics Dashboard</div>
                  <div className="card-icon-subtitle">Real-time insights</div>
                </div>
              </div>

              {/* Security Card */}
              <div className="card-icon bg-dark-grey rounded-lg shadow-card hover:shadow-card-hover outline-card hover:outline-card-hover">
                <div className="card-icon-svg icon-shield"></div>
                <div className="card-icon-content">
                  <div className="card-icon-title">Security</div>
                  <div className="card-icon-subtitle">Bank-grade protection</div>
                </div>
              </div>

              {/* Settings Card */}
              <div className="card-icon bg-dark-grey rounded-lg shadow-card-red hover:shadow-card-red-hover outline-card-red hover:outline-card-red-hover">
                <div className="card-icon-svg icon-cog"></div>
                <div className="card-icon-content">
                  <div className="card-icon-title">Settings</div>
                  <div className="card-icon-subtitle">Customize your experience</div>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="card-icon bg-dark-grey rounded-lg shadow-card hover:shadow-card-hover border-clean">
                <div className="card-icon-svg icon-bell"></div>
                <div className="card-icon-content">
                  <div className="card-icon-title">Notifications</div>
                  <div className="card-icon-subtitle">Stay updated</div>
                </div>
              </div>

              {/* Profile Card */}
              <div className="card-icon bg-dark-grey rounded-lg shadow-card-red hover:shadow-card-red-hover border-clean">
                <div className="card-icon-svg icon-user"></div>
                <div className="card-icon-content">
                  <div className="card-icon-title">Profile</div>
                  <div className="card-icon-subtitle">Manage your account</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Shadows and Outlines */}
          <div className="mb-20 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-8 tracking-wide">Enhanced Shadows & Outlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Deep Shadow */}
              <div className="bg-dark-grey rounded-lg p-6 shadow-deep hover:shadow-deep-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">Deep Shadow</h4>
                <p className="text-white/80 font-medium">Dramatic depth effect.</p>
                <code className="text-xs text-red-500 mt-2 block font-bold">shadow-deep</code>
              </div>

              {/* Red Shadow */}
              <div className="bg-dark-grey rounded-lg p-6 shadow-red hover:shadow-red-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">Red Shadow</h4>
                <p className="text-white/80 font-medium">Red-tinted shadow effect.</p>
                <code className="text-xs text-red-500 mt-2 block font-bold">shadow-red</code>
              </div>

              {/* Glow Outline */}
              <div className="bg-dark-grey rounded-lg p-6 outline-glow hover:outline-glow-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">Glow Outline</h4>
                <p className="text-white/80 font-medium">Glowing border effect.</p>
                <code className="text-xs text-red-500 mt-2 block font-bold">outline-glow</code>
              </div>

              {/* Card Shadow */}
              <div className="bg-dark-grey rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">Card Shadow</h4>
                <p className="text-white/80 font-medium">Enhanced card visibility.</p>
                <code className="text-xs text-red-500 mt-2 block font-bold">shadow-card</code>
              </div>

              {/* Card Red Shadow */}
              <div className="bg-dark-grey rounded-lg p-6 shadow-card-red hover:shadow-card-red-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">Card Red Shadow</h4>
                <p className="text-white/80 font-medium">Red-accented card shadow.</p>
                <code className="text-xs text-red-500 mt-2 block font-bold">shadow-card-red</code>
              </div>

              {/* Card Outline */}
              <div className="bg-dark-grey rounded-lg p-6 outline-card hover:outline-card-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-black text-white mb-2 tracking-wide">Card Outline</h4>
                <p className="text-white/80 font-medium">Subtle outline effect.</p>
                <code className="text-xs text-red-500 mt-2 block font-bold">outline-card</code>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mb-20 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-8">Status Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="status-success rounded-lg p-6 text-white">
                <h4 className="text-xl font-bold mb-2">Success</h4>
                <p className="text-white/90">Operation completed successfully</p>
              </div>
              
              <div className="status-warning rounded-lg p-6 text-white">
                <h4 className="text-xl font-bold mb-2">Warning</h4>
                <p className="text-white/90">Please review your settings</p>
              </div>
              
              <div className="status-error rounded-lg p-6 text-white">
                <h4 className="text-xl font-bold mb-2">Error</h4>
                <p className="text-white/90">Something went wrong</p>
              </div>
              
              <div className="status-info rounded-lg p-6 text-white">
                <h4 className="text-xl font-bold mb-2">Info</h4>
                <p className="text-white/90">Here's some information</p>
              </div>
            </div>
          </div>

          {/* Clean Components */}
          <div className="mb-20 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-8">Clean Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Glass Card */}
              <div className="glass-effect rounded-lg p-6 hover:glass-effect-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-bold text-white mb-2">Glass Card</h4>
                <p className="text-white/70">Frosted glass effect with subtle blur.</p>
                <code className="text-xs text-red-400 mt-2 block">glass-effect</code>
              </div>

              {/* Clean Card */}
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean hover:shadow-clean-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-bold text-white mb-2">Clean Card</h4>
                <p className="text-white/70">Minimal design with subtle shadows.</p>
                <code className="text-xs text-red-400 mt-2 block">shadow-clean</code>
              </div>

              {/* Gradient Card */}
              <div className="gradient-clean rounded-lg p-6 shadow-clean hover:shadow-clean-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-bold text-white mb-2">Gradient Card</h4>
                <p className="text-white/90">Clean gradient background.</p>
                <code className="text-xs text-white/80 mt-2 block">gradient-clean</code>
              </div>

              {/* Dark Grey Card */}
              <div className="bg-dark-grey-light rounded-lg p-6 border-red-subtle shadow-clean hover:shadow-clean-hover transition-all duration-300 interactive-card border-red-subtle-hover">
                <h4 className="text-xl font-bold text-white mb-2">Dark Grey Card</h4>
                <p className="text-white/70">Better contrast with dark grey.</p>
                <code className="text-xs text-red-400 mt-2 block">bg-dark-grey-light</code>
              </div>

              {/* Red Outline Card */}
              <div className="bg-dark-grey rounded-lg p-6 border-red-subtle shadow-clean hover:shadow-clean-hover transition-all duration-300 interactive-card border-red-subtle-hover">
                <h4 className="text-xl font-bold text-white mb-2">Red Outline Card</h4>
                <p className="text-white/70">Subtle red border accent.</p>
                <code className="text-xs text-red-400 mt-2 block">border-red-subtle</code>
              </div>
            </div>
          </div>

          {/* Interactive Examples */}
          <div className="mb-20 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-8">Interactive Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Hover Lift */}
              <div className="bg-dark-grey rounded-lg p-6 border-clean shadow-clean hover:shadow-clean-hover transition-all duration-300 hover-lift interactive-card">
                <h4 className="text-xl font-bold text-white mb-2">Hover Lift</h4>
                <p className="text-white/70">Subtle lift effect on hover.</p>
                <code className="text-xs text-red-400 mt-2 block">hover-lift</code>
              </div>

              {/* Hover Glow */}
              <div className="bg-dark-grey rounded-lg p-6 border-red-subtle shadow-clean hover:shadow-clean-hover transition-all duration-300 hover-glow interactive-card border-red-subtle-hover">
                <h4 className="text-xl font-bold text-white mb-2">Hover Glow</h4>
                <p className="text-white/70">Gentle glow effect on hover.</p>
                <code className="text-xs text-red-400 mt-2 block">hover-glow</code>
              </div>

              {/* Glass Hover */}
              <div className="glass-effect rounded-lg p-6 hover:glass-effect-hover transition-all duration-300 interactive-card">
                <h4 className="text-xl font-bold text-white mb-2">Glass Hover</h4>
                <p className="text-white/70">Glass effect with hover state.</p>
                <code className="text-xs text-red-400 mt-2 block">glass-effect-hover</code>
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
                <li><Link href="/" className="text-white/60 hover:text-red-400 transition-colors">Dashboard</Link></li>
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

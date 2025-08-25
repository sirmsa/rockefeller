import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pure Black Palette
        black: {
          DEFAULT: '#000000',
          pure: '#000000',
          matte: '#0A0A0A',
          charcoal: '#1A1A1A',
          slate: '#2A2A2A',
          graphite: '#3A3A3A',
          carbon: '#4A4A4A',
        },
        // Red Accent Palette
        red: {
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '48px' }],
        '6xl': ['60px', { lineHeight: '60px' }],
        '7xl': ['72px', { lineHeight: '72px' }],
        '8xl': ['96px', { lineHeight: '96px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'red-sm': '0 1px 2px 0 rgba(239, 68, 68, 0.1)',
        'red-md': '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
        'red-lg': '0 10px 15px -3px rgba(239, 68, 68, 0.25)',
        'red-xl': '0 20px 25px -5px rgba(239, 68, 68, 0.3)',
        'red-2xl': '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
        'glow': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-lg': '0 0 40px rgba(239, 68, 68, 0.4)',
        'glow-xl': '0 0 60px rgba(239, 68, 68, 0.5)',
        'black-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        'black-md': '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
        'black-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.25)',
        'black-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        'matte': '0 4px 6px -1px rgba(10, 10, 10, 0.3)',
        'matte-lg': '0 10px 15px -3px rgba(10, 10, 10, 0.4)',
        'outline': '0 0 0 2px rgba(239, 68, 68, 0.2)',
        'outline-lg': '0 0 0 4px rgba(239, 68, 68, 0.15)',
        'inner-red': 'inset 0 2px 4px 0 rgba(239, 68, 68, 0.1)',
        'inner-red-lg': 'inset 0 4px 8px 0 rgba(239, 68, 68, 0.15)',
        'texture': '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'texture-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'texture-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        // Enhanced shadow effects
        'neon-red': '0 0 5px rgba(239, 68, 68, 0.5), 0 0 10px rgba(239, 68, 68, 0.3), 0 0 15px rgba(239, 68, 68, 0.1)',
        'neon-red-lg': '0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3), 0 0 30px rgba(239, 68, 68, 0.1)',
        'depth': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'depth-lg': '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        'depth-xl': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        'floating': '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
        'floating-lg': '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient': 'gradient 3s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'bounce-red': 'bounceRed 1s infinite',
        'float': 'float 3s ease-in-out infinite',
        'ripple': 'ripple 1s ease-out',
        'texture-shift': 'textureShift 4s ease-in-out infinite',
        'noise': 'noise 0.5s ease-in-out infinite',
        'grain': 'grain 2s ease-in-out infinite',
        // Enhanced animations
        'breath': 'breath 4s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'holographic': 'holographic 3s linear infinite',
        'matrix': 'matrix 4s linear infinite',
        'energy': 'energy 2s ease-in-out infinite',
        'vortex': 'vortex 6s linear infinite',
        'nebula': 'nebula 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceRed: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        textureShift: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
        },
        noise: {
          '0%, 100%': { opacity: '0.05' },
          '50%': { opacity: '0.1' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -5%)' },
          '20%': { transform: 'translate(-10%, 5%)' },
          '30%': { transform: 'translate(5%, -10%)' },
          '40%': { transform: 'translate(-5%, 15%)' },
          '50%': { transform: 'translate(-10%, 5%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 10%)' },
          '80%': { transform: 'translate(3%, 15%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
        // Enhanced keyframes
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        neonPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(239, 68, 68, 0.5), 0 0 10px rgba(239, 68, 68, 0.3), 0 0 15px rgba(239, 68, 68, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.4)' 
          },
        },
        holographic: {
          '0%': { 
            background: 'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)' 
          },
          '100%': { 
            background: 'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)' 
          },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        energy: {
          '0%, 100%': { 
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
            transform: 'scale(1)' 
          },
          '50%': { 
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, transparent 70%)',
            transform: 'scale(1.1)' 
          },
        },
        vortex: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        nebula: {
          '0%, 100%': { 
            background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 50%, transparent 100%)',
            transform: 'scale(1) rotate(0deg)' 
          },
          '50%': { 
            background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 50%, transparent 100%)',
            transform: 'scale(1.1) rotate(180deg)' 
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-red': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'gradient-red-soft': 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
        'gradient-red-dark': 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
        'gradient-red-glow': 'linear-gradient(135deg, #EF4444 0%, #F87171 50%, #EF4444 100%)',
        'gradient-black': 'linear-gradient(135deg, #000000 0%, #0A0A0A 100%)',
        'gradient-matte': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        'gradient-charcoal': 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
        'gradient-red-radial': 'radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
        'gradient-red-diagonal': 'linear-gradient(45deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
        'gradient-red-mesh': 'linear-gradient(45deg, #EF4444 0%, #F87171 25%, #DC2626 50%, #B91C1C 75%, #EF4444 100%)',
        // Enhanced gradients
        'gradient-holographic': 'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)',
        'gradient-neon': 'linear-gradient(45deg, #EF4444, #F87171, #EF4444, #DC2626, #EF4444)',
        'gradient-energy': 'radial-gradient(circle at 30% 20%, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.4) 50%, transparent 100%)',
        'gradient-vortex': 'conic-gradient(from 0deg at 50% 50%, #EF4444, #F87171, #DC2626, #B91C1C, #EF4444)',
        'gradient-nebula': 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.1) 50%, transparent 100%)',
        'gradient-matrix': 'linear-gradient(0deg, transparent 0%, rgba(239, 68, 68, 0.1) 50%, transparent 100%)',
        'gradient-fire': 'linear-gradient(45deg, #FF6B35, #F7931E, #FFD23F, #EF4444, #DC2626)',
        'gradient-cyber': 'linear-gradient(135deg, #000000 0%, #1A1A1A 25%, #EF4444 50%, #1A1A1A 75%, #000000 100%)',
        'gradient-cosmic': 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.2) 30%, transparent 70%)',
        'gradient-plasma': 'linear-gradient(45deg, #EF4444 0%, #F87171 25%, #DC2626 50%, #B91C1C 75%, #EF4444 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      const newUtilities = {
        '.text-gradient': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.bg-gradient-red': {
          'background': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        },
        '.bg-gradient-red-soft': {
          'background': 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
        },
        '.bg-gradient-red-dark': {
          'background': 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
        },
        '.bg-gradient-black': {
          'background': 'linear-gradient(135deg, #000000 0%, #0A0A0A 100%)',
        },
        '.bg-gradient-matte': {
          'background': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        },
        '.border-accent': {
          'border-color': '#EF4444',
        },
        '.shadow-glow': {
          'box-shadow': '0 0 20px rgba(239, 68, 68, 0.3)',
        },
        '.shadow-glow-lg': {
          'box-shadow': '0 0 40px rgba(239, 68, 68, 0.4)',
        },
        '.shadow-glow-xl': {
          'box-shadow': '0 0 60px rgba(239, 68, 68, 0.5)',
        },
        '.shadow-outline': {
          'box-shadow': '0 0 0 2px rgba(239, 68, 68, 0.2)',
        },
        '.shadow-outline-lg': {
          'box-shadow': '0 0 0 4px rgba(239, 68, 68, 0.15)',
        },
        '.hover-lift': {
          'transition': 'transform 0.3s ease, box-shadow 0.3s ease',
        },
        '.hover-lift:hover': {
          'transform': 'translateY(-4px)',
          'box-shadow': '0 20px 40px rgba(239, 68, 68, 0.3)',
        },
        '.hover-glow': {
          'transition': 'box-shadow 0.3s ease',
        },
        '.hover-glow:hover': {
          'box-shadow': '0 0 30px rgba(239, 68, 68, 0.4)',
        },
        '.hover-scale': {
          'transition': 'transform 0.3s ease',
        },
        '.hover-scale:hover': {
          'transform': 'scale(1.05)',
        },
        '.focus-ring': {
          'outline': 'none',
          'ring': '2px',
          'ring-color': 'rgba(239, 68, 68, 0.2)',
        },
        '.focus-ring-lg': {
          'outline': 'none',
          'ring': '4px',
          'ring-color': 'rgba(239, 68, 68, 0.15)',
        },
        '.hardware-accelerated': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
        },
        '.ripple-effect': {
          'position': 'relative',
          'overflow': 'hidden',
        },
        '.ripple-effect::after': {
          'content': '""',
          'position': 'absolute',
          'top': '50%',
          'left': '50%',
          'width': '0',
          'height': '0',
          'border-radius': '50%',
          'background': 'rgba(239, 68, 68, 0.3)',
          'transform': 'translate(-50%, -50%)',
          'transition': 'width 0.6s, height 0.6s',
        },
        '.ripple-effect:active::after': {
          'width': '300px',
          'height': '300px',
        },
        // Enhanced hover effects
        '.hover-neon': {
          'transition': 'all 0.3s ease',
        },
        '.hover-neon:hover': {
          'box-shadow': '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.4)',
          'transform': 'translateY(-2px)',
        },
        '.hover-morph': {
          'transition': 'all 0.5s ease',
        },
        '.hover-morph:hover': {
          'border-radius': '60% 40% 30% 70% / 60% 30% 70% 40%',
          'transform': 'scale(1.02)',
        },
        '.hover-energy': {
          'transition': 'all 0.4s ease',
        },
        '.hover-energy:hover': {
          'background': 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
          'transform': 'scale(1.05)',
        },
        '.hover-vortex': {
          'transition': 'all 0.6s ease',
        },
        '.hover-vortex:hover': {
          'transform': 'rotate(5deg) scale(1.02)',
          'box-shadow': '0 15px 35px rgba(239, 68, 68, 0.3)',
        },
        '.hover-breath': {
          'transition': 'all 0.4s ease',
        },
        '.hover-breath:hover': {
          'transform': 'scale(1.02)',
          'animation': 'breath 2s ease-in-out infinite',
        },
        '.hover-sparkle': {
          'position': 'relative',
          'transition': 'all 0.3s ease',
        },
        '.hover-sparkle::before': {
          'content': '""',
          'position': 'absolute',
          'top': '0',
          'left': '0',
          'right': '0',
          'bottom': '0',
          'background': 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(239, 68, 68, 0.3) 0%, transparent 50%)',
          'opacity': '0',
          'transition': 'opacity 0.3s ease',
          'pointer-events': 'none',
        },
        '.hover-sparkle:hover::before': {
          'opacity': '1',
        },
        // Texture Utilities - Fixed with CSS patterns
        '.texture-noise': {
          'background-image': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          'background-size': '20px 20px',
        },
        '.texture-grain': {
          'background-image': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          'background-size': '15px 15px',
        },
        '.texture-mesh': {
          'background-image': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          'background-size': '20px 20px',
        },
        '.texture-dots': {
          'background-image': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          'background-size': '10px 10px',
        },
        '.texture-lines': {
          'background-image': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
        },
        '.texture-hex': {
          'background-image': 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 2px, transparent 2px)',
          'background-size': '30px 30px',
        },
        '.texture-carbon': {
          'background-image': 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          'background-size': '20px 20px, 20px 20px, 20px 20px',
        },
        '.texture-circuit': {
          'background-image': 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), radial-gradient(circle at 10px 10px, rgba(255,255,255,0.03) 2px, transparent 2px)',
          'background-size': '25px 25px, 25px 25px, 25px 25px',
        },
        '.texture-waves': {
          'background-image': 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        },
        // Enhanced textures
        '.texture-holographic': {
          'background-image': 'linear-gradient(45deg, rgba(255,0,0,0.1), rgba(255,115,0,0.1), rgba(255,251,0,0.1), rgba(72,255,0,0.1), rgba(0,255,213,0.1), rgba(0,43,255,0.1), rgba(122,0,255,0.1), rgba(255,0,200,0.1))',
          'background-size': '400% 400%',
          'animation': 'gradient 3s ease infinite',
        },
        '.texture-neon': {
          'background-image': 'radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.1) 1px, transparent 0), radial-gradient(circle at 10px 10px, rgba(239, 68, 68, 0.05) 2px, transparent 0)',
          'background-size': '20px 20px, 40px 40px',
        },
        '.texture-energy': {
          'background-image': 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.05) 0%, transparent 30%)',
          'background-size': '60px 60px, 30px 30px',
        },
        '.texture-vortex': {
          'background-image': 'conic-gradient(from 0deg at 50% 50%, rgba(239, 68, 68, 0.1) 0deg, transparent 60deg, rgba(239, 68, 68, 0.1) 120deg, transparent 180deg, rgba(239, 68, 68, 0.1) 240deg, transparent 300deg)',
          'background-size': '100px 100px',
        },
        '.texture-matrix': {
          'background-image': 'linear-gradient(0deg, transparent 0%, rgba(239, 68, 68, 0.05) 50%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.05) 50%, transparent 100%)',
          'background-size': '50px 50px',
        },
        '.texture-fire': {
          'background-image': 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.05) 50%, transparent 100%)',
          'background-size': '80px 80px',
        },
        '.texture-cyber': {
          'background-image': 'linear-gradient(rgba(239, 68, 68, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.02) 1px, transparent 1px), radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.03) 1px, transparent 0)',
          'background-size': '25px 25px, 25px 25px, 25px 25px',
        },
        '.texture-cosmic': {
          'background-image': 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)',
          'background-size': '100px 100px, 80px 80px',
        },
        '.texture-plasma': {
          'background-image': 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(220, 38, 38, 0.05) 0%, transparent 50%)',
          'background-size': '60px 60px, 40px 40px',
        },
        '.texture-overlay': {
          'position': 'relative',
        },
        '.texture-overlay::before': {
          'content': '""',
          'position': 'absolute',
          'top': '0',
          'left': '0',
          'right': '0',
          'bottom': '0',
          'background-image': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          'background-size': '20px 20px',
          'pointer-events': 'none',
          'z-index': '1',
        },
        '.texture-overlay > *': {
          'position': 'relative',
          'z-index': '2',
        },
        // Interactive effects
        '.interactive-card': {
          'transition': 'all 0.3s ease',
          'cursor': 'pointer',
        },
        '.interactive-card:hover': {
          'transform': 'translateY(-8px) scale(1.02)',
          'box-shadow': '0 25px 50px rgba(239, 68, 68, 0.3)',
        },
        '.glass-effect': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-effect-hover:hover': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'border': '1px solid rgba(239, 68, 68, 0.3)',
        },
        '.neon-border': {
          'border': '2px solid transparent',
          'background': 'linear-gradient(45deg, #EF4444, #F87171, #EF4444) border-box',
          'mask': 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          'mask-composite': 'exclude',
        },
        '.neon-border-hover:hover': {
          'box-shadow': '0 0 20px rgba(239, 68, 68, 0.5)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};

export default config

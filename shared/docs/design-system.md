# Rockefeller Design System

## Overview

The Rockefeller Design System is built around a **Binance-inspired black and yellow color scheme** that conveys trust, sophistication, and financial expertise. Our design philosophy emphasizes **modern aesthetics**, **excellent usability**, and **professional credibility** for a high-stakes trading platform.

## Design Principles

### 1. **Professional Trust**
- Clean, institutional-grade aesthetics
- Consistent visual hierarchy
- Clear information architecture
- Professional color palette

### 2. **Modern Sophistication**
- Contemporary design patterns
- Smooth animations and transitions
- High-quality visual effects
- Responsive design principles

### 3. **Trading-Focused**
- Data-dense interfaces
- Real-time information display
- Clear action buttons
- Intuitive navigation

### 4. **Accessibility**
- High contrast ratios
- Clear typography
- Consistent interactive elements
- Screen reader compatibility

## Color Palette

### Primary Colors

```css
/* Black - Primary Background */
--color-black: #000000;
--color-black-rgb: 0, 0, 0;

/* Yellow - Primary Accent */
--color-yellow: #FBBF24;
--color-yellow-rgb: 251, 191, 36;

/* Yellow Dark - Secondary Accent */
--color-yellow-dark: #EAB308;
--color-yellow-dark-rgb: 234, 179, 8;
```

### Gray Scale

```css
/* Dark Grays - Backgrounds */
--color-gray-900: #111827;
--color-gray-800: #1F2937;
--color-gray-700: #374151;

/* Light Grays - Text and Borders */
--color-gray-600: #4B5563;
--color-gray-500: #6B7280;
--color-gray-400: #9CA3AF;
--color-gray-300: #D1D5DB;
```

### Semantic Colors

```css
/* Success */
--color-success: #10B981;
--color-success-light: #34D399;

/* Warning */
--color-warning: #F59E0B;
--color-warning-light: #FBBF24;

/* Error */
--color-error: #EF4444;
--color-error-light: #F87171;

/* Info */
--color-info: #3B82F6;
--color-info-light: #60A5FA;
```

## Typography

### Font Family

```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Type Scale

```css
/* Headings */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-7xl: 4.5rem;    /* 72px */
--text-8xl: 6rem;      /* 96px */
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## Gradients

### Primary Gradients

```css
/* Yellow Gradient */
--gradient-yellow: linear-gradient(to right, #FBBF24, #EAB308);

/* Background Gradient */
--gradient-background: linear-gradient(to bottom right, #000000, #111827, #000000);

/* Subtle Yellow */
--gradient-yellow-subtle: linear-gradient(to right, rgba(251, 191, 36, 0.1), transparent, rgba(251, 191, 36, 0.1));

/* Radial Yellow */
--gradient-yellow-radial: radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.1), transparent 50%);
```

### Component Gradients

```css
/* Card Gradient */
--gradient-card: linear-gradient(to bottom right, #1F2937, #111827);

/* Button Hover */
--gradient-button-hover: linear-gradient(to right, #FCD34D, #FBBF24);

/* Text Gradient */
--gradient-text: linear-gradient(to right, #FBBF24, #FCD34D, #EAB308);
```

## Spacing System

### Base Spacing

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

## Shadows

```css
/* Base Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Yellow Glow */
--shadow-yellow-sm: 0 1px 2px 0 rgba(251, 191, 36, 0.1);
--shadow-yellow-md: 0 4px 6px -1px rgba(251, 191, 36, 0.2);
--shadow-yellow-lg: 0 10px 15px -3px rgba(251, 191, 36, 0.25);
--shadow-yellow-xl: 0 20px 25px -5px rgba(251, 191, 36, 0.3);
```

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-lg shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 transform hover:scale-105;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply px-6 py-3 border-2 border-yellow-400 text-yellow-400 font-bold rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-300;
}
```

#### Ghost Button
```css
.btn-ghost {
  @apply px-6 py-3 text-yellow-400 font-bold rounded-lg hover:bg-yellow-400/10 transition-all duration-300;
}
```

#### Disabled Button
```css
.btn-disabled {
  @apply px-6 py-3 bg-gray-700 text-gray-500 font-bold rounded-lg cursor-not-allowed;
}
```

### Cards

#### Basic Card
```css
.card {
  @apply bg-gray-800 rounded-lg p-6 border border-gray-700;
}
```

#### Gradient Card
```css
.card-gradient {
  @apply bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700;
}
```

#### Accent Card
```css
.card-accent {
  @apply bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-400;
}
```

#### Glow Card
```css
.card-glow {
  @apply bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg shadow-yellow-400/10;
}
```

### Form Elements

#### Input Field
```css
.input {
  @apply w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300;
}
```

#### Select Dropdown
```css
.select {
  @apply w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300;
}
```

### Navigation

#### Nav Container
```css
.nav {
  @apply bg-gray-800 rounded-lg p-4 border border-gray-700;
}
```

#### Nav Link
```css
.nav-link {
  @apply text-gray-300 hover:text-yellow-400 transition-colors duration-300;
}
```

#### Nav Brand
```css
.nav-brand {
  @apply text-yellow-400 font-bold text-xl;
}
```

## Animations

### Transitions

```css
/* Base Transition */
--transition-base: all 0.3s ease;

/* Fast Transition */
--transition-fast: all 0.15s ease;

/* Slow Transition */
--transition-slow: all 0.5s ease;

/* Custom Transitions */
--transition-colors: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
--transition-transform: transform 0.3s ease;
--transition-opacity: opacity 0.3s ease;
```

### Hover Effects

```css
/* Scale Effect */
.hover-scale {
  @apply transition-transform duration-300 hover:scale-105;
}

/* Glow Effect */
.hover-glow {
  @apply transition-shadow duration-300 hover:shadow-yellow-400/25;
}

/* Background Effect */
.hover-bg {
  @apply transition-colors duration-300 hover:bg-yellow-400/10;
}
```

## Layout

### Container

```css
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
```

### Grid System

```css
/* Basic Grid */
.grid {
  @apply grid gap-4;
}

/* Responsive Grid */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

/* Auto Grid */
.grid-auto {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6;
}
```

### Flexbox

```css
/* Center Flex */
.flex-center {
  @apply flex items-center justify-center;
}

/* Space Between */
.flex-between {
  @apply flex items-center justify-between;
}

/* Column Flex */
.flex-col {
  @apply flex flex-col;
}
```

## Utilities

### Text Gradients

```css
.text-gradient {
  @apply bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent;
}
```

### Background Gradients

```css
.bg-gradient-primary {
  @apply bg-gradient-to-br from-black via-gray-900 to-black;
}

.bg-gradient-yellow {
  @apply bg-gradient-to-r from-yellow-400 to-yellow-500;
}
```

### Border Accents

```css
.border-accent {
  @apply border-l-4 border-yellow-400;
}
```

## Responsive Design

### Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Responsive Utilities

```css
/* Hide on Mobile */
.hidden-mobile {
  @apply hidden md:block;
}

/* Show on Mobile */
.show-mobile {
  @apply block md:hidden;
}

/* Responsive Text */
.text-responsive {
  @apply text-lg md:text-xl lg:text-2xl;
}
```

## Accessibility

### Focus States

```css
/* Focus Ring */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-yellow-400/20;
}

/* Focus Visible */
.focus-visible {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400;
}
```

### Color Contrast

```css
/* High Contrast Text */
.text-high-contrast {
  @apply text-white;
}

/* Medium Contrast Text */
.text-medium-contrast {
  @apply text-gray-300;
}

/* Low Contrast Text */
.text-low-contrast {
  @apply text-gray-400;
}
```

## Dark Mode Support

```css
/* Dark Mode Variables */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #000000;
    --color-surface: #111827;
    --color-text: #FFFFFF;
    --color-text-secondary: #9CA3AF;
  }
}
```

## Performance

### Optimizations

```css
/* Hardware Acceleration */
.hardware-accelerated {
  @apply transform-gpu;
}

/* Will Change */
.will-change-transform {
  will-change: transform;
}

.will-change-opacity {
  will-change: opacity;
}
```

## Usage Guidelines

### Do's
- ✅ Use the yellow accent sparingly for important actions
- ✅ Maintain high contrast ratios for readability
- ✅ Use consistent spacing and typography
- ✅ Implement smooth transitions and animations
- ✅ Ensure responsive design across all devices

### Don'ts
- ❌ Don't overuse yellow - it should be an accent, not dominant
- ❌ Don't use low contrast text combinations
- ❌ Don't skip hover and focus states
- ❌ Don't ignore mobile responsiveness
- ❌ Don't use inconsistent spacing or typography

## Implementation

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        yellow: {
          400: '#FBBF24',
          500: '#EAB308',
        },
        gray: {
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  }
}
```

This design system provides a comprehensive foundation for building a professional, modern trading platform with a distinctive black and yellow aesthetic that conveys trust and sophistication.

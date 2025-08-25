# Rockefeller CSS Classes Reference

## Overview

This document provides a comprehensive reference for all CSS classes used in the Rockefeller design system. All classes are built with Tailwind CSS and follow our pure black and matte black color scheme with sophisticated red accents, enhanced gradients, shadows, hover effects, outlines, and texture patterns.

## Color Classes

### Background Colors
```css
bg-black                    /* Pure black background */
bg-black-matte             /* Matte black background */
bg-black-charcoal          /* Charcoal background */
bg-black-slate             /* Slate background */
bg-black-graphite          /* Graphite background */
bg-black-carbon            /* Carbon background */
bg-red-300                 /* Light red */
bg-red-400                 /* Red */
bg-red-500                 /* Primary red */
bg-red-600                 /* Dark red */
bg-red-700                 /* Darker red */
bg-red-800                 /* Very dark red */
bg-red-900                 /* Darkest red */
```

### Text Colors
```css
text-white                 /* Primary text */
text-white/80              /* Body text (80% opacity) */
text-white/70              /* Secondary text (70% opacity) */
text-white/60              /* Muted text (60% opacity) */
text-white/50              /* Very muted text (50% opacity) */
text-white/40              /* Disabled text (40% opacity) */
text-red-300               /* Light red text */
text-red-400               /* Red text */
text-red-500               /* Primary red text */
text-red-600               /* Dark red text */
text-red-700               /* Darker red text */
```

### Border Colors
```css
border-white/10            /* Default border (10% opacity) */
border-white/20            /* Medium border (20% opacity) */
border-white/5             /* Light border (5% opacity) */
border-red-400             /* Red border */
border-red-500             /* Primary red border */
border-red-600             /* Dark red border */
border-green-500           /* Success border */
```

## Gradient Classes

### Background Gradients
```css
bg-gradient-red            /* Primary red gradient */
bg-gradient-red-soft       /* Soft red gradient */
bg-gradient-red-dark       /* Dark red gradient */
bg-gradient-red-glow       /* Glowing red gradient */
bg-gradient-red-diagonal   /* Diagonal red gradient */
bg-gradient-red-mesh       /* Mesh red gradient */
bg-gradient-red-radial     /* Radial red gradient */
bg-gradient-black          /* Black gradient */
bg-gradient-matte          /* Matte gradient */
bg-gradient-charcoal       /* Charcoal gradient */
```

### Text Gradients
```css
bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent
```

## Texture Classes

### Texture Patterns
```css
bg-texture-noise           /* Radial gradient dots pattern for noise effect */
bg-texture-grain           /* Fine radial gradient dots for film grain */
bg-texture-mesh            /* Cross-hatched grid pattern overlay */
bg-texture-dots            /* Small radial gradient dots pattern */
bg-texture-lines           /* Diagonal repeating lines pattern */
bg-texture-hex             /* Radial gradient circles for hexagonal feel */
bg-texture-carbon          /* Grid with dots for carbon fiber effect */
bg-texture-circuit         /* Grid with centered dots for circuit board */
bg-texture-waves           /* Horizontal repeating lines for wave effect */
```

### Texture Overlays
```css
texture-overlay            /* Adds noise texture overlay */
texture-noise              /* Noise texture utility - radial gradient dots */
texture-grain              /* Grain texture utility - fine radial dots */
texture-mesh               /* Mesh texture utility - cross-hatched grid */
texture-dots               /* Dots texture utility - small radial dots */
texture-lines              /* Lines texture utility - diagonal lines */
texture-hex                /* Hex texture utility - radial circles */
texture-carbon             /* Carbon texture utility - grid with dots */
texture-circuit            /* Circuit texture utility - grid with centered dots */
texture-waves              /* Waves texture utility - horizontal lines */
```

## Typography Classes

### Font Sizes
```css
text-xs                    /* 12px */
text-sm                    /* 14px */
text-base                  /* 16px */
text-lg                    /* 18px */
text-xl                    /* 20px */
text-2xl                   /* 24px */
text-3xl                   /* 30px */
text-4xl                   /* 36px */
text-5xl                   /* 48px */
text-6xl                   /* 60px */
text-7xl                   /* 72px */
text-8xl                   /* 96px */
```

### Font Weights
```css
font-light                 /* 300 */
font-normal                /* 400 */
font-medium                /* 500 */
font-semibold              /* 600 */
font-bold                  /* 700 */
font-extrabold             /* 800 */
```

### Line Heights
```css
leading-none               /* 1 */
leading-tight              /* 1.25 */
leading-snug               /* 1.375 */
leading-normal             /* 1.5 */
leading-relaxed            /* 1.625 */
leading-loose              /* 2 */
```

## Spacing Classes

### Padding
```css
p-4                        /* 16px */
p-6                        /* 24px */
p-8                        /* 32px */
px-4                       /* Horizontal 16px */
px-6                       /* Horizontal 24px */
px-8                       /* Horizontal 32px */
py-2                       /* Vertical 8px */
py-3                       /* Vertical 12px */
py-4                       /* Vertical 16px */
py-20                      /* Vertical 80px */
```

### Margin
```css
m-2                        /* 8px */
m-4                        /* 16px */
m-6                        /* 24px */
mb-2                       /* Bottom 8px */
mb-4                       /* Bottom 16px */
mb-6                       /* Bottom 24px */
mb-8                       /* Bottom 32px */
mb-12                      /* Bottom 48px */
mb-16                      /* Bottom 64px */
mb-20                      /* Bottom 80px */
mx-auto                    /* Center horizontally */
```

### Gap
```css
gap-4                      /* 16px */
gap-6                      /* 24px */
gap-8                      /* 32px */
```

## Layout Classes

### Display
```css
block                      /* display: block */
inline-block               /* display: inline-block */
flex                       /* display: flex */
grid                       /* display: grid */
hidden                     /* display: none */
```

### Flexbox
```css
flex-col                   /* flex-direction: column */
flex-row                   /* flex-direction: row */
items-center               /* align-items: center */
items-start                /* align-items: flex-start */
items-end                  /* align-items: flex-end */
justify-center             /* justify-content: center */
justify-between            /* justify-content: space-between */
justify-start              /* justify-content: flex-start */
justify-end                /* justify-content: flex-end */
```

### Grid
```css
grid-cols-1                /* 1 column */
grid-cols-2                /* 2 columns */
grid-cols-3                /* 3 columns */
grid-cols-4                /* 4 columns */
grid-cols-6                /* 6 columns */
grid-cols-8                /* 8 columns */
md:grid-cols-2             /* 2 columns on medium screens */
md:grid-cols-3             /* 3 columns on medium screens */
lg:grid-cols-3             /* 3 columns on large screens */
lg:grid-cols-4             /* 4 columns on large screens */
```

### Position
```css
relative                   /* position: relative */
absolute                   /* position: absolute */
fixed                      /* position: fixed */
sticky                     /* position: sticky */
inset-0                    /* top: 0, right: 0, bottom: 0, left: 0 */
z-10                       /* z-index: 10 */
z-20                       /* z-index: 20 */
```

## Border Classes

### Border Width
```css
border                     /* 1px */
border-2                   /* 2px */
border-4                   /* 4px */
border-l-4                 /* Left border 4px */
border-t                   /* Top border 1px */
border-r                   /* Right border 1px */
border-b                   /* Bottom border 1px */
```

### Border Radius
```css
rounded                    /* 4px */
rounded-lg                 /* 8px */
rounded-xl                 /* 12px */
rounded-2xl                /* 16px */
rounded-full               /* 50% */
```

## Shadow Classes

### Box Shadows
```css
shadow-red-sm              /* Small red shadow */
shadow-red-md              /* Medium red shadow */
shadow-red-lg              /* Large red shadow */
shadow-red-xl              /* Extra large red shadow */
shadow-red-2xl             /* 2XL red shadow */
shadow-glow                /* Red glow shadow */
shadow-glow-lg             /* Large red glow shadow */
shadow-glow-xl             /* Extra large red glow shadow */
shadow-outline             /* Red outline shadow */
shadow-outline-lg          /* Large red outline shadow */
shadow-black-sm            /* Small black shadow */
shadow-black-md            /* Medium black shadow */
shadow-black-lg            /* Large black shadow */
shadow-black-xl            /* Extra large black shadow */
shadow-matte               /* Matte black shadow */
shadow-matte-lg            /* Large matte black shadow */
shadow-inner-red           /* Inner red shadow */
shadow-inner-red-lg        /* Large inner red shadow */
shadow-texture             /* Texture shadow */
shadow-texture-lg          /* Large texture shadow */
shadow-texture-xl          /* Extra large texture shadow */
```

## Effect Classes

### Transitions
```css
transition-all             /* All properties */
transition-colors          /* Color properties */
transition-transform       /* Transform properties */
transition-opacity         /* Opacity property */
duration-300               /* 300ms */
duration-400               /* 400ms */
duration-600               /* 600ms */
ease                       /* ease timing function */
```

### Transforms
```css
transform                  /* Enable transforms */
scale-105                  /* Scale to 105% */
hover:scale-105            /* Scale on hover */
translate-y-0              /* No vertical translation */
translate-y-20             /* 20px down */
translate-x-1              /* 4px right */
translate-x-6              /* 24px right */
translate-x-7              /* 28px right */
```

### Opacity
```css
opacity-0                  /* 0% opacity */
opacity-20                 /* 20% opacity */
opacity-50                 /* 50% opacity */
opacity-75                 /* 75% opacity */
opacity-100                /* 100% opacity */
```

## Interactive Classes

### Hover Effects
```css
hover:bg-red-500           /* Red background on hover */
hover:text-white           /* White text on hover */
hover:shadow-red-xl        /* Large red shadow on hover */
hover:shadow-glow-xl       /* Large glow on hover */
hover:scale-105            /* Scale on hover */
hover:bg-red-500/10        /* Red background 10% opacity on hover */
hover-lift                 /* Lift effect on hover */
hover-glow                 /* Glow effect on hover */
hover-scale                /* Scale effect on hover */
```

### Focus Effects
```css
focus:outline-none         /* Remove outline */
focus:border-red-500       /* Red border on focus */
focus:ring-2               /* Ring on focus */
focus:ring-red-500/20      /* Red ring on focus */
focus-ring                 /* Red focus ring */
focus-ring-lg              /* Large red focus ring */
```

## Animation Classes

### Built-in Animations
```css
animate-pulse              /* Pulse animation */
animate-bounce             /* Bounce animation */
animate-spin               /* Spin animation */
```

### Custom Animations
```css
animate-fade-in            /* Fade in animation */
animate-fade-in-up         /* Fade in from bottom */
animate-fade-in-down       /* Fade in from top */
animate-slide-up           /* Slide up animation */
animate-slide-down         /* Slide down animation */
animate-scale-in           /* Scale in animation */
animate-glow               /* Glow animation */
animate-gradient           /* Gradient animation */
animate-shimmer            /* Shimmer animation */
animate-pulse-red          /* Red pulse animation */
animate-bounce-red         /* Red bounce animation */
animate-float              /* Float animation */
animate-ripple             /* Ripple animation */
animate-texture-shift      /* Texture shift animation */
animate-noise              /* Noise animation */
animate-grain              /* Grain animation */
```

## Responsive Classes

### Breakpoints
```css
sm:                        /* 640px and up */
md:                        /* 768px and up */
lg:                        /* 1024px and up */
xl:                        /* 1280px and up */
2xl:                       /* 1536px and up */
```

### Responsive Examples
```css
text-6xl md:text-8xl       /* 60px on mobile, 96px on medium screens */
grid-cols-1 md:grid-cols-2 /* 1 column on mobile, 2 on medium */
flex-col sm:flex-row       /* Column on mobile, row on small screens */
```

## Form Element Classes

### Input Fields
```css
/* Default Input */
w-full px-4 py-3 bg-black-charcoal border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture

/* Focused Input */
w-full px-4 py-3 bg-black-charcoal border border-red-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture

/* Error Input */
w-full px-4 py-3 bg-black-charcoal border border-red-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture

/* Success Input */
w-full px-4 py-3 bg-black-charcoal border border-green-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-300 focus-ring shadow-texture

/* Disabled Input */
w-full px-4 py-3 bg-black-carbon border border-white/5 rounded-lg text-white/40 cursor-not-allowed shadow-texture

/* Textarea */
w-full px-4 py-3 bg-black-charcoal border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture resize-none
```

### Select Dropdowns
```css
/* Default Select */
w-full px-4 py-3 bg-black-charcoal border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>')] bg-no-repeat bg-right-4

/* Focused Select */
w-full px-4 py-3 bg-black-charcoal border border-red-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>')] bg-no-repeat bg-right-4
```

### Checkboxes
```css
/* Default Checkbox */
w-5 h-5 bg-black-charcoal border border-white/10 rounded text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture

/* Checked Checkbox */
w-5 h-5 bg-black-charcoal border border-red-500 rounded text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture

/* Disabled Checkbox */
w-5 h-5 bg-black-carbon border border-white/5 rounded text-white/20 cursor-not-allowed shadow-texture

/* Large Checkbox */
w-6 h-6 bg-black-charcoal border border-white/10 rounded-lg text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture
```

### Radio Buttons
```css
/* Default Radio */
w-5 h-5 bg-black-charcoal border border-white/10 text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture

/* Selected Radio */
w-5 h-5 bg-black-charcoal border border-red-500 text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture

/* Disabled Radio */
w-5 h-5 bg-black-carbon border border-white/5 text-white/20 cursor-not-allowed shadow-texture

/* Large Radio */
w-6 h-6 bg-black-charcoal border border-white/10 text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture
```

### Toggle Switches
```css
/* Default Toggle */
relative inline-flex h-6 w-11 items-center rounded-full bg-black-carbon transition-colors duration-300 shadow-texture

/* Active Toggle */
relative inline-flex h-6 w-11 items-center rounded-full bg-red-500 transition-colors duration-300 shadow-texture

/* Disabled Toggle */
relative inline-flex h-6 w-11 items-center rounded-full bg-black-carbon cursor-not-allowed transition-colors duration-300 shadow-texture

/* Large Toggle */
relative inline-flex h-8 w-14 items-center rounded-full bg-black-carbon transition-colors duration-300 shadow-texture

/* Large Active Toggle */
relative inline-flex h-8 w-14 items-center rounded-full bg-red-500 transition-colors duration-300 shadow-texture
```

### Toggle Switch Handles
```css
/* Default Handle */
inline-block h-4 w-4 transform rounded-full bg-white/60 transition-transform duration-300 translate-x-1

/* Active Handle */
inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-6

/* Disabled Handle */
inline-block h-4 w-4 transform rounded-full bg-white/20 transition-transform duration-300 translate-x-1

/* Large Handle */
inline-block h-6 w-6 transform rounded-full bg-white/60 transition-transform duration-300 translate-x-1

/* Large Active Handle */
inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 translate-x-7
```

## Component-Specific Classes

### Button Classes
```css
/* Primary Button */
px-8 py-4 bg-gradient-red text-white font-bold rounded-lg shadow-red-lg hover:shadow-red-xl transition-all duration-300 transform hover:scale-105 hover-lift ripple-effect

/* Secondary Button */
px-8 py-4 border-2 border-red-500 text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover-glow shadow-outline

/* Ghost Button */
px-8 py-4 text-red-400 font-bold rounded-lg hover:bg-red-500/10 transition-all duration-300 hover-scale

/* Disabled Button */
px-8 py-4 bg-black-carbon text-white/40 font-bold rounded-lg cursor-not-allowed shadow-texture

/* Small Button */
px-4 py-2 bg-gradient-red text-white font-bold rounded-lg shadow-red-md hover:shadow-red-lg transition-all duration-300 transform hover:scale-105 hover-lift ripple-effect text-sm

/* Large Button */
px-8 py-4 bg-gradient-red text-white font-bold rounded-lg shadow-red-xl hover:shadow-red-2xl transition-all duration-300 transform hover:scale-105 hover-lift ripple-effect text-lg

/* Icon Button */
px-6 py-3 bg-black-charcoal border border-white/10 text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover-glow shadow-texture

/* Loading Button */
px-6 py-3 bg-gradient-red text-white font-bold rounded-lg shadow-red-lg transition-all duration-300 cursor-not-allowed opacity-75
```

### Card Classes
```css
/* Basic Card */
bg-black-charcoal rounded-lg p-6 border border-white/10 shadow-black-md hover:shadow-black-lg transition-all duration-300 hover-lift

/* Gradient Card */
bg-gradient-to-br from-black-charcoal to-black-slate rounded-lg p-6 border border-white/10 shadow-black-lg hover:shadow-black-xl transition-all duration-300 hover-lift

/* Accent Card */
bg-black-charcoal rounded-lg p-6 border-l-4 border-red-500 shadow-red-md hover:shadow-red-lg transition-all duration-300 hover-lift

/* Glow Card */
bg-black-charcoal rounded-lg p-6 border border-white/10 shadow-glow hover:shadow-glow-lg transition-all duration-300

/* Hover Card */
bg-black-charcoal rounded-lg p-6 border border-white/10 hover:shadow-glow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer hover-lift

/* Outline Card */
bg-black-charcoal rounded-lg p-6 border border-white/10 shadow-outline hover:shadow-outline-lg transition-all duration-300

/* Texture Card */
bg-black-charcoal rounded-lg p-6 border border-white/10 shadow-texture hover:shadow-texture-lg transition-all duration-300 hover-lift bg-texture-noise

/* Form Group Card */
bg-black-charcoal rounded-lg p-6 border border-white/10 shadow-texture
```

### Form Group Classes
```css
/* Form Container */
bg-black-charcoal rounded-lg p-6 border border-white/10 shadow-texture

/* Form Field */
space-y-4

/* Form Label */
block text-sm font-medium text-white/80 mb-2

/* Form Input Group */
space-y-3

/* Form Button Group */
space-y-4
```

### Navigation Classes
```css
/* Nav Container */
bg-black-charcoal rounded-lg p-4 border border-white/10 shadow-black-md

/* Nav Link */
text-white/70 hover:text-red-400 transition-colors duration-300 hover-scale

/* Nav Brand */
text-red-400 font-bold text-xl animate-pulse-red
```

## Utility Classes

### Sizing
```css
w-full                     /* width: 100% */
w-5                        /* width: 1.25rem */
w-6                        /* width: 1.5rem */
w-11                       /* width: 2.75rem */
w-14                       /* width: 3.5rem */
w-20                       /* width: 5rem */
h-4                        /* height: 1rem */
h-5                        /* height: 1.25rem */
h-6                        /* height: 1.5rem */
h-8                        /* height: 2rem */
h-32                       /* height: 8rem */
min-h-screen               /* min-height: 100vh */
```

### Overflow
```css
overflow-hidden            /* overflow: hidden */
overflow-auto              /* overflow: auto */
```

### Cursor
```css
cursor-pointer             /* cursor: pointer */
cursor-not-allowed         /* cursor: not-allowed */
```

### Container
```css
container                  /* Max-width container */
mx-auto                    /* Center container */
px-4                       /* Container padding */
```

### Special Effects
```css
hardware-accelerated       /* Hardware acceleration */
ripple-effect              /* Ripple effect on click */
texture-overlay            /* Texture overlay utility */
appearance-none            /* Remove default appearance */
bg-no-repeat              /* No background repeat */
bg-right-4                /* Background position right 16px */
resize-none               /* Disable textarea resize */
```

## Usage Examples

### Hero Section with Texture
```html
<section class="relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5"></div>
  <div class="absolute inset-0 bg-gradient-red-radial"></div>
  <div class="absolute inset-0 bg-texture-noise animate-noise"></div>
  <div class="relative z-10 container mx-auto px-4 py-20">
    <h1 class="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
      <span class="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-gradient">
        Rockefeller
      </span>
    </h1>
  </div>
</section>
```

### Enhanced Input Field
```html
<div>
  <label class="block text-sm font-medium text-white/80 mb-2">Email Address</label>
  <input 
    type="email" 
    placeholder="Enter your email"
    class="w-full px-4 py-3 bg-black-charcoal border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture"
  />
</div>
```

### Enhanced Select Dropdown
```html
<div>
  <label class="block text-sm font-medium text-white/80 mb-2">Select Option</label>
  <select class="w-full px-4 py-3 bg-black-charcoal border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>')] bg-no-repeat bg-right-4">
    <option class="bg-black-charcoal text-white">Select an option</option>
    <option class="bg-black-charcoal text-white">Option 1</option>
    <option class="bg-black-charcoal text-white">Option 2</option>
  </select>
</div>
```

### Enhanced Checkbox
```html
<div class="flex items-center">
  <input 
    type="checkbox" 
    id="checkbox1"
    class="w-5 h-5 bg-black-charcoal border border-white/10 rounded text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture"
  />
  <label for="checkbox1" class="ml-3 text-white/80">Checkbox label</label>
</div>
```

### Enhanced Radio Button
```html
<div class="flex items-center">
  <input 
    type="radio" 
    id="radio1"
    name="radio-group"
    class="w-5 h-5 bg-black-charcoal border border-white/10 text-red-500 focus:ring-red-500/20 focus:ring-2 focus:ring-offset-0 transition-all duration-300 shadow-texture"
  />
  <label for="radio1" class="ml-3 text-white/80">Radio label</label>
</div>
```

### Toggle Switch
```html
<div class="flex items-center">
  <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-black-carbon transition-colors duration-300 shadow-texture">
    <span class="inline-block h-4 w-4 transform rounded-full bg-white/60 transition-transform duration-300 translate-x-1"></span>
  </button>
  <label class="ml-3 text-white/80">Toggle label</label>
</div>
```

### Form Group
```html
<div class="bg-black-charcoal rounded-lg p-6 border border-white/10 shadow-texture">
  <h5 class="text-lg font-bold text-white mb-4">Form Title</h5>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-white/80 mb-2">Field Label</label>
      <input 
        type="text" 
        placeholder="Enter text"
        class="w-full px-4 py-3 bg-black-slate border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 focus-ring shadow-texture"
      />
    </div>
    <button class="w-full px-6 py-3 bg-gradient-red text-white font-bold rounded-lg shadow-red-lg hover:shadow-red-xl transition-all duration-300 transform hover:scale-105 hover-lift ripple-effect">
      Submit
    </button>
  </div>
</div>
```

### Enhanced Button with Loading State
```html
<button class="w-full px-6 py-3 bg-gradient-red text-white font-bold rounded-lg shadow-red-lg transition-all duration-300 cursor-not-allowed opacity-75">
  <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
  Loading...
</button>
```

This reference provides all the CSS classes needed to build the Rockefeller trading platform using our sophisticated black and red design system with texture patterns and enhanced form elements. All classes are optimized for the professional black theme with dynamic red accents, enhanced gradients, shadows, hover effects, outlines, texture overlays, and comprehensive form styling.

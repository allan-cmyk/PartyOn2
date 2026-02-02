/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      colors: {
        // Add default Tailwind colors we need
        amber: colors.amber,
        pink: colors.pink,
        teal: colors.teal,
        cyan: colors.cyan,
        purple: colors.purple,
        indigo: colors.indigo,
        // PartyOn Premium B2B Color System
        royal: {
          50: '#E8EEF5',
          100: '#D1DDEB',
          200: '#A3BBD7',
          300: '#7599C3',
          400: '#4777AF',
          500: '#1A3E5C', // Royal Blue - Main
          600: '#153249',
          700: '#102536',
          800: '#0B1924',
          900: '#060C12',
        },
        gold: {
          50: '#FBF9F2',
          100: '#F7F3E5',
          200: '#EFE7CB',
          300: '#E7DBB1',
          400: '#DECF97',
          500: '#D4AF37', // Luxury Gold
          600: '#B8962F',
          700: '#9C7D27',
          800: '#80641F',
          900: '#644B17',
        },
        ivory: {
          50: '#FEFEFE',
          100: '#FCFBF9',
          200: '#FAF8F3',
          300: '#F7F3E9', // Main Ivory
          400: '#F4EFDF',
          500: '#F1EBD5',
          600: '#E6DFC4',
          700: '#DBD3B3',
          800: '#D0C7A2',
          900: '#C5BB91',
        },
        emerald: {
          50: '#E6F5F1',
          100: '#CCEBE3',
          200: '#99D7C7',
          300: '#66C3AB',
          400: '#33AF8F',
          500: '#2B8E76', // Emerald Green
          600: '#237660',
          700: '#1B5E4A',
          800: '#134634',
          900: '#0B2E1E',
        },
        slate: {
          50: '#F5F6F7',
          100: '#EBEDEE',
          200: '#D7DBDD',
          300: '#C3C9CC',
          400: '#AFB7BB',
          500: '#9BA5AA',
          600: '#7D8A91',
          700: '#5F6F78',
          800: '#3E4E5E', // Slate Grey
          900: '#1E2F3F',
        },
        // Premium Party Color System (legacy)
        primary: {
          50: '#FFF1ED',
          100: '#FFE3DB',
          200: '#FFC7B7',
          300: '#FFAB93',
          400: '#FF8B5C',
          500: '#FF6B35', // Sunset Orange - Main brand
          600: '#E74C3C',
          700: '#C13E32',
          800: '#9A3228',
          900: '#7A281F',
        },
        secondary: {
          50: '#E8FAF9',
          100: '#D1F5F3',
          200: '#A3EBE7',
          300: '#75E1DB',
          400: '#6DD9D1',
          500: '#4ECDC4', // Fresh Teal
          600: '#3DB5AC',
          700: '#329590',
          800: '#267574',
          900: '#1B5558',
        },
        accent: {
          50: '#FFFDF5',
          100: '#FFFBEB',
          200: '#FFF7D6',
          300: '#FFF3A3',
          400: '#FFEF85',
          500: '#FFE66D', // Champagne Yellow
          600: '#F5D640',
          700: '#E0C030',
          800: '#B89D26',
          900: '#8F7A1D',
        },
        dark: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#2D3436', // Soft Charcoal
          800: '#212529',
          900: '#191C1F',
        },
        // Group V2 Design System
        brand: {
          blue: '#0B74B8',
          yellow: '#F2D34F',
        },
        v2: {
          bg: '#FFFFFF',
          bgSoft: '#F6F8FB',
          card: '#FFFFFF',
          border: '#E6EAF0',
          text: '#0F172A',
          muted: '#64748B',
          blueTint: '#F1F8FF',
          yellowTint: '#FFF9E6',
          success: '#16A34A',
          danger: '#EF4444',
        },
        // Legacy colors for backward compatibility
        gold: {
          50: '#FFFDF5',
          100: '#FFFBEB',
          200: '#FFF7D6',
          300: '#FFF3A3',
          400: '#FFEF85',
          500: '#FFE66D',
          600: '#F5D640',
          700: '#E0C030',
          800: '#B89D26',
          900: '#8F7A1D',
        },
        navy: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#2D3436',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#191C1F',
        },
        austin: {
          sunset: '#FF6B35',
          lake: '#4ECDC4',
          hills: '#4A7C59',
          live: '#E74C3C',
        },
        // Neutral palette
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant-garamond)', 'Georgia', 'serif'],
        display: ['var(--font-playfair-display)', 'Georgia', 'serif'],
        abril: ['var(--font-abril-fatface)', 'Georgia', 'serif'],
        caveat: ['var(--font-caveat)', 'cursive'],
        playfair: ['var(--font-playfair-display)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'party': 'party 1s ease-in-out',
        'scroll-left': 'scrollLeft 40s linear infinite',
        'bounce-horizontal': 'bounceHorizontal 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        party: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(5deg)' },
          '50%': { transform: 'scale(1) rotate(-5deg)' },
          '75%': { transform: 'scale(1.1) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        bounceHorizontal: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(8px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #FF6B35 0%, #E74C3C 100%)',
        'gradient-fun': 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 50%, #FFE66D 100%)',
        'gradient-party': 'linear-gradient(45deg, #FF6B35, #FFE66D, #4ECDC4, #FF6B35)',
        'gradient-v2-hero': 'linear-gradient(135deg, #F1F8FF 0%, #FFFFFF 55%, #FFF9E6 100%)',
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'premium-hover': '0 8px 30px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
        'party': '0 0 30px rgba(255, 107, 53, 0.4), 0 0 60px rgba(78, 205, 196, 0.2)',
      },
    },
  },
  plugins: [],
  safelist: [
    // Safelist color classes for dynamic category colors
    'bg-amber-50', 'bg-amber-100', 'bg-amber-600',
    'text-amber-700', 'text-white',
    'border-amber-300', 'border-amber-400', 'border-amber-600',
    'hover:bg-amber-100', 'hover:border-amber-400', 'hover:border-amber-500',
    
    'bg-pink-50', 'bg-pink-100', 'bg-pink-600',
    'text-pink-700', 'text-white',
    'border-pink-300', 'border-pink-400', 'border-pink-600',
    'hover:bg-pink-100', 'hover:border-pink-400', 'hover:border-pink-500',
    
    'bg-teal-50', 'bg-teal-100', 'bg-teal-600',
    'text-teal-700', 'text-white',
    'border-teal-300', 'border-teal-400', 'border-teal-600',
    'hover:bg-teal-100', 'hover:border-teal-400', 'hover:border-teal-500',
    
    'bg-slate-50', 'bg-slate-100', 'bg-slate-700',
    'text-slate-700', 'text-white',
    'border-slate-300', 'border-slate-400', 'border-slate-700',
    'hover:bg-slate-100', 'hover:border-slate-400', 'hover:border-slate-500',
    
    'bg-cyan-50', 'bg-cyan-100', 'bg-cyan-600',
    'text-cyan-700', 'text-white',
    'border-cyan-300', 'border-cyan-400', 'border-cyan-600',
    'hover:bg-cyan-100', 'hover:border-cyan-400',
    
    'bg-purple-50', 'bg-purple-100', 'bg-purple-600',
    'text-purple-700', 'text-white',
    'border-purple-300', 'border-purple-400', 'border-purple-600',
    'hover:bg-purple-100', 'hover:border-purple-400', 'hover:border-purple-500',
    
    'bg-indigo-50', 'bg-indigo-100', 'bg-indigo-600',
    'text-indigo-700', 'text-white',
    'border-indigo-300', 'border-indigo-400', 'border-indigo-600',
    'hover:bg-indigo-100', 'hover:border-indigo-400', 'hover:border-indigo-500',
    
    'bg-gray-50', 'bg-gray-100', 'bg-gold-600',
    'text-gray-700', 'text-white',
    'border-gray-300', 'border-gold-600',
    'hover:bg-gray-100', 'hover:border-gold-400',
  ],
}
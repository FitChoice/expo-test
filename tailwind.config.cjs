/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '375px',
        'md': '414px',
        'lg': '768px',
        'xl': '1024px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontFamily: {
        'rimma': ['Rimma_sans', 'Roboto', 'system-ui', 'sans-serif'],
        'rimma-bold': ['Rimma_sans-Bold', 'Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // t1 - Headlines, titles, large text
        't1': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        't1.1': ['20px', { lineHeight: '1.3', fontWeight: '500' }],
        
        // t2 - Titles, medium text, buttons, links, menu
        't2': ['16px', { lineHeight: '1.2', fontWeight: '400' }],
        't2-bold': ['16px', { lineHeight: '1.2', fontWeight: '600' }],
        
        // t3 - Regular text
        't3': ['14px', { lineHeight: '1.2', fontWeight: '500' }],
        't3-regular': ['14px', { lineHeight: '1.2', fontWeight: '400' }],
        
        // t4 - Caption
        't4': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        't4-medium': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
        
        // Headers - Extra Large headlines and titles
        'h1': ['48px', { lineHeight: '1.1', fontWeight: '500' }],
        
        // Headers - Large headlines and titles
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'h2-lines': ['24px', { lineHeight: '1', fontWeight: '500' }],
      },
      colors: {
        // Brand colors
        'brand-green': {
          500: '#8BC34A',
          900: '#689F38',
        },
        'brand-purple': {
          300: '#D1C4E9',
          500: '#BA9BF7',
          900: '#BBA2FE',
        },
        // Fill colors (backgrounds, borders)
        'fill': {
          100: '#F5F5F5',
          150: '#E8E8E8',
          200: '#F4F4F4',
          300: '#E9E9E9',
          400: '#D5D5D6',
          500: '#C0C0C1',
          700: '#3F3F3F',
          800: '#2B2B2B',
          900: '#0A0A0A',
        },
        // Light text colors
        'light-text': {
          100: '#FFFFFF',
          200: '#BEBEC0',
          500: '#8F8F92',
          900: '#0B0911',
        },
        // Feedback colors
        'feedback-negative': {
          900: '#FF514F',
        },
        'feedback-positive': {
          900: '#00CF1B',
        },
        'feedback-info': {
          900: '#386AFF',
        },
        // BG colors
        'bg': {
          'dark-500': '#1E1E1E',
          'light': '#FFFFFF',
        },
        // Pure colors
        'color': {
          'pure-white': '#FFFFFF',
          'pure-black': '#000000',
        },
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};

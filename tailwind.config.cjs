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
        // Figma typography uses: Rimma Sans (special headers), Inter, Work Sans, Onest
        // Note: only Rimma Sans fonts are currently bundled/loaded in the app (see `src/shared/ui/FontLoader/FontLoader.tsx`)
        rimma: ['Rimma_sans', 'Rimma_sans_android', 'Roboto', 'system-ui', 'sans-serif'],
        // We don't currently ship a separate bold file; keep alias for compatibility.
        'rimma-bold': ['Rimma_sans', 'Rimma_sans_android', 'Roboto', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        'work-sans': ['Work Sans', 'system-ui', 'sans-serif'],
        onest: ['Onest', 'system-ui', 'sans-serif'],
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
          // From Figma: Brand/Green 300/500/900
          300: '#E2FBBF',
          500: '#C5F680',
          900: '#AAEC4D',
        },
        'brand-purple': {
          300: '#DDCDFB',
          500: '#BA9BF7',
          900: '#A172FF',
        },
        // Fill colors (backgrounds, borders)
        'fill': {
          // From Figma: Fill/100..900 (+ Fill/650)
          100: '#FBFBFB',
          // Kept for backward-compat (not present in current Figma palette)
          150: '#F5F5F5',
          200: '#F4F4F4',
          300: '#EAEAEA',
          400: '#D6D6D6',
          500: '#C3C3C3',
          600: '#989898',
          650: '#6E6E6E',
          700: '#3F3F3F',
          800: '#2B2B2B',
          900: '#161616',
        },
        // Light text colors
        'light-text': {
          100: '#FFFFFF',
          200: '#C1C1C1',
          500: '#949494',
          900: '#161616',
        },
        // Dark text colors (for dark version of UI)
        'dark-text': {
          100: '#F5F5F5',
          500: '#E6E6E7',
          900: '#ABAAAD',
        },
        // Feedback colors
        'feedback-negative': {
          100: '#FFA9BB',
          900: '#FF2854',
        },
        'feedback-positive': {
          100: '#ADE9BD',
          900: '#31C859',
        },
        'feedback-attention': {
          100: '#FFF1CC',
          900: '#FFBA00',
        },
        'feedback-info': {
          100: '#D7E1FF',
          900: '#386AFF',
        },
        // BG colors
        'bg': {
          'dark-200': '#949494',
          'dark-400': '#2E322D',
          'dark-500': '#1E1E1E',
          'dark-900': '#151515',

          'light': '#FFFFFF',
        },
        // Extra named palettes from Figma ("Additional")
        additional: {
          tomato: { 100: '#EA9280', 500: '#E54D2E', 900: '#CA3114' },
          crimson: { 100: '#E58FB1', 500: '#E93D82', 900: '#C61A5F' },
          plum: { 100: '#CF91D8', 500: '#AB4ABA', 900: '#801F90' },
          violet: { 100: '#AA99EC', 500: '#6E56CF', 900: '#3D249E' },
          indigo: { 100: '#8DA4EF', 500: '#3E63DD', 900: '#1A3FBA' },
          cyan: { 100: '#58D7ED', 500: '#05A2C2', 900: '#02A0BF' },
          teal: { 100: '#53B9AB', 500: '#12A594', 900: '#089B8A' },
          green: { 100: '#5BB98C', 500: '#30A46C', 900: '#148851' },
          lime: { 100: '#99D52A', 500: '#94BA2C', 900: '#81BD12' },
          yellow: { 100: '#F5D90A', 500: '#EFD404', 900: '#C6A211' },
          orange: { 100: '#FA934E', 500: '#F76808', 900: '#F26303' },
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

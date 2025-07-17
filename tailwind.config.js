/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['bg-white', 'text-foreground', 'bg-background'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
        heading: ['var(--font-merriweather-sans)', 'sans-serif'],
        fivo: ['"Fivo Sans"', 'sans-serif'],
        baloo: ['"Baloo 2"', 'cursive'],
      },
      colors: {
        primary: '#0077B6',
        secondary: '#FBE9D4',
        accent: '#FF715B',
        dark: '#023E8A',
        background: '#FFFFFF',
        muted: '#F1F5F9',
        border: '#E5E7EB',
        ring: '#CBD5E0',
        muted: '#F5F7FA',
      },
      borderColor: {
        border: '#E5E7EB',
      },
      ringColor: {
        ring: '#CBD5E0',
      },
    },
  },
  plugins: [],
}

// tailwind.config.js
// Agrega estas configuraciones a tu archivo existente

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Animaciones personalizadas para el chat
      animation: {
        'message-in': 'message-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce': 'bounce 1s infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      // Keyframes para las animaciones
      keyframes: {
        'message-in': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(10px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'slide-up': {
          'from': { 
            transform: 'translateY(100%)' 
          },
          'to': { 
            transform: 'translateY(0)' 
          },
        },
        'slide-down': {
          'from': { 
            transform: 'translateY(0)' 
          },
          'to': { 
            transform: 'translateY(100%)' 
          },
        },
        'fade-in': {
          'from': { 
            opacity: '0' 
          },
          'to': { 
            opacity: '1' 
          },
        },
        'bounce': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
        'shake': {
          '0%, 100%': { 
            transform: 'translateX(0)' 
          },
          '25%': { 
            transform: 'translateX(-5px)' 
          },
          '75%': { 
            transform: 'translateX(5px)' 
          },
        },
      },
      // Colores personalizados
      colors: {
        'gov-red': '#E40E20',
        'gov-red-dark': '#d40d1d',
        'gov-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      // Espaciado seguro para dispositivos con notch
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Altura dinámica del viewport
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
        'screen-dynamic': 'calc(var(--vh, 1vh) * 100)',
      },
      // Z-index para las capas del chat
      zIndex: {
        'chat-overlay': '50',
        'chat-container': '60',
        'chat-header': '61',
        'chat-input': '62',
      },
    },
  },
  plugins: [],
}
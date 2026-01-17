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
      borderColor: {
        border: '#E5E7EB',
      },
      ringColor: {
        ring: '#CBD5E0',
      },
      // Premium easing curves
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snap': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
      // Premium shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 8px 24px 0 rgba(0, 0, 0, 0.10)',
        'lg': '0 12px 32px 0 rgba(0, 0, 0, 0.12)',
        'xl': '0 20px 48px 0 rgba(0, 0, 0, 0.14)',
        '2xl': '0 24px 64px 0 rgba(0, 0, 0, 0.16)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'premium': '0 20px 40px -12px rgba(0, 123, 182, 0.25)',
        'premium-lg': '0 24px 48px -12px rgba(0, 123, 182, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
      },
      // Animaciones personalizadas
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'message-in': 'message-in 0.3s ease-out',
        'bounce': 'bounce 1s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      // Keyframes
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
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
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
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
      // Z-index para las capas
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

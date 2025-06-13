#!/bin/bash

echo "🔧 Arreglando error de Tailwind CSS..."

# 1. Actualizar globals.css
echo "📝 Actualizando globals.css..."
cat > src/app/globals.css << 'EOF'
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --foreground: #000000;
    --background: #ffffff;
  }
  
  body {
    @apply text-gray-900 bg-white;
  }
}

/* Definir clases custom que se usan en el proyecto */
@layer utilities {
  .text-foreground {
    color: var(--foreground);
  }
  
  .bg-background {
    background-color: var(--background);
  }
}
EOF

# 2. Actualizar tailwind.config.js
echo "📝 Actualizando tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
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
EOF

# 3. Remover dependencia line-clamp ya que está incluida en Tailwind 3.3+
echo "📦 Removiendo @tailwindcss/line-clamp..."
pnpm remove @tailwindcss/line-clamp

# 4. Limpiar cache
echo "🧹 Limpiando cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "✅ Error de Tailwind arreglado!"
echo ""
echo "Ahora ejecuta:"
echo "git add ."
echo "git commit -m \"fix: resolver error text-foreground y remover line-clamp plugin\""
echo "git push"
#!/bin/bash

echo "🔍 Verificando fuentes en el proyecto..."
echo ""

# Verificar si existen las carpetas de fuentes
echo "📁 Buscando carpetas de fuentes:"
for dir in "public/fonts" "src/fonts" "assets/fonts"; do
  if [ -d "$dir" ]; then
    echo "✅ Encontrado: $dir"
    echo "   Contenido:"
    ls -la "$dir" 2>/dev/null | grep -E "\.(woff2?|ttf|otf)" | awk '{print "   - " $9}'
  else
    echo "❌ No existe: $dir"
  fi
done

echo ""
echo "📄 Buscando archivos de fuentes en todo el proyecto:"
find . -name "*.woff2" -o -name "*.woff" -o -name "*.ttf" 2>/dev/null | grep -v node_modules | grep -v .next

echo ""
echo "💡 Si no encuentras las fuentes locales, tienes dos opciones:"
echo ""
echo "Opción 1: Usar solo Google Fonts (más simple)"
echo "- Elimina los @font-face del CSS"
echo "- Agrega Baloo 2 a la importación de Google Fonts"
echo ""
echo "Opción 2: Descargar las fuentes"
echo "- Fivo Sans: Busca en fonts.adobe.com o usa una alternativa"
echo "- Baloo 2: https://fonts.google.com/specimen/Baloo+2 (Download family)"
echo "- Colócalas en public/fonts/"
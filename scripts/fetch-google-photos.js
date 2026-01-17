// scripts/fetch-google-photos.js
// Ejecutar: node scripts/fetch-google-photos.js
// Requiere: NEXT_PUBLIC_GOOGLE_PLACES_API_KEY en .env.local

const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.error('❌ Falta NEXT_PUBLIC_GOOGLE_PLACES_API_KEY en .env.local');
  process.exit(1);
}

// Lugares del Atlántico para buscar
const PLACES = [
  { id: "museo-del-caribe", query: "Museo del Caribe Barranquilla Colombia" },
  { id: "gran-malecon", query: "Gran Malecón del Río Barranquilla" },
  { id: "puerta-de-oro", query: "Puerta de Oro Barranquilla" },
  { id: "casa-del-carnaval", query: "Casa del Carnaval Barranquilla" },
  { id: "plaza-san-nicolas", query: "Iglesia San Nicolás Barranquilla" },
  { id: "centro-historico-baq", query: "Centro Histórico Barranquilla Paseo Bolívar" },
  { id: "zoologico-barranquilla", query: "Zoológico de Barranquilla" },
  { id: "estadio-metropolitano", query: "Estadio Metropolitano Roberto Meléndez" },
  { id: "la-cueva", query: "La Cueva restaurante Barranquilla" },
  { id: "narcobollo", query: "NarcoBollo Barranquilla" },
  { id: "caiman-del-rio", query: "Caimán del Río restaurante Barranquilla" },
  { id: "la-troja", query: "La Troja Barranquilla salsa" },
  { id: "frogg-bar", query: "Frogg Leap Bar Barranquilla" },
  { id: "playa-pradomar", query: "Playa Pradomar Puerto Colombia" },
  { id: "playa-salgar", query: "Playa Salgar Atlántico" },
  { id: "muelle-puerto-colombia", query: "Muelle de Puerto Colombia" },
  { id: "castillo-salgar", query: "Castillo de Salgar Puerto Colombia" },
  { id: "cienaga-mallorquin", query: "Ciénaga de Mallorquín Barranquilla" },
  { id: "bocas-de-ceniza", query: "Bocas de Ceniza Barranquilla" },
  { id: "artesanias-galapa", query: "Galapa máscaras carnaval Atlántico" },
  { id: "usiacuri-artesanias", query: "Usiacurí artesanías iraca Atlántico" },
  { id: "casa-julio-florez", query: "Casa Museo Julio Flórez Usiacurí" },
];

async function searchPlace(query) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

function getPhotoUrl(photoReference, maxWidth = 800) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}

async function main() {
  console.log('🔍 Buscando fotos en Google Places...\n');
  
  const results = {};
  
  for (const place of PLACES) {
    process.stdout.write(`${place.id}... `);
    
    try {
      const data = await searchPlace(place.query);
      
      if (data.results?.[0]?.photos?.length > 0) {
        const photos = data.results[0].photos.slice(0, 4);
        results[place.id] = {
          primary: getPhotoUrl(photos[0].photo_reference, 1200),
          gallery: photos.map(p => getPhotoUrl(p.photo_reference, 800)),
          place_id: data.results[0].place_id,
          name: data.results[0].name,
        };
        console.log(`✅ ${photos.length} fotos`);
      } else {
        console.log(`⚠️ Sin fotos`);
        results[place.id] = null;
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      results[place.id] = null;
    }
    
    // Pausa para no exceder rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Generar archivo TypeScript
  const tsContent = `// src/data/place-images.ts
// Generado automáticamente con fotos de Google Places
// Fecha: ${new Date().toISOString()}

export const PLACE_IMAGES: Record<string, {
  primary: string;
  gallery: string[];
  place_id?: string;
  name?: string;
}> = ${JSON.stringify(results, null, 2)};

// Función helper para obtener imagen de un lugar
export function getPlaceImage(placeId: string): { primary: string; gallery: string[] } {
  const images = PLACE_IMAGES[placeId];
  if (images) {
    return { primary: images.primary, gallery: images.gallery };
  }
  // Fallback
  return {
    primary: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"]
  };
}

// Imágenes por categoría para fallback
export const CATEGORY_IMAGES: Record<string, string[]> = {
  playa: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  ],
  museo: [
    "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80",
  ],
  restaurante: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  ],
  bar: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
  ],
  naturaleza: [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  ],
  cultura: [
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
  ],
};

export function getCategoryImage(category: string, index: number = 0): string {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;
  return images[index % images.length];
}
`;

  fs.writeFileSync('src/data/place-images.ts', tsContent);
  console.log('\n✅ Archivo generado: src/data/place-images.ts');
  
  // Resumen
  const found = Object.values(results).filter(Boolean).length;
  console.log(`\n📊 Resumen: ${found}/${PLACES.length} lugares con fotos`);
}

main().catch(console.error);
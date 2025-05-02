// scripts/geocodeDestinations.js
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Reconstruye __dirname en contexto de ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Ruta al archivo de credenciales dentro de la carpeta scripts
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ No se encontró el archivo de credenciales en ${serviceAccountPath}`);
  process.exit(1);
}

// Carga y parsea el JSON de credenciales
const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf8')
);

// Inicializa Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Token de geocoding de Mapbox desde .env.local
const MAPBOX_TOKEN = process.env.MAPBOX_GEOCODING_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('❌ Falta MAPBOX_GEOCODING_TOKEN en .env.local');
  process.exit(1);
}

// Función para obtener coordenadas de una dirección
async function geocode(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`❌ Error en geocoding (${res.status}): ${res.statusText}`);
    return null;
  }
  const { features } = await res.json();
  if (features?.length) {
    const [lng, lat] = features[0].center;
    return { lat, lng };
  }
  return null;
}

// Script principal
async function main() {
  try {
    const snapshots = await db.collection('destinations').get();
    for (const doc of snapshots.docs) {
      const data = doc.data();
      // Solo geocodificar si no existen coords y sí hay address
      if (!data.coordinates && data.address) {
        console.log(`🔍 Geocoding ${doc.id}: ${data.address}`);
        const coords = await geocode(data.address);
        if (coords) {
          await doc.ref.update({ coordinates: coords });
          console.log(`✅ ${doc.id} →`, coords);
        } else {
          console.warn(`⚠️ No encontró coords para ${doc.id}`);
        }
      }
    }
    console.log('🎉 ¡Geocoding completado!');
  } catch (err) {
    console.error('❌ Error en el script de geocoding:', err);
    process.exit(1);
  }
  process.exit(0);
}

main();

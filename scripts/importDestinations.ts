// scripts/importDestinations.ts
import admin from "firebase-admin";
import csv from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface DestinationCSV {
  "Document ID"?: string;
  name: string;
  description: string;
  address: string;
  categories: string;
  coordinates?: string;
  email?: string;
  phone: string;
  tagline: string;
  website: string;
  image?: string;
  "opening-time"?: string;
  openingTime?: string;
}

interface DestinationFirestore {
  name: string;
  description: string;
  address: string;
  categories: string[];
  email: string | null;
  openingTime: string | null;
  phone: string;
  tagline: string;
  website: string;
  imagePath?: string;
  imagePaths?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Definir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Firebase
const keyFile = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyFile, "utf8")) as admin.ServiceAccount;

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Función para parsear coordenadas
function parseCoordinates(coordinatesStr?: string): { lat: number; lng: number } | undefined {
  if (!coordinatesStr || coordinatesStr.trim() === '') {
    console.log("⚠️ Coordenadas vacías");
    return undefined;
  }
  
  console.log("📍 Parseando coordenadas:", coordinatesStr);
  
  // Método 1: Usar regex para extraer lat y lng directamente
  // Este método funciona con formatos como {lng: -74.9547, lat: 10.9876}
  const regex = /lat:\s*([-\d.]+).*lng:\s*([-\d.]+)|lng:\s*([-\d.]+).*lat:\s*([-\d.]+)/;
  const match = coordinatesStr.match(regex);
  
  if (match) {
    const lat = parseFloat(match[1] || match[4]);
    const lng = parseFloat(match[2] || match[3]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log("✅ Coordenadas válidas (regex):", { lat, lng });
      return { lat, lng };
    }
  }
  
  // Método 2: Intentar parsear como objeto JSON
  if (coordinatesStr.includes('{') && coordinatesStr.includes('}')) {
    try {
      // Limpiar el string para que sea JSON válido
      const jsonStr = coordinatesStr
        .replace(/(\w+):/g, '"$1":') // Agregar comillas a las keys
        .replace(/'/g, '"'); // Reemplazar comillas simples por dobles
      
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.lat && parsed.lng) {
        const lat = parseFloat(parsed.lat);
        const lng = parseFloat(parsed.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log("✅ Coordenadas válidas (JSON):", { lat, lng });
          return { lat, lng };
        }
      }
    } catch (e) {
      console.log("No se pudo parsear como JSON, intentando otros formatos...");
    }
  }
  
  // Método 3: Si no es JSON, intentar otros formatos
  const cleaned = coordinatesStr
    .trim()
    .replace(/[()'"]/g, '')
    .replace(/\s+/g, ' ');
  
  // Intentar diferentes formatos: "lat,lng" o "lat, lng" o "lat lng"
  const separators = [',', ' ', ';', '|'];
  let parts: string[] = [];
  
  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      parts = cleaned.split(sep).map(p => p.trim()).filter(p => p);
      if (parts.length === 2) break;
    }
  }
  
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log("✅ Coordenadas válidas (separador):", { lat, lng });
      return { lat, lng };
    }
  }
  
  console.log("❌ No se pudieron parsear las coordenadas:", coordinatesStr);
  return undefined;
}

async function runImport(): Promise<void> {
  // IMPORTANTE: Cambia el nombre del archivo si es necesario
  const csvFile = path.join(__dirname, "DestinationsCSV.csv");
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ No se encontró el archivo: ${csvFile}`);
    console.log("Asegúrate de que el archivo CSV esté en la carpeta scripts/");
    process.exit(1);
  }
  
  const rows: DestinationCSV[] = await csv().fromFile(csvFile);
  console.log(`📊 Total de destinos a importar: ${rows.length}`);

  // Verificar primeras filas para debug
  console.log("\n🔍 Verificando primeras 3 filas:");
  rows.slice(0, 3).forEach((row, i) => {
    console.log(`\nFila ${i + 1}:`);
    console.log("- Nombre:", row.name);
    console.log("- Coordenadas (raw):", row.coordinates);
    console.log("- Document ID:", row["Document ID"]);
  });

  const BATCH_SIZE = 400;
  let successCount = 0;
  let errorCount = 0;
  let noCoordinatesCount = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = rows.slice(i, i + BATCH_SIZE);

    slice.forEach((row, index) => {
      try {
        // Usar Document ID si existe, sino generar uno basado en el nombre
        const docId = row["Document ID"]?.trim() || 
                     row.name.toLowerCase()
                       .replace(/\s+/g, "-")
                       .replace(/[^a-z0-9-]/g, "");

        // Parsear categorías
        const categoriesArray = row.categories
          ?.split(",")
          .map((c) => c.trim())
          .filter(Boolean) || [];

        // Parsear URLs de imágenes
        const imagePaths = row.image
          ? row.image.split(",").map((url) => url.trim()).filter(Boolean)
          : [];

        // Parsear coordenadas
        const coordinates = parseCoordinates(row.coordinates);
        
        if (!coordinates) {
          noCoordinatesCount++;
          console.log(`⚠️ Sin coordenadas válidas: ${row.name} (${row.coordinates})`);
        }

        // Limpiar campos de texto (remover comillas extras si existen)
        const cleanText = (text: string) => text.replace(/(^"|"$)/g, "").trim();

        const data: DestinationFirestore = {
          name: cleanText(row.name),
          description: cleanText(row.description),
          address: cleanText(row.address),
          categories: categoriesArray,
          email: row.email?.trim() || null,
          openingTime: row["opening-time"]?.trim() || row.openingTime?.trim() || null,
          phone: row.phone.trim(),
          tagline: cleanText(row.tagline),
          website: row.website.trim(),
          imagePath: imagePaths[0] ?? undefined,
          imagePaths: imagePaths.length > 0 ? imagePaths : undefined,
          coordinates,
        };

        const ref = db.collection("destinations").doc(docId);
        batch.set(ref, data, { merge: true });
        successCount++;
      } catch (error) {
        console.error(`❌ Error procesando fila ${i + index + 1}:`, error);
        console.error("Datos de la fila:", row);
        errorCount++;
      }
    });

    await batch.commit();
    console.log(`✅ Importados documentos ${i + 1} a ${i + slice.length}`);
  }

  console.log("\n📊 Resumen de importación:");
  console.log(`✅ Éxitos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`⚠️ Sin coordenadas: ${noCoordinatesCount}`);
  console.log("🎉 Importación completada!");
}

runImport().catch((err: unknown) => {
  console.error("❌ Falló la importación:", err);
  process.exit(1);
});
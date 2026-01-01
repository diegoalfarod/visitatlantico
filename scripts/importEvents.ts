// scripts/importEvents.ts
import admin from "firebase-admin";
import csv from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface EventCSV {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  dates?: string;
  dateStart: string;
  dateEnd?: string;
  time?: string;
  location: string;
  municipality: string;
  address?: string;
  category: string;
  isFree?: string;
  price?: string;
  featured?: string;
  tags?: string;
  organizer?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  lat?: string;
  lng?: string;
  coordinates?: string;
}

interface EventFirestore {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  dates: string | null;
  dateStart: admin.firestore.Timestamp | null;
  dateEnd: admin.firestore.Timestamp | null;
  time: string | null;
  location: string;
  municipality: string;
  address: string | null;
  category: string;
  isFree: boolean;
  price: string | null;
  featured: boolean;
  tags: string[];
  organizer: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image: string | null;
  coordinates?: admin.firestore.GeoPoint;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
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
function parseCoordinates(
  lat?: string, 
  lng?: string, 
  coordinatesStr?: string
): admin.firestore.GeoPoint | undefined {
  // Método 1: lat y lng como columnas separadas
  if (lat && lng) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      console.log("✅ Coordenadas válidas (columnas separadas):", { lat: latNum, lng: lngNum });
      return new admin.firestore.GeoPoint(latNum, lngNum);
    }
  }
  
  // Método 2: String de coordenadas combinado
  if (!coordinatesStr || coordinatesStr.trim() === '') {
    return undefined;
  }
  
  console.log("📍 Parseando coordenadas:", coordinatesStr);
  
  // Regex para extraer lat y lng de formatos como {_latitude: 10.9878, _longitude: -74.7889}
  const regexUnderscore = /_latitude:\s*([-\d.]+).*_longitude:\s*([-\d.]+)|_longitude:\s*([-\d.]+).*_latitude:\s*([-\d.]+)/;
  const matchUnderscore = coordinatesStr.match(regexUnderscore);
  
  if (matchUnderscore) {
    const latVal = parseFloat(matchUnderscore[1] || matchUnderscore[4]);
    const lngVal = parseFloat(matchUnderscore[2] || matchUnderscore[3]);
    
    if (!isNaN(latVal) && !isNaN(lngVal)) {
      console.log("✅ Coordenadas válidas (regex _latitude/_longitude):", { lat: latVal, lng: lngVal });
      return new admin.firestore.GeoPoint(latVal, lngVal);
    }
  }
  
  // Regex para formatos como {lat: 10.9878, lng: -74.7889}
  const regex = /lat:\s*([-\d.]+).*lng:\s*([-\d.]+)|lng:\s*([-\d.]+).*lat:\s*([-\d.]+)/;
  const match = coordinatesStr.match(regex);
  
  if (match) {
    const latVal = parseFloat(match[1] || match[4]);
    const lngVal = parseFloat(match[2] || match[3]);
    
    if (!isNaN(latVal) && !isNaN(lngVal)) {
      console.log("✅ Coordenadas válidas (regex lat/lng):", { lat: latVal, lng: lngVal });
      return new admin.firestore.GeoPoint(latVal, lngVal);
    }
  }
  
  // Método 3: Intentar parsear como JSON
  if (coordinatesStr.includes('{') && coordinatesStr.includes('}')) {
    try {
      const jsonStr = coordinatesStr
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"');
      
      const parsed = JSON.parse(jsonStr);
      
      const latVal = parsed._latitude || parsed.lat;
      const lngVal = parsed._longitude || parsed.lng;
      
      if (latVal && lngVal) {
        const latNum = parseFloat(latVal);
        const lngNum = parseFloat(lngVal);
        
        if (!isNaN(latNum) && !isNaN(lngNum)) {
          console.log("✅ Coordenadas válidas (JSON):", { lat: latNum, lng: lngNum });
          return new admin.firestore.GeoPoint(latNum, lngNum);
        }
      }
    } catch (e) {
      console.log("No se pudo parsear como JSON, intentando otros formatos...");
    }
  }
  
  // Método 4: Formato "lat,lng" separado por coma
  const cleaned = coordinatesStr.trim().replace(/[()'"]/g, '').replace(/\s+/g, ' ');
  const separators = [',', ' ', ';', '|'];
  let parts: string[] = [];
  
  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      parts = cleaned.split(sep).map(p => p.trim()).filter(p => p);
      if (parts.length === 2) break;
    }
  }
  
  if (parts.length === 2) {
    const latNum = parseFloat(parts[0]);
    const lngNum = parseFloat(parts[1]);
    
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      console.log("✅ Coordenadas válidas (separador):", { lat: latNum, lng: lngNum });
      return new admin.firestore.GeoPoint(latNum, lngNum);
    }
  }
  
  console.log("❌ No se pudieron parsear las coordenadas:", coordinatesStr);
  return undefined;
}

// Función para parsear fecha a Timestamp
function parseDate(dateStr?: string): admin.firestore.Timestamp | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  // Intentar parsear formato YYYY-MM-DD
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return admin.firestore.Timestamp.fromDate(date);
  }
  
  return null;
}

// Función para parsear booleano
function parseBoolean(value?: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'sí' || lower === 'si';
}

// Limpiar texto
function cleanText(text?: string): string | null {
  if (!text || text.trim() === '') return null;
  return text.replace(/(^"|"$)/g, "").trim();
}

async function runImport(): Promise<void> {
  // IMPORTANTE: Cambia el nombre del archivo si es necesario
  const csvFile = path.join(__dirname, "EventsCSV.csv");
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ No se encontró el archivo: ${csvFile}`);
    console.log("Asegúrate de que el archivo CSV esté en la carpeta scripts/");
    console.log("\nColumnas esperadas:");
    console.log("slug, title, subtitle, description, dates, dateStart, dateEnd, time,");
    console.log("location, municipality, address, category, isFree, price, featured,");
    console.log("tags, organizer, phone, email, website, image, lat, lng");
    process.exit(1);
  }
  
  const rows: EventCSV[] = await csv().fromFile(csvFile);
  console.log(`📊 Total de eventos a importar: ${rows.length}`);

  // Verificar primeras filas para debug
  console.log("\n🔍 Verificando primeras 3 filas:");
  rows.slice(0, 3).forEach((row, i) => {
    console.log(`\nFila ${i + 1}:`);
    console.log("- Slug:", row.slug);
    console.log("- Título:", row.title);
    console.log("- Categoría:", row.category);
    console.log("- Fecha Inicio:", row.dateStart);
    console.log("- Coordenadas (lat/lng):", row.lat, row.lng);
  });

  // Contar categorías
  const categories = new Set(rows.map(r => r.category).filter(Boolean));
  console.log(`\n📂 Categorías encontradas: ${Array.from(categories).join(", ")}`);

  const BATCH_SIZE = 400;
  let successCount = 0;
  let errorCount = 0;
  let noCoordinatesCount = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = rows.slice(i, i + BATCH_SIZE);

    slice.forEach((row, index) => {
      try {
        // Usar slug como Document ID
        const docId = row.slug?.trim() || 
                     row.title.toLowerCase()
                       .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                       .replace(/\s+/g, "-")
                       .replace(/[^a-z0-9-]/g, "");

        if (!docId) {
          console.error(`❌ Sin slug válido para: ${row.title}`);
          errorCount++;
          return;
        }

        // Parsear tags
        const tagsArray = row.tags
          ?.split(",")
          .map((t) => t.trim())
          .filter(Boolean) || [];

        // Parsear coordenadas
        const coordinates = parseCoordinates(row.lat, row.lng, row.coordinates);
        
        if (!coordinates) {
          noCoordinatesCount++;
        }

        const data: EventFirestore = {
          slug: docId,
          title: row.title.trim(),
          subtitle: cleanText(row.subtitle),
          description: row.description?.trim() || "",
          dates: cleanText(row.dates),
          dateStart: parseDate(row.dateStart),
          dateEnd: parseDate(row.dateEnd),
          time: cleanText(row.time),
          location: row.location?.trim() || "",
          municipality: row.municipality?.trim() || "",
          address: cleanText(row.address),
          category: row.category?.trim().toLowerCase() || "otros",
          isFree: parseBoolean(row.isFree),
          price: cleanText(row.price),
          featured: parseBoolean(row.featured),
          tags: tagsArray,
          organizer: cleanText(row.organizer),
          phone: cleanText(row.phone),
          email: cleanText(row.email),
          website: cleanText(row.website),
          image: cleanText(row.image),
          coordinates,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const ref = db.collection("events").doc(docId);
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
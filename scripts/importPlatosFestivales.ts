// scripts/importPlatosFestivales.ts
// ------------------------------------------------------------
// Utilidad para importar los CSV generados de platos típicos y
// festivales del Atlántico a Firebase/Firestore.
// Este script sigue la misma estructura de tu importDestinations.ts
// y aprovecha csvtojson para leer los archivos.
// ------------------------------------------------------------

import admin from "firebase-admin";
import csv from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------
// 1. Definiciones de interfaces
// ---------------------------
interface PlatoCSV {
  id?: string;
  nombre: string;
  descripcion: string;
  imagen?: string;
  categoria: string;
  destacado?: string | boolean;
  origen: string;
  ingredientes?: string; // separadas por ; o ,
  donde_probar?: string;
}

interface FestivalCSV {
  id?: string;
  nombre: string;
  descripcion: string;
  fecha_dia: string; // 01‑31
  fecha_mes: string; // Enero, Febrero, etc.
  lugar: string;
  imagen?: string;
  enfocado?: string | boolean;
}

// Firestore (colección) – tipo de documento
interface PlatoFirestore {
  nombre: string;
  descripcion: string;
  categoria: string;
  destacado: boolean;
  origen: string;
  ingredientes?: string[];
  dondeProbar?: string;
  imagePath?: string; // referencia remota o local si luego subes a Storage
}
interface FestivalFirestore {
  nombre: string;
  descripcion: string;
  fecha: {
    dia: string;
    mes: string;
  };
  lugar: string;
  enfocado: boolean;
  imagePath?: string;
}

// ---------------------------
// 2. Utils de entorno
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyFile = path.join(__dirname, "serviceAccountKey.json");
if (!fs.existsSync(keyFile)) {
  console.error("❌ No se encontró el serviceAccountKey.json. Colócalo junto al script.");
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(keyFile, "utf8"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
// Para evitar errores con campos undefined o vacíos
// (feature disponible en Firestore SDK >=9)
db.settings({ ignoreUndefinedProperties: true });

// ---------------------------
// 3. Funciones de importación
// ---------------------------
const BATCH_SIZE = 400;

// Utilidad para normalizar booleanos ("true", "TRUE", "1" => true)
const toBool = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  return false;
};

// ---------------------------
// Importar Platos
// ---------------------------
async function importPlatos(csvPath: string, collection = "platos_tipicos"): Promise<void> {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV no encontrado: ${csvPath}`);
    return;
  }
  const rows: PlatoCSV[] = await csv().fromFile(csvPath);
  console.log(`🥘 Platos a importar: ${rows.length}`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = rows.slice(i, i + BATCH_SIZE);

    slice.forEach((row) => {
      try {
        // ID: usa el campo id si viene, si no genera slug del nombre
        const docId = (row.id?.trim() || row.nombre)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-_]/g, "");

        // Ingredientes → array
        const ingredientesArr = row.ingredientes
          ? row.ingredientes.split(/[;,]/).map((s) => s.trim()).filter(Boolean)
          : undefined;

        const data: PlatoFirestore = {
          nombre: row.nombre.trim(),
          descripcion: row.descripcion.trim(),
          categoria: row.categoria.trim(),
          destacado: toBool(row.destacado),
          origen: row.origen.trim(),
          ingredientes: ingredientesArr,
          dondeProbar: row.donde_probar?.trim() || undefined,
          imagePath: row.imagen?.trim() || undefined,
        };

        const ref = db.collection(collection).doc(docId);
        batch.set(ref, data, { merge: true });
      } catch (err) {
        console.error("❌ Error en fila de plato:", row, err);
      }
    });
    await batch.commit();
    console.log(`✅ Subidos ${i + 1}–${i + slice.length} platos`);
  }
}

// ---------------------------
// Importar Festivales
// ---------------------------
async function importFestivales(csvPath: string, collection = "festivales"): Promise<void> {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV no encontrado: ${csvPath}`);
    return;
  }
  const rows: FestivalCSV[] = await csv().fromFile(csvPath);
  console.log(`🎉 Festivales a importar: ${rows.length}`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = rows.slice(i, i + BATCH_SIZE);

    slice.forEach((row) => {
      try {
        const docId = (row.id?.trim() || row.nombre)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-_]/g, "");

        const data: FestivalFirestore = {
          nombre: row.nombre.trim(),
          descripcion: row.descripcion.trim(),
          fecha: {
            dia: row.fecha_dia.trim(),
            mes: row.fecha_mes.trim(),
          },
          lugar: row.lugar.trim(),
          enfocado: toBool(row.enfocado),
          imagePath: row.imagen?.trim() || undefined,
        };

        const ref = db.collection(collection).doc(docId);
        batch.set(ref, data, { merge: true });
      } catch (err) {
        console.error("❌ Error en fila de festival:", row, err);
      }
    });
    await batch.commit();
    console.log(`✅ Subidos ${i + 1}–${i + slice.length} festivales`);
  }
}

// ---------------------------
// 4. Ejecución
// ---------------------------
// Puedes adaptar rutas aquí o pasar como argumentos CLI.
(async () => {
  try {
    // Rutas relativas al directorio del script
    const platosCSV = path.join(__dirname, "platos_tipicos_atlantico.csv");
    const festivalesCSV = path.join(__dirname, "festivales_atlantico.csv");

    await importPlatos(platosCSV);
    await importFestivales(festivalesCSV);

    console.log("🚀 Importación completada con éxito ✨");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error general de importación:", err);
    process.exit(1);
  }
})();

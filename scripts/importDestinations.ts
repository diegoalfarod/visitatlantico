// scripts/importDestinations.ts
import admin from "firebase-admin";
import csv from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface DestinationCSV {
  id?: string;
  name: string;
  description: string;
  address: string;
  categories: string;
  email?: string;
  phone: string;
  tagline: string;
  website: string;
  image?: string;
  "opening-time"?: string;
  openingTime?: string;
  lat?: string;
  lng?: string;
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

async function runImport(): Promise<void> {
  const csvFile = path.join(__dirname, "destinations.csv");
  const rows: DestinationCSV[] = await csv().fromFile(csvFile);

  const BATCH_SIZE = 400;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = rows.slice(i, i + BATCH_SIZE);

    slice.forEach((row) => {
      const docId = row.id?.trim() || row.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const categoriesArray = row.categories?.split(",").map((c) => c.trim()).filter(Boolean) || [];

      const imagePaths = row.image
        ? row.image.split(",").map((url) => url.trim()).filter(Boolean)
        : [];

      let coordinates: { lat: number; lng: number } | undefined;
      if (row.lat && row.lng) {
        coordinates = {
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
        };
      }

      const data: DestinationFirestore = {
        name: row.name.replace(/(^"|"$)/g, "").trim(),
        description: row.description.replace(/(^"|"$)/g, "").trim(),
        address: row.address.replace(/(^"|"$)/g, "").trim(),
        categories: categoriesArray,
        email: row.email?.trim() || null,
        openingTime: row["opening-time"]?.trim() || row.openingTime?.trim() || null,
        phone: row.phone.trim(),
        tagline: row.tagline.replace(/(^"|"$)/g, "").trim(),
        website: row.website.replace(/(^"|"$)/g, "").trim(),
        imagePath: imagePaths[0] ?? undefined,
        imagePaths: imagePaths.length > 0 ? imagePaths : undefined,
        coordinates,
      };

      const ref = db.collection("destinations").doc(docId);
      batch.set(ref, data, { merge: true });
    });

    await batch.commit();
    console.log(`✅ Imported docs ${i} to ${i + slice.length - 1}`);
  }

  console.log("🎉 Todos los destinos fueron importados exitosamente.");
}

runImport().catch((err: unknown) => {
  console.error("❌ Falló la importación:", err);
  process.exit(1);
});

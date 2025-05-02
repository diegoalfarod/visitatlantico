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
  "e-mail"?: string;
  "opening-time"?: string;
  phone: string;
  tagline: string;
  website: string;
  imagePath?: string;
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
}

// ——— Definir __dirname en ESM ———
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1️⃣ Carga la clave del Service Account
const keyFile = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(
  fs.readFileSync(keyFile, "utf8")
) as admin.ServiceAccount;

// 2️⃣ Inicializa el Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ⚙️ Ignora undefined en los documentos
db.settings({ ignoreUndefinedProperties: true });

async function runImport(): Promise<void> {
  // 3️⃣ Lee y parsea el CSV
  const csvFile = path.join(__dirname, "destinations.csv");
  const rows: DestinationCSV[] = await csv().fromFile(csvFile);

  // 4️⃣ Batch de 400 documentos
  const BATCH_SIZE = 400;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = rows.slice(i, i + BATCH_SIZE);

    slice.forEach((row) => {
      const docId =
        row.id?.trim() ||
        row.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      const categoriesArray = row.categories
        .split(",")
        .map((c) => c.trim());

      const data: DestinationFirestore = {
        name: row.name,
        description: row.description,
        address: row.address,
        categories: categoriesArray,
        email: row["e-mail"] ?? null,
        openingTime: row["opening-time"] ?? null,
        phone: row.phone,
        tagline: row.tagline,
        website: row.website,
        // imagePath puede ser undefined y se ignorará
        imagePath: row.imagePath,
      };

      const ref = db.collection("destinations").doc(docId);
      batch.set(ref, data, { merge: true });
    });

    await batch.commit();
    console.log(`Imported docs ${i} to ${i + slice.length - 1}`);
  }

  console.log("✅ All destinations imported!");
}

runImport().catch((err: unknown) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});

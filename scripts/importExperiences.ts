// scripts/importExperiences.ts
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface Experience {
  title: string;
  description: string;
  image: string;
  category: string;
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
  // 3️⃣ Carga el archivo JSON
  const jsonPath = path.join(__dirname, "experiences.json");
  const experiences: Experience[] = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const batch = db.batch();

  experiences.forEach((exp) => {
    const docRef = db.collection("experiences").doc();
    batch.set(docRef, exp);
  });

  await batch.commit();
  console.log("✅ All experiences imported!");
}

runImport().catch((err: unknown) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});

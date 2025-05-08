// scripts/deleteAllDestinations.ts
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar la clave del Service Account
const keyFile = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(
  fs.readFileSync(keyFile, "utf8")
) as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function deleteAllDestinations() {
  const snapshot = await db.collection("destinations").get();

  const BATCH_SIZE = 400;
  for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = snapshot.docs.slice(i, i + BATCH_SIZE);
    slice.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`🗑️ Deleted docs ${i} to ${i + slice.length - 1}`);
  }

  console.log("✅ All destinations deleted!");
}

deleteAllDestinations().catch((err) => {
  console.error("❌ Failed to delete:", err);
  process.exit(1);
});

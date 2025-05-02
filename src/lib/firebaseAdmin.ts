import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// 1. Lee la var de entorno
const json = process.env.FIREBASE_SERVICE_JSON;
if (!json) {
  throw new Error("FIREBASE_SERVICE_JSON not set");
}

// 2. Convierte la cadena JSON a objeto
const serviceAccount = JSON.parse(json);

// 3. Inicializa (solo una vez)
export const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(serviceAccount) });

export const dbAdmin = getFirestore(adminApp);

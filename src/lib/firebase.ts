/*
File: src/lib/firebase.ts
Inicialización de Firebase (App, Firestore y Storage)
*/
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const env = (name: string) =>
  process.env[`NEXT_PUBLIC_${name}`] ?? process.env[name];

const firebaseConfig = {
  apiKey: env("FIREBASE_API_KEY") ?? "",
  authDomain: env("FIREBASE_AUTH_DOMAIN") ?? "",
  projectId: env("FIREBASE_PROJECT_ID") ?? "",
  storageBucket: env("FIREBASE_STORAGE_BUCKET") ?? "",
  messagingSenderId: env("FIREBASE_MESSAGING_SENDER_ID") ?? "",
  appId: env("FIREBASE_APP_ID") ?? "",
  measurementId: env("FIREBASE_MEASUREMENT_ID") ?? "",
};

if (!getApps().length) initializeApp(firebaseConfig);

export const db = getFirestore();
export const storage = getStorage();

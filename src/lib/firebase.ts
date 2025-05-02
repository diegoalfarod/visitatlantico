/*
File: src/lib/firebase.ts
Inicialización de Firebase (App, Firestore y Storage)
*/
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB_KbSPZjdXgR_u8r-c6NZ8oxR85loKvUU",
    authDomain: "visitatlantico-f5c09.firebaseapp.com",
    projectId: "visitatlantico-f5c09",
    storageBucket: "visitatlantico-f5c09.firebasestorage.app",
    messagingSenderId: "1097999694057",
    appId: "1:1097999694057:web:2e01d75dabe931d24dd878",
    measurementId: "G-P11NC2E1RQ"
};

if (!getApps().length) initializeApp(firebaseConfig);

export const db = getFirestore();
export const storage = getStorage();
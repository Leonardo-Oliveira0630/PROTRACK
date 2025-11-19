
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Helper to safely get env vars in various environments (Vite, Browser, Node)
const getEnvVar = (key: string, fallback: string): string => {
  try {
    // 1. Try Vite standard import.meta.env
    if (import.meta && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
    // 2. Try process.env (if shimmed)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  return fallback;
};

// Configuração do Firebase
// Nota: Em produção, estas chaves devem estar em um arquivo .env (VITE_FIREBASE_API_KEY, etc)
const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY", "AIzaSyAxWt4OQOZNL8Ri39RL33liIbiHEdLOnn0"),
  authDomain: "protrack-53651.firebaseapp.com",
  projectId: "protrack-53651",
  storageBucket: "protrack-53651.firebasestorage.app",
  messagingSenderId: "1058019470244",
  appId: "1:1058019470244:web:e0136ec062a6c602692f31",
  measurementId: "G-X0646EYZWV"
};

// Padrão Singleton para evitar inicialização duplicada no Hot Reload do Vite
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc, 
  where 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBvfC9BawWkxnMS6cdokwpCeND6SF1gTow",
  authDomain: "bairroscity.firebaseapp.com",
  projectId: "bairroscity",
  storageBucket: "bairroscity.firebasestorage.app",
  messagingSenderId: "567922637659",
  appId: "1:567922637659:web:59418647b8f95c7964787e",
  measurementId: "G-95GV9XRX4E"
};

// Inicializa o Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics com verificação de suporte no ambiente web
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Exporta as instâncias reais para sua aplicação
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

/**
 * Sanitiza recursivamente objetos antes de enviar para o Firestore.
 * Remove quaisquer chaves com valor 'undefined' (que causam exceção crítica no setDoc/updateDoc)
 * e garante que campos aninhados e arrays sejam seguros.
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // Ignora chaves com valor undefined
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      clean[key] = sanitizeFirestoreData(value);
    } else if (Array.isArray(value)) {
      clean[key] = value.map((item) =>
        item !== null && typeof item === 'object' ? sanitizeFirestoreData(item) : (item === undefined ? null : item)
      );
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc, 
  where,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously,
  onAuthStateChanged
};

export type { User };
export default app;

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, getDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);

export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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

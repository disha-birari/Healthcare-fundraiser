import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASJxGED6W5rzhhhZTGpbagj8vl-QSGoOM",
  authDomain: "disha21.firebaseapp.com",
  projectId: "disha21",
  storageBucket: "disha21.firebasestorage.app",
  messagingSenderId: "201383521403",
  appId: "1:201383521403:web:1659ebe617f9dd82f9c6de"
};

// Ensure Firebase is only initialized once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

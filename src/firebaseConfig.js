import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCYx0zS6VQLA3ZMHVvjm0SL3fXnH1W5JAE",
  authDomain: "instacart-75143.firebaseapp.com",
  databaseURL: "https://instacart-75143-default-rtdb.firebaseio.com",
  projectId: "instacart-75143",
  storageBucket: "instacart-75143.firebasestorage.app",
  messagingSenderId: "572330665826",
  appId: "1:572330665826:web:a61c6fe5520ff82694ae3b",
  measurementId: "G-LMSSDRF9KJ"
};

// Singleton App Instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
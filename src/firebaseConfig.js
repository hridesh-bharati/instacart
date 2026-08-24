import { initializeApp } from 'firebase/app';
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

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA1kSE0St1cyTOyZlFycWgp2hkKO4Bwvl8",
  authDomain: "iyilikkernanimobile.firebaseapp.com",
  projectId: "iyilikkernanimobile",
  storageBucket: "iyilikkernanimobile.firebasestorage.app",
  messagingSenderId: "34126359922",
  appId: "1:34126359922:web:2cd44501f6456628ebc1eb",
  measurementId: "G-GL4GWD68B0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

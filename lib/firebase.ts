// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmsS8-TIPz0HRNxXDnmu73weBwQ3hn_1I",
  authDomain: "niyyah-proto-v1.firebaseapp.com",
  projectId: "niyyah-proto-v1",
  storageBucket: "niyyah-proto-v1.firebasestorage.app",
  messagingSenderId: "246353599180",
  appId: "1:246353599180:web:22581acf82733b8889c069",
};

// Initialize and export Firestore
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

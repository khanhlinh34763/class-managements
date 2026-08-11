import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCuMl8KgAKdi__diXZISxe8NCOwwdRI_wE",
  authDomain: "class-managements-ac9d7.firebaseapp.com",
  projectId: "class-managements-ac9d7",
  storageBucket: "class-managements-ac9d7.firebasestorage.app",
  messagingSenderId: "1040112532480",
  appId: "1:1040112532480:web:bec46a487c222d624e2ce5",
  measurementId: "G-GDQ23V2X2C",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
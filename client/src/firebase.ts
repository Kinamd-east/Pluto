// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKGQedamOxn8G16pbxHt8wyFzRzkLIOHc",
  authDomain: "pluto-a51b1.firebaseapp.com",
  projectId: "pluto-a51b1",
  storageBucket: "pluto-a51b1.firebasestorage.app",
  messagingSenderId: "785907734128",
  appId: "1:785907734128:web:fb9f40702e3988630f86b5",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

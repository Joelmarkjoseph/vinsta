// Import necessary Firebase services
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5DjV8HvfUUobuGaSrdAOArIzlFxpQdR8",
  authDomain: "vinstaforvits.firebaseapp.com",
  projectId: "vinstaforvits",
  storageBucket: "vinstaforvits.appspot.com",  // Fixed incorrect storageBucket
  messagingSenderId: "679073177322",
  appId: "1:679073177322:web:0d7f2f25c6bb5423de0193",
  measurementId: "G-9RQNH8QHDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, analytics, storage, db };

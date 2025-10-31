// Import the functions you need from the SDKs you need
// firebase.ts
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD_bRvdDsywIj8xG4zTfO9tuIUs7ee0gv8",
  authDomain: "skybound-72c6d.firebaseapp.com",
  databaseURL: "https://skybound-72c6d-default-rtdb.firebaseio.com",
  projectId: "skybound-72c6d",
  storageBucket: "skybound-72c6d.firebasestorage.app",
  messagingSenderId: "367556706415",
  appId: "1:367556706415:web:0b3004fd8070c0b0e88d9a",
  measurementId: "G-CFEYW370YW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
export { analytics, app, auth, db };

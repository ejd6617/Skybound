// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Cloud Firestore
const db = getFirestore(app);

//Initialize User Authentication
const auth = getAuth(app);

// Export app, db, analytics, and auth for use throughout your application
export { app, db, analytics, auth };
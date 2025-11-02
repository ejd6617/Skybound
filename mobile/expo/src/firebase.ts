import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_bRvdDsywIj8xG4zTfO9tuIUs7ee0gv8",
  authDomain: "skybound-72c6d.firebaseapp.com",
  databaseURL: "https://skybound-72c6d-default-rtdb.firebaseio.com",
  projectId: "skybound-72c6d",
  storageBucket: "skybound-72c6d.appspot.com",
  messagingSenderId: "367556706415",
  appId: "1:367556706415:web:0b7f...REDACT",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Register Auth for RN with AsyncStorage persistence (guard against double-init)
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { app, auth, db };

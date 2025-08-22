import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyArjT4PSPVvcym85ikzARutCrGKRbaYiV8",
  authDomain: "quik-do.firebaseapp.com",
  projectId: "quik-do",
  storageBucket: "quik-do.firebasestorage.app",
  messagingSenderId: "353212567030",
  appId: "1:353212567030:web:6daf3e0be82007f11c4bd7",
  measurementId: "G-P5YYJPX6L0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;




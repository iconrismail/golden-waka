import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE CONFIGURATION
// Replace the values below with your own Firebase project config.
//
// How to get your config:
//   1. Go to https://console.firebase.google.com
//   2. Create a project (or open an existing one)
//   3. Go to Project Settings → Your Apps → Web App
//   4. Copy the firebaseConfig object and paste it here
//   5. In the Firebase Console → Authentication → Sign-in method
//      → Enable "Email/Password"
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
    apiKey:            "AIzaSyDeHcdQ7Wxq-D6aPzQHlVMYFAyFGHA_goA",
    authDomain:        "golden-waka.firebaseapp.com",
    projectId:         "golden-waka",
    storageBucket:     "golden-waka.firebasestorage.app",
    messagingSenderId: "231784221028",
    appId:             "1:231784221028:web:1970d4b25e729ecb701271",
};

const app     = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;

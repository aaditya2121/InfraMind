import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Null-safe initialization (guards against missing env vars in SSR/CI)
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
const googleProvider = new GoogleAuthProvider();

if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
    console.warn("Firebase API Key is missing. Check your .env.local file.");
}

try {
    if (firebaseConfig.apiKey) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);

        // Use initializeFirestore for more control over persistence
        db = initializeFirestore(app, {
            localCache: undefined, // Default is usually fine, but we'll try to enable persistence below
        });

        // Enable offline persistence if in browser
        if (typeof window !== 'undefined') {
            enableIndexedDbPersistence(db).catch((err) => {
                if (err.code === 'failed-precondition') {
                    // Multiple tabs open, persistence can only be enabled in one tab at a time.
                    console.warn("Firestore persistence failed: Multiple tabs open");
                } else if (err.code === 'unimplemented') {
                    // The current browser does not support all of the features required to enable persistence
                    console.warn("Firestore persistence failed: Browser not supported");
                }
            });
        }
    }
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { app, auth, db, googleProvider };

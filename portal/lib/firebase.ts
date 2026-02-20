import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// These are public keys meant for the browser. 
// Hardcoding them as defaults is safe for Firebase client SDKs.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBcVirx8JFl7jivNktEEcKkuRSma_BvYiY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "job-trackr-43db0.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "job-trackr-43db0",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "job-trackr-43db0.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "105631204857",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:105631204857:web:7678dfb4b7f12214c02928",
};

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;

export function getFirebaseAuth(): Auth | null {
    if (typeof window === "undefined") return null;

    if (authInstance) return authInstance;

    // Check if configuration is present
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
        console.error("Firebase Configuration Missing: NEXT_PUBLIC_FIREBASE_API_KEY is not set.");
        return null;
    }

    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        authInstance = getAuth(app);
        return authInstance;
    } catch (error) {
        console.error("Firebase Auth initialization failed:", error);
        return null;
    }
}

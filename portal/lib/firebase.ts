import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;

export function getFirebaseAuth(): Auth | null {
    if (typeof window === "undefined") return null;

    if (authInstance) return authInstance;

    // Check if configuration is present
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined" || firebaseConfig.apiKey === "") {
        console.error("Firebase Configuration Missing: Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your environment.");
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

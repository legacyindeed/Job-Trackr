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

let app: FirebaseApp;
let auth: Auth;

if (typeof window !== "undefined") {
    // Client-side initialization
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
} else {
    // Server-side / Build-time dummy or lazy initialization
    // We initialize it anyway because some hooks might call it, 
    // but the actual usage will fail safely or be skipped
    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (e) {
        // Fallback for build time without keys
        app = {} as FirebaseApp;
        auth = {} as Auth;
    }
}

export { auth };

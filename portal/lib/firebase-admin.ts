import * as admin from 'firebase-admin';

function getAdminApp() {
    if (admin.apps.length > 0) return admin.apps[0];

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Vercel handles newlines differently. We try to normalize them.
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        return null;
    }

    // Fix for Vercel/Node private key formatting
    if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Ensure it has the correct BEGIN/END blocks if they were stripped
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        return null;
    }
}

export const adminAuth = {
    verifyIdToken: async (token: string) => {
        const app = getAdminApp();
        if (!app) {
            console.error("Firebase Admin SDK failed to initialize. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
            throw new Error("SERVER_CONFIG_ERROR: Firebase Admin SDK not initialized.");
        }
        try {
            return await admin.auth(app).verifyIdToken(token);
        } catch (error: any) {
            console.error("Token verification failed:", error.message);
            throw error;
        }
    }
};

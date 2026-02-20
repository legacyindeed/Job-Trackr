import * as admin from 'firebase-admin';

function getAdminApp() {
    if (admin.apps.length > 0) return admin.apps[0];

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        return null;
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
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
            throw new Error("Firebase Admin SDK not initialized. Check your environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).");
        }
        return admin.auth(app).verifyIdToken(token);
    }
};

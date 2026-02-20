import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App | { error: string } {
    if (admin.apps.length > 0) return admin.apps[0] as admin.app.App;

    // Try server-side secret first, fallback to public project ID if missing
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId) return { error: "Missing FIREBASE_PROJECT_ID" };
    if (!clientEmail) return { error: "Missing FIREBASE_CLIENT_EMAIL" };
    if (!privateKey) return { error: "Missing FIREBASE_PRIVATE_KEY" };

    // Cleanup: Remove quotes if added by mistake
    privateKey = privateKey.trim().replace(/^["']|["']$/g, '');

    // Cleanup: Handle escaped newlines
    if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Cleanup: Ensure the key has the correct headers
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
    } catch (error: any) {
        console.error("Firebase Admin initialization error:", error);
        return { error: `Init failed: ${error.message}` };
    }
}

export const adminAuth = {
    verifyIdToken: async (token: string) => {
        const result = getAdminApp();

        if ('error' in result) {
            console.error("Firebase Admin Config Error:", result.error);
            throw new Error(`SERVER_CONFIG_ERROR: ${result.error}`);
        }

        try {
            return await admin.auth(result).verifyIdToken(token);
        } catch (error: any) {
            console.error("Token verification failed:", error.message);
            throw error;
        }
    }
};

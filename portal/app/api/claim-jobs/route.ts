import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';
import sql from '../../../lib/db';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const result = await sql`UPDATE jobs SET user_id = ${uid} WHERE user_id IS NULL OR user_id = '';`;

        return NextResponse.json({
            success: true,
            message: `Linked ${result.count} orphaned jobs to your account!`,
            uid,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

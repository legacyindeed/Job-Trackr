import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { adminAuth } from "../../../lib/firebase-admin";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // One-time fix: Update all jobs that have NO user_id and assign them to THIS user
        const result = await sql`UPDATE jobs SET user_id = ${uid} WHERE user_id IS NULL OR user_id = '';`;

        return NextResponse.json({
            success: true,
            message: `Linked ${result.rowCount} orphaned jobs to your account!`,
            uid: uid
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebase-admin";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        if (!uid) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Check if there are any jobs without a user_id
        const orphanJobs = await sql`SELECT count(*) FROM jobs WHERE user_id IS NULL`;
        const orphanCount = parseInt(orphanJobs.rows[0].count);

        if (orphanCount > 0) {
            // Check how many users have already "claimed" jobs (or just if any user exists in a tracking table)
            // For simplicity, let's say the first user TO ONBOARD claims all orphans.
            const userWithJobs = await sql`SELECT count(DISTINCT user_id) FROM jobs WHERE user_id IS NOT NULL`;
            const userCount = parseInt(userWithJobs.rows[0].count);

            if (userCount === 0) {
                await sql`UPDATE jobs SET user_id = ${uid} WHERE user_id IS NULL`;
                return NextResponse.json({ success: true, claimed: orphanCount });
            }
        }

        return NextResponse.json({ success: true, claimed: 0 });
    } catch (error: any) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

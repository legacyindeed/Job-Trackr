import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';

async function getUserId(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Missing Authorization header', status: 401 };
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return { uid: decodedToken.uid };
    } catch (error: any) {
        if (error.message?.includes("SERVER_CONFIG_ERROR")) {
            return { error: 'Server configuration error', status: 500 };
        }
        return { error: 'Invalid token', status: 401 };
    }
}

export async function GET(request: Request) {
    const authResult = await getUserId(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.uid;

    try {
        const { rows } = await sql`
            SELECT 
                id, 
                title, 
                company, 
                location, 
                salary, 
                url, 
                status, 
                job_type as "jobType", 
                created_at as "date", 
                updated_at as "updatedAt"
            FROM jobs 
            WHERE user_id = ${userId}
            ORDER BY id DESC;
        `;
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const authResult = await getUserId(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.uid;

    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const { rowCount } = await sql`DELETE FROM jobs WHERE url = ${url} AND user_id = ${userId};`;

        if (rowCount === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

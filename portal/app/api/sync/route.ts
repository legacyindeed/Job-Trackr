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

export async function POST(request: Request) {
    const authResult = await getUserId(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.uid;

    try {
        const job = await request.json();

        // Clean title on save as well
        if (job.title) {
            const prefixes = [
                'Job Application for', 'Application for', 'Apply for',
                'Job Application', 'Application', 'Apply', 'Careers at'
            ];
            const prefixPattern = new RegExp(`^(${prefixes.join('|')})\\s+`, 'i');
            job.title = job.title.replace(prefixPattern, '').trim();
        }

        const {
            title,
            company,
            location,
            salary,
            url,
            status = 'Applied',
            jobType,
        } = job;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Upsert logic (Insert or Update on conflict)
        await sql`
      INSERT INTO jobs (title, company, location, salary, url, status, job_type, user_id, updated_at)
      VALUES (${title}, ${company}, ${location}, ${salary}, ${url}, ${status}, ${jobType}, ${userId}, NOW())
      ON CONFLICT (url) DO UPDATE
      SET 
        title = EXCLUDED.title,
        status = EXCLUDED.status, 
        user_id = EXCLUDED.user_id,
        updated_at = NOW();
    `;

        const origin = request.headers.get('origin');
        const headers = {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Credentials': 'true',
        };

        return NextResponse.json({ success: true }, { headers });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function OPTIONS(request: Request) {
    const origin = request.headers.get('origin');
    const headers = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };
    return NextResponse.json({}, { headers });
}

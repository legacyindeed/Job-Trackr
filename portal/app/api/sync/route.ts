import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';

async function getUserId(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export async function POST(request: Request) {
    const userId = await getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

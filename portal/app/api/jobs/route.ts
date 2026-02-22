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
            return { error: error.message, status: 500 };
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
                description,
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

export async function POST(request: Request) {
    const authResult = await getUserId(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.uid;

    try {
        const job = await request.json();

        let { title, company, location, salary, url, status = 'Applied', jobType, description } = job;

        if (!title || !company) {
            return NextResponse.json({ error: 'Title and Company are required' }, { status: 400 });
        }

        // Clean title
        const prefixes = ['Job Application for', 'Application for', 'Apply for', 'Job Application', 'Application', 'Apply', 'Careers at'];
        const prefixPattern = new RegExp(`^(${prefixes.join('|')})\\s+`, 'i');
        title = title.replace(prefixPattern, '').trim();

        // If no URL (manual entry), generate a unique one
        if (!url) {
            url = `manual-${userId}-${Date.now()}`;
        }

        await sql`
            INSERT INTO jobs (title, company, location, salary, url, status, job_type, description, user_id, updated_at)
            VALUES (${title}, ${company}, ${location}, ${salary}, ${url}, ${status}, ${jobType}, ${description}, ${userId}, NOW())
            ON CONFLICT (url) DO UPDATE
            SET 
                title = EXCLUDED.title,
                company = EXCLUDED.company,
                location = EXCLUDED.location,
                salary = EXCLUDED.salary,
                status = EXCLUDED.status,
                job_type = EXCLUDED.job_type,
                description = EXCLUDED.description,
                updated_at = NOW();
        `;

        return NextResponse.json({ success: true });
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

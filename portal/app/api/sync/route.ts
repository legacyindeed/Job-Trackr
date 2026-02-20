import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

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
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
    };
    return NextResponse.json({}, { headers });
}

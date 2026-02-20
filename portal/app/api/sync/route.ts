import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
      INSERT INTO jobs (title, company, location, salary, url, status, job_type, updated_at)
      VALUES (${title}, ${company}, ${location}, ${salary}, ${url}, ${status}, ${jobType}, NOW())
      ON CONFLICT (url) DO UPDATE
      SET 
        title = EXCLUDED.title,
        status = EXCLUDED.status, 
        updated_at = NOW();
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function OPTIONS(request: Request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    return NextResponse.json({}, { headers });
}

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
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
            ORDER BY id DESC;
        `;
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const { rowCount } = await sql`DELETE FROM jobs WHERE url = ${url};`;

        if (rowCount === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

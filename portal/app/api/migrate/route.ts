import { NextResponse } from 'next/server';
import sql from '../../../lib/db';

export async function GET() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT,
                salary TEXT,
                url TEXT UNIQUE,
                status TEXT DEFAULT 'Applied',
                job_type TEXT DEFAULT 'Full-time',
                description TEXT,
                user_id TEXT,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id SERIAL PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                full_name TEXT,
                email TEXT,
                phone TEXT,
                location TEXT,
                linkedin TEXT,
                portfolio TEXT,
                github TEXT,
                resume_text TEXT,
                work_history JSONB DEFAULT '[]',
                education JSONB DEFAULT '[]',
                skills JSONB DEFAULT '[]',
                custom_responses JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Safe column additions for existing tables
        await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;`;
        await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS notes TEXT;`;
        await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location TEXT;`;
        await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';`;
        await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_responses JSONB DEFAULT '{}';`;

        return NextResponse.json({ success: true, message: 'Database schema created/updated successfully' });
    } catch (error: any) {
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Update existing jobs table
        await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;`;

        // Create user_profiles table
        await sql`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id SERIAL PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                full_name TEXT,
                email TEXT,
                phone TEXT,
                linkedin TEXT,
                portfolio TEXT,
                github TEXT,
                resume_text TEXT,
                work_history JSONB DEFAULT '[]',
                education JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        return NextResponse.json({ success: true, message: 'Schema updated successfully' });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}

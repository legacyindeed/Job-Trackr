import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;`;
        return NextResponse.json({ success: true, message: 'Schema updated successfully' });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebase-admin";

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
            SELECT * FROM user_profiles WHERE user_id = ${userId}
        `;
        return NextResponse.json(rows[0] || null);
    } catch (error) {
        console.error('Profile fetch error:', error);
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
        const profile = await request.json();
        const {
            full_name, email, phone, location, linkedin, portfolio, github,
            resume_text, work_history, education, skills, custom_responses
        } = profile;

        await sql`
            INSERT INTO user_profiles (
                user_id, full_name, email, phone, location, linkedin, portfolio, github, 
                resume_text, work_history, education, skills, custom_responses, updated_at
            )
            VALUES (
                ${userId}, 
                ${full_name || null}, 
                ${email || null}, 
                ${phone || null}, 
                ${location || null}, 
                ${linkedin || null}, 
                ${portfolio || null}, 
                ${github || null}, 
                ${resume_text || null}, 
                ${JSON.stringify(work_history || [])}, 
                ${JSON.stringify(education || [])}, 
                ${JSON.stringify(skills || [])}, 
                ${JSON.stringify(custom_responses || {})},
                NOW()
            )
            ON CONFLICT (user_id) DO UPDATE
            SET 
                full_name = EXCLUDED.full_name,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                location = EXCLUDED.location,
                linkedin = EXCLUDED.linkedin,
                portfolio = EXCLUDED.portfolio,
                github = EXCLUDED.github,
                resume_text = EXCLUDED.resume_text,
                work_history = EXCLUDED.work_history,
                education = EXCLUDED.education,
                skills = EXCLUDED.skills,
                custom_responses = EXCLUDED.custom_responses,
                updated_at = NOW();
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile save error:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

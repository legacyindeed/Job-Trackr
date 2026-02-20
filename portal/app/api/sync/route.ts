import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to handle data persistence
const dataPath = path.join(process.cwd(), 'data', 'jobs.json');

function getJobs() {
    if (!fs.existsSync(dataPath)) return [];
    const file = fs.readFileSync(dataPath, 'utf8');
    try { return JSON.parse(file); } catch { return []; }
}

function saveJob(job: any) {
    const jobs = getJobs();
    const existingIndex = jobs.findIndex((j: any) => j.url === job.url);

    // Clean title on save as well
    if (job.title) {
        const prefixes = [
            'Job Application for', 'Application for', 'Apply for',
            'Job Application', 'Application', 'Apply', 'Careers at'
        ];
        const prefixPattern = new RegExp(`^(${prefixes.join('|')})\\s+`, 'i');
        job.title = job.title.replace(prefixPattern, '').trim();
    }

    if (existingIndex >= 0) {
        // Update existing job
        // Merge existing data with new data (preserving fields not passed, if any, but simplified here)
        jobs[existingIndex] = { ...jobs[existingIndex], ...job, updatedAt: new Date().toISOString() };
        fs.writeFileSync(dataPath, JSON.stringify(jobs, null, 2));
        return true; // Updated
    } else {
        // Insert new job
        jobs.push({ ...job, syncedAt: new Date().toISOString() });
        if (!fs.existsSync(path.dirname(dataPath))) fs.mkdirSync(path.dirname(dataPath), { recursive: true });
        fs.writeFileSync(dataPath, JSON.stringify(jobs, null, 2));
        return true; // Created
    }
}

export async function POST(request: Request) {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return NextResponse.json({}, { headers });

    try {
        const job = await request.json();
        const saved = saveJob(job);
        return NextResponse.json({ success: true, saved }, { headers });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400, headers });
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

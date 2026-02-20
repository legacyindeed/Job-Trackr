import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'jobs.json');

export async function GET() {
    if (!fs.existsSync(dataPath)) {
        return NextResponse.json([]);
    }
    try {
        const file = fs.readFileSync(dataPath, 'utf8');
        const jobs = JSON.parse(file);
        return NextResponse.json(jobs.reverse()); // Newest first
    } catch {
        return NextResponse.json([]);
    }
}
export async function DELETE(request: Request) {
    if (!fs.existsSync(dataPath)) {
        return NextResponse.json({ success: false, error: 'No data' }, { status: 404 });
    }

    try {
        const { url } = await request.json();
        const file = fs.readFileSync(dataPath, 'utf8');
        let jobs = JSON.parse(file);

        const initialLength = jobs.length;
        jobs = jobs.filter((job: any) => job.url !== url);

        if (jobs.length === initialLength) {
            return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        fs.writeFileSync(dataPath, JSON.stringify(jobs, null, 2));
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
}

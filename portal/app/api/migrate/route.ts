import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Hardcoded data to avoid Vercel filesystem issues
        const jobs = [
            {
                "title": "Senior Manager, Client Operations at The Trade Desk",
                "url": "https://job-boards.greenhouse.io/thetradedesk/jobs/5057268007",
                "company": "Thetradedesk",
                "location": "N/A",
                "salary": "$123,000",
                "jobType": "N/A",
                "date": "2026-02-20T03:47:19.144Z",
                "status": "Applied",
                "syncedAt": "2026-02-20T03:40:23.279Z",
                "updatedAt": "2026-02-20T05:26:48.750Z",
                "notes": ""
            },
            {
                "title": "Senior Product Manager, AI & ML Platform",
                "url": "https://job-boards.greenhouse.io/springhealth66/jobs/4663711005",
                "company": "Springhealth66",
                "location": "N/A",
                "salary": "$150,000 - $202,400,",
                "jobType": "Contract",
                "date": "2026-02-20T04:01:42.151Z",
                "status": "Applied",
                "syncedAt": "2026-02-20T04:01:44.838Z"
            },
            {
                "title": "Sr. Growth Marketing Manager, Slush Wallet",
                "url": "https://jobs.ashbyhq.com/mystenlabs/90c41194-3f07-43c2-b424-971dabc8a91c/application",
                "company": "Mystenlabs",
                "location": "Remote / Unknown",
                "salary": "$150000 - $203000 / YEAR",
                "jobType": "Full Time",
                "date": "2026-02-20T05:39:30.317Z",
                "status": "Applied",
                "syncedAt": "2026-02-20T05:39:30.688Z",
                "updatedAt": "2026-02-20T06:11:16.699Z"
            },
            {
                "title": "Senior Product Manager",
                "url": "https://job-boards.greenhouse.io/novacredit/jobs/4138967009?utm_source=Simplify&gh_src=Simplify",
                "company": "Novacredit",
                "location": "N/A",
                "salary": "$176,800 - $216,000",
                "jobType": "Full-Time",
                "date": "2026-02-20T05:42:03.891Z",
                "status": "Applied",
                "syncedAt": "2026-02-20T05:42:04.157Z",
                "updatedAt": "2026-02-20T06:11:16.737Z"
            },
            {
                "title": "Doxel",
                "url": "https://jobs.lever.co/doxel/d2a28dbe-dd79-4efa-80ae-f99363ed0ef1/apply?lever-source=Simplify",
                "company": "Doxel",
                "location": "Remote / Unknown",
                "salary": "N/A",
                "jobType": "N/A",
                "date": "2026-02-20T05:44:04.100Z",
                "status": "Applied",
                "syncedAt": "2026-02-20T05:44:04.626Z",
                "updatedAt": "2026-02-20T06:11:16.773Z",
                "notes": ""
            },
            {
                "company": "Relayfi",
                "date": "2026-02-20T06:01:45.165Z",
                "jobType": "Full Time",
                "location": "New York, Boston",
                "salary": "$189000 - $231000 / YEAR",
                "status": "Applied",
                "title": "Senior Product Manager",
                "url": "https://jobs.ashbyhq.com/relayfi/21ba5113-b559-466a-806c-226f8325affc/application?utm_source=Simplify",
                "syncedAt": "2026-02-20T06:11:16.808Z"
            },
            {
                "company": "Easyllama.com",
                "date": "2026-02-20T06:02:57.727Z",
                "jobType": "Full Time",
                "location": "Remote / Unknown",
                "salary": "$130000 - $140000 / YEAR",
                "status": "Applied",
                "title": "Revenue Operations Manager",
                "url": "https://jobs.ashbyhq.com/easyllama.com/f284342b-0579-4d7b-b009-8b9b2778d6b8/application",
                "syncedAt": "2026-02-20T06:11:16.839Z"
            },
            {
                "company": "Wrapbook",
                "date": "2026-02-20T06:04:34.980Z",
                "jobType": "Full Time",
                "location": "Remote / Unknown",
                "salary": "",
                "status": "Applied",
                "title": "Senior Product Manager II",
                "url": "https://jobs.ashbyhq.com/wrapbook/696bb16f-df4f-4e2a-af50-b61792513c33",
                "syncedAt": "2026-02-20T06:11:16.872Z"
            }
        ];

        // 2. Insert each job into Postgres
        const results = [];
        for (const job of jobs) {
            const {
                title,
                company,
                location,
                salary,
                url,
                status = 'Applied',
                jobType,
                date,
            } = job;

            if (!url) continue;

            // Use upsert to avoid duplicates
            await sql`
        INSERT INTO jobs (title, company, location, salary, url, status, job_type, created_at, updated_at)
        VALUES (
          ${title}, 
          ${company}, 
          ${location}, 
          ${salary}, 
          ${url}, 
          ${status}, 
          ${jobType}, 
          ${date ? new Date(date) : new Date()}, 
          NOW()
        )
        ON CONFLICT (url) DO NOTHING;
      `;
            results.push(url);
        }

        return NextResponse.json({
            success: true,
            count: results.length,
            migrated: results
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
    }
}

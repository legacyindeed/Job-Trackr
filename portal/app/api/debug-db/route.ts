import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("Starting migration...");

        // Add user_id column if it doesn't exist
        await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id TEXT;`;
        console.log("Added user_id column");

        // Ensure url is unique for upsert logic (ON CONFLICT (url))
        // First check if it's already unique/has a constraint
        try {
            await sql`ALTER TABLE jobs ADD CONSTRAINT jobs_url_unique UNIQUE (url);`;
            console.log("Added unique constraint to url");
        } catch (e: any) {
            console.log("Constraint might already exist:", e.message);
        }

        return NextResponse.json({ success: true, message: "Migration completed successfully" });
    } catch (error: any) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

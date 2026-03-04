import postgres from 'postgres';

// Uses DATABASE_URL first (plain env var you set manually in Vercel),
// falls back to POSTGRES_URL. This avoids conflicts with Vercel's Neon integration.
const connectionString = process.env.Supabase_Postgres_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL!;

const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Required for Supabase connection pooler (Transaction mode)
});

export default sql;

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email;
    `;

        const newUser = result.rows[0];

        // Optional: Auto-claim orphan jobs for the first user
        const userCount = await sql`SELECT count(*) FROM users`;
        if (userCount.rows[0].count === "1") {
            await sql`UPDATE jobs SET user_id = ${newUser.id} WHERE user_id IS NULL`;
        }

        return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

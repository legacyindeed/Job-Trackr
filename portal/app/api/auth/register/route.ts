import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Using a local JSON file to simulate a user database for this MVP
const usersPath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // Ensure data directory exists
        if (!fs.existsSync(path.dirname(usersPath))) {
            fs.mkdirSync(path.dirname(usersPath), { recursive: true });
        }

        // Read existing users
        let users: any[] = [];
        if (fs.existsSync(usersPath)) {
            const file = fs.readFileSync(usersPath, 'utf8');
            try { users = JSON.parse(file); } catch { }
        }

        // Check if user exists
        if (users.find(u => u.email === email)) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Create new user (Simulated - no hashing for demo prototype, obviously insecure for production!)
        const newUser = {
            id: "u_" + Math.random().toString(36).substr(2, 9),
            email,
            password, // In prod, hash this!
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        // Return a fake JWT token
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ id: newUser.id, email: newUser.email })) + ".signature";

        return NextResponse.json({ success: true, token, user: { id: newUser.id, email: newUser.email } });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

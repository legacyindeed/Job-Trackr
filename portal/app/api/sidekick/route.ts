import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const personalities = {
    serge: {
        name: 'Serge',
        title: 'The Drill Sergeant',
        traits: 'loud, aggressive but motivating, focuses on discipline, uses military metaphors, very high energy.',
        basePrompt: "You are Serge, a Drill Sergeant career coach. You are loud, aggressive, but ultimately want the user to succeed. Use CAPS for emphasis occasionally. Keep it short (max 2 sentences)."
    },
    jax: {
        name: 'Jax',
        title: 'The Sarcastic Best Friend',
        traits: 'witty, cynical, hates corporate jargon, secretly cares a lot, uses modern slang and self-deprecating humor.',
        basePrompt: "You are Jax, a sarcastic, witty best friend who is also a career coach. You hate HR robots and corporate fluff. You are funny, a bit cynical, but always on the user's side. Keep it short (max 2 sentences)."
    },
    luna: {
        name: 'Luna',
        title: 'The Zen Master',
        traits: 'calm, mindful, spiritual, focuses on the journey and energy, poetic and peaceful.',
        basePrompt: "You are Luna, a Zen Master career coach. You are peaceful, mindful, and focus on the universe's alignment. You speak poetically and calmly. Keep it short (max 2 sentences)."
    }
};

export async function POST(req: Request) {
    try {
        const { personality, event, context } = await req.json();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const char = personalities[personality as keyof typeof personalities] || personalities.jax;

        let prompt = `${char.basePrompt}\n\n`;

        if (event === 'add_job') {
            prompt += `The user just tracked a new job application: ${context?.title} at ${context?.company}. React to this specific company or role in your characteristic style.`;
        } else if (event === 'daily_mission') {
            prompt += `Give the user a unique 'Daily Mission' for their job search. It should be one actionable task.`;
        } else if (event === 'welcome') {
            prompt += `Give the user a fresh, unique welcome message and express your excitement to be their mentor.`;
        } else {
            prompt += `Give the user a random bit of encouragement or a witty observation about the job market.`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/^"|"$/g, '');

        return NextResponse.json({ text });
    } catch (error) {
        console.error('AI Sidekick Error:', error);
        return NextResponse.json({ text: "The universe is a bit quiet right now. Keep going!" }, { status: 500 });
    }
}

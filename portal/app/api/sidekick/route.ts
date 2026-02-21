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

        const char = personalities[personality as keyof typeof personalities] || personalities.jax;

        let prompt = `${char.basePrompt}\n\n`;
        prompt += `CURRENT TIMESTAMP: ${new Date().toISOString()}-${Math.random()}\n`; // Force variety

        if (event === 'add_job') {
            prompt += `The user tracked ${context?.title} at ${context?.company}. React specifically to this.`;
        } else {
            prompt += `Generate a COMPLETELY NEW and UNIQUE piece of intelligence. 
      Do NOT repeat previous themes. Be creative. 
      Use one of these headers: [Tactical Intel, Command Center Update, Vibe Check, Strategic Brief, Sarcastic Reality, Zen Focus].`;
        }

        prompt += `\n\nReturn ONLY raw JSON: {"header": "...", "text": "..."}`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 1.0, // Maximum creativity
                topP: 0.95,
                topK: 40,
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text().trim();

        let data;
        try {
            const cleanedJson = rawText.replace(/```json|```/g, '').trim();
            data = JSON.parse(cleanedJson);
        } catch (e) {
            data = { header: 'Update', text: rawText };
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('AI Sidekick Error:', error);
        return NextResponse.json({ text: "The universe is a bit quiet right now. Keep going!" }, { status: 500 });
    }
}

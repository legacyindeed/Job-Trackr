'use client';

import { useState, useEffect } from 'react';

export type PersonalityType = 'serge' | 'luna' | 'jax';

interface SidekickProps {
    personality: PersonalityType;
    event?: string;
    onClose?: () => void;
}

const personalities = {
    serge: {
        name: 'Serge',
        title: 'The Drill Sergeant',
        avatar: '🎖️',
        color: 'bg-green-600',
        messages: {
            welcome: "EYES FRONT! I'm Sarge, and I'm here to turn you into a job-landing machine! No excuses, just results!",
            add_job: "ANOTHER ONE! You're building a fortress of opportunities! Keep firing those applications!",
            interview: "TARGET ACQUIRED! You're in! Prepare for extraction! Do your intel and win that room!",
            rejection: "SHAKE IT OFF! Rejection is just redirection to a better battlefield! Back to yours!",
            offer: "MISSION ACCOMPLISHED! VICTORY IS YOURS! Dismissed to your new office!",
            daily_mission: "DAILY MISSION: Send 3 high-impact follow-ups before lunch. MOVE IT!"
        }
    },
    jax: {
        name: 'Jax',
        title: 'The Sarcastic Best Friend',
        avatar: '🎸',
        color: 'bg-indigo-600',
        messages: {
            welcome: "Hey. I'm Jax. I'll be your emotional support human/hypeman while you deal with HR robots. Don't worry, I brought snacks.",
            add_job: "Nice. Another company to potentially ignore your emails for 3 weeks. Let's keep the streak going!",
            interview: "Oh look, a real human wants to talk to you! Try not to mention your obsession with keyboards. You got this, weirdo.",
            rejection: "Their loss. Plus, I heard their office coffee tastes like sad cardboard. Onwards!",
            offer: "They actually picked you? I mean—OF COURSE THEY DID! You're a legend. When's the party?",
            daily_mission: "DAILY MISSION: Update your LinkedIn without feeling like a sellout. You can do it."
        }
    },
    luna: {
        name: 'Luna',
        title: 'The Zen Master',
        avatar: '🌙',
        color: 'bg-teal-500',
        messages: {
            welcome: "Welcome, seeker. I am Luna. We will find your path together, one peaceful application at a time.",
            add_job: "A seed has been planted. Trust the process and remain centered as it grows.",
            interview: "Your energy has resonated. Walk into that space with peace and clarity. You are prepared.",
            rejection: "That door closed so a better one can open. Breathe. Your path remains clear.",
            offer: "The universe has answered your efforts. Celebrate this alignment of purpose and work.",
            daily_mission: "DAILY MISSION: Take 10 minutes to reflect on your strengths. You are more than your resume."
        }
    }
};

export function Sidekick({ personality, event, onClose }: SidekickProps) {
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const character = personalities[personality];

    useEffect(() => {
        if (event && character.messages[event as keyof typeof character.messages]) {
            setMessage(character.messages[event as keyof typeof character.messages]);
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [event, personality]);

    if (!isVisible && !event) return null;

    return (
        <div className={`fixed bottom-24 right-6 z-50 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 max-w-[280px] relative overflow-visible">
                {/* Pointer Arrow */}
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45"></div>

                <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${character.color} rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-lg animate-bounce`}>
                        {character.avatar}
                    </div>
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-none">{character.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-tighter">{character.title}</p>
                            </div>
                            <button onClick={() => setIsVisible(false)} className="text-slate-300 hover:text-slate-500 -mt-1 -mr-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed italic">
                            "{message}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SidekickSelector({ onSelect }: { onSelect: (p: PersonalityType) => void }) {
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-4xl w-full shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 heading-font mb-2">Choose Your Sidekick</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Pick the mentor that fits your vibe. You can change this later.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(Object.keys(personalities) as PersonalityType[]).map((key) => {
                        const p = personalities[key];
                        return (
                            <button
                                key={key}
                                onClick={() => onSelect(key)}
                                className="group relative bg-slate-50 hover:bg-white border-2 border-transparent hover:border-blue-500 p-8 rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 text-left"
                            >
                                <div className={`w-16 h-16 ${p.color} rounded-2xl flex items-center justify-center text-4xl shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                                    {p.avatar}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{p.name}</h3>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">{p.title}</p>
                                <p className="text-sm text-slate-500 leading-relaxed italic">"{p.messages.welcome}"</p>

                                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">Pick {p.name}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, fullName }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            localStorage.setItem('trackrToken', data.token);
            router.push('/');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-neutral-50 overflow-hidden flex flex-col lg:flex-row font-sans">
            {/* Left Side (Image & Overlay) */}
            <div className="relative w-full lg:w-[55%] h-64 lg:h-screen overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2574&auto=format&fit=crop" alt="Workspace" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-blue-900/40 to-transparent"></div>

                {/* Logo */}
                <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-blue-600 font-bold text-xl">T</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Trackr</span>
                </div>

                {/* Hero Text */}
                <div className="absolute bottom-8 left-8 right-8 lg:bottom-16 lg:left-12 lg:right-12 z-20 hidden lg:block">
                    <div className="max-w-xl">
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-8 tracking-tight">
                            Master your <span className="text-blue-400">career</span> journey.
                        </h1>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <p className="text-lg text-white/90 font-medium">Centralized dashboard for all applications</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <p className="text-lg text-white/90 font-medium">Automated follow-ups and tracking</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[45%] h-full flex flex-col items-center justify-center relative z-30 lg:h-screen lg:py-0 py-8 px-4">

                <div className="w-full max-w-[520px] lg:-ml-24 bg-white rounded-[2rem] p-8 lg:p-14 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative">

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Join the elite</h2>
                        <p className="text-gray-500 font-medium">Create your professional account in seconds.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="fullname" className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    id="fullname"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 flex items-center justify-between group mt-4 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="text-lg">{loading ? 'Creating Account...' : 'Get Started'}</span>
                            {!loading && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account?
                        </p>
                        <a href="#" className="text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors">Log in here</a>
                    </div>
                </div>

                <div className="absolute bottom-8 right-12 hidden lg:block">
                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
                        <div className="flex -space-x-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100" alt="User" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100" alt="User" />
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">+500</div>
                        </div>
                        <p className="text-xs font-bold text-gray-600">Active Trackr users</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

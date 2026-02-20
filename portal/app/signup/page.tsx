'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '../../lib/firebase';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const auth = getFirebaseAuth();
            if (!auth) throw new Error("Firebase configuration is missing.");
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const idToken = await user.getIdToken();
            await fetch('/api/user/onboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });

            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const auth = getFirebaseAuth();
            if (!auth) throw new Error("Firebase configuration is missing.");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            const idToken = await user.getIdToken();
            await fetch('/api/user/onboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });

            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-neutral-50 flex flex-col lg:flex-row font-sans selection:bg-blue-100 overflow-x-hidden">
            {/* Left Side: Background & Branding */}
            <div className="relative w-full lg:w-[55%] min-h-[400px] lg:h-screen overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2574&auto=format&fit=crop"
                    alt="Workspace"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/95 via-blue-900/40 to-transparent"></div>

                {/* Logo */}
                <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform">
                        <span className="text-white font-bold text-xl heading-font">T</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight heading-font">Trackr</span>
                </div>

                {/* Content */}
                <div className="absolute bottom-12 left-8 right-8 lg:bottom-16 lg:left-12 lg:right-12 z-20">
                    <div className="max-w-xl">
                        <h1 className="text-4xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-8 tracking-tight heading-font animate-in fade-in slide-in-from-bottom-4 duration-700">
                            Master your <span className="text-blue-400">career</span> journey.
                        </h1>

                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            <div className="flex items-start gap-5">
                                <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30 shadow-inner">
                                    <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl text-white font-bold leading-tight">Apply Once, Track Automatically</p>
                                    <p className="text-white/70 text-sm mt-1">Our browser extension captures every job you apply to instantly. No copy-pasting, no manual entry, ever.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30 shadow-inner">
                                    <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl text-white font-bold leading-tight">Visualize Your Future</p>
                                    <p className="text-white/70 text-sm mt-1">Turn application chaos into a professional Kanban pipeline.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30 shadow-inner">
                                    <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl text-white font-bold leading-tight">Know Where You Stand</p>
                                    <p className="text-white/70 text-sm mt-1">See your application-to-interview ratio and pipeline health at a glance.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30 shadow-inner">
                                    <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h10M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xl text-white font-bold leading-tight">Own Your Data</p>
                                    <p className="text-white/70 text-sm mt-1">Export your entire pipeline to a spreadsheet in one click.</p>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-[45%] lg:h-screen flex flex-col items-center justify-center relative z-30 p-4 lg:p-0">
                <div className="w-full max-w-[520px] lg:-ml-24 bg-white rounded-[2rem] p-8 lg:p-14 overlapping-card relative animate-in fade-in zoom-in duration-500">

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight heading-font">Join the elite</h2>
                        <p className="text-gray-500 font-medium">Create your professional account in seconds.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all duration-300"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all duration-300"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all duration-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-between group mt-4 shadow-xl shadow-slate-200 disabled:opacity-70 disabled:hover:bg-slate-900 active:scale-[0.98]"
                        >
                            <span className="text-lg">
                                {loading ? 'Creating Account...' : 'Get Started'}
                            </span>
                            {!loading && (
                                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-white px-4 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group shadow-sm disabled:opacity-70"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                            Already have an account?
                        </p>
                        <Link href="/login" className="text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors ml-2">Log in here</Link>
                    </div>
                </div>

                {/* Social Proof Container (Desktop Only) */}
                <div className="absolute bottom-8 right-12 hidden xl:block">
                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
                        <div className="flex -space-x-2">
                            <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100" alt="User" />
                            <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100" alt="User" />
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">+500</div>
                        </div>
                        <p className="text-xs font-bold text-gray-600">Active JobTrackr users</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

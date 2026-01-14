'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            if (res.ok) {
                router.push('/login');
            } else {
                const data = await res.json();
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#030303] selection:bg-purple-500/30 font-inter relative overflow-hidden">
            {/* High-Fidelity Ambient Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                {/* Primary Mesh Gradients - Inverted positions for variety */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse pointer-events-none"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-fuchsia-600/10 rounded-full blur-[160px] animate-pulse [animation-delay:1s] pointer-events-none"></div>

                {/* Grid & Texture Overlays */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_90%)]"></div>
            </div>

            <div className="relative w-full max-w-md px-4 animate-in fade-in zoom-in-95 duration-500">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-2xl opacity-50"></div>

                <div className="relative bg-[#0a0a0a]/90 border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden">
                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-50"></div>

                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6 text-2xl shadow-2xl">
                            🚀
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 font-medium">Join AIcademy and accelerate your career</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold text-center animate-in slide-in-from-top-2">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white font-medium placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.02] transition-all shadow-inner"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white font-medium placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.02] transition-all shadow-inner"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white font-medium placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.02] transition-all shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-50 mt-4 shadow-lg shadow-white/10"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Creating Account...' : 'Sign Up'} <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </button>
                    </form>

                    <div className="my-8 flex items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white font-bold hover:text-purple-400 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

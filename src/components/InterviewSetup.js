'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function InterviewSetup({ onStart }) {
    const [role, setRole] = useState('');
    const [experience, setExperience] = useState('Junior');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role.trim()) {
            onStart({ role, experience });
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-2xl opacity-50"></div>

                <div className="relative bg-[#0a0a0a]/90 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden">
                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-50"></div>

                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-3xl shadow-2xl">
                            🎙️
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-3 text-white tracking-tight">Interview Simulator</h2>
                        <p className="text-gray-500 font-medium">
                            Configure your session for realistic AI-driven technical interviews.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Role Input */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Target Role</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all text-lg font-medium"
                                autoFocus
                                required
                            />
                        </div>

                        {/* Experience Level */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Experience Level</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['Junior', 'Mid-Level', 'Senior'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setExperience(level)}
                                        className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-1 ${experience === level
                                            ? 'border-purple-500/50 bg-purple-500/10 shadow-xl scale-[1.02] text-white'
                                            : 'border-white/5 bg-white/5 hover:border-white/10 opacity-60 hover:opacity-100 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full mb-2 ${experience === level ? 'bg-purple-500' : 'bg-white/20'}`}></div>
                                        <span className="text-[11px] font-black uppercase tracking-widest">{level}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={!role.trim()}
                                className="group w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    START SESSION <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </button>

                            <Link href="/dashboard" className="text-center text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                                Cancel & Return to Dashboard
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

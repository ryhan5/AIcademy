'use client';
import { useState } from 'react';

import Link from 'next/link';

export default function InterviewSetup({ onStart }) {
    const [role, setRole] = useState('');
    const [stack, setStack] = useState('');
    const [experience, setExperience] = useState('Junior');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role.trim() && stack.trim()) {
            onStart({ role, stack, experience });
        }
    };

    return (
        <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] max-w-2xl w-full animate-fade-in border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"></div>

            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-6 text-4xl shadow-lg">
                    🎙️
                </div>
                <h2 className="text-4xl font-black mb-4 text-white">Mock Interview</h2>
                <p className="text-lg text-[var(--text-muted)]">
                    Practice technical questions tailored to your target role and experience.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Role Input */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-white ml-1 uppercase tracking-wider">Target Role</label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Frontend Developer, DevOps Engineer..."
                        className="w-full p-5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary)] focus:bg-black/30 transition-all text-lg shadow-inner"
                        required
                    />
                </div>

                {/* Tech Stack Input */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-white ml-1 uppercase tracking-wider">Tech Stack</label>
                    <input
                        type="text"
                        value={stack}
                        onChange={(e) => setStack(e.target.value)}
                        placeholder="e.g., React, Node.js, AWS..."
                        className="w-full p-5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary)] focus:bg-black/30 transition-all text-lg shadow-inner"
                        required
                    />
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-white ml-1 uppercase tracking-wider">Experience Level</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['Junior', 'Mid-Level', 'Senior'].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setExperience(level)}
                                className={`p-4 rounded-2xl border transition-all text-center relative overflow-hidden group ${experience === level
                                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="font-bold text-white relative z-10">{level}</div>
                                {experience === level && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-50"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!role.trim() || !stack.trim()}
                    className="w-full py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all relative overflow-hidden group mt-4"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>Start Interview</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </form>

            <div className="mt-8 text-center">
                <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-white transition-colors flex items-center justify-center gap-2">
                    <span>←</span> Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

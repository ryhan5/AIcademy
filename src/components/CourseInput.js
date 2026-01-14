'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CourseInput({ onSubmit }) {
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('standard');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (topic.trim()) {
            onSubmit({ topic: topic.trim(), duration });
        }
    };

    return (
        <div className="relative w-full animate-in fade-in zoom-in-95 duration-500">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-2xl opacity-50"></div>

            <div className="relative bg-[#0a0a0a]/90 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden">
                {/* Top Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-50"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-3xl shadow-2xl">
                        🧬
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black mb-3 text-white tracking-tight">
                        Generate Course
                    </h2>
                    <p className="text-gray-500 font-medium max-w-lg mx-auto">
                        AI-powered curriculum with chapters, videos, and quizzes tailored to your goal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Topic Input */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">What do you want to learn?</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Advanced React Patterns, System Design..."
                                className="w-full p-5 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white font-medium placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.02] transition-all text-lg shadow-inner relative z-10"
                                required
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-0 group-focus-within:opacity-20 blur-md transition-opacity duration-500 -z-10"></div>
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Course Depth</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { value: 'quick', label: '⚡ Quick', desc: '3-4 chapters' },
                                { value: 'standard', label: '📖 Standard', desc: '5-7 chapters' },
                                { value: 'comprehensive', label: '🎓 Deep Dive', desc: '8-10 chapters' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setDuration(opt.value)}
                                    className={`p-4 rounded-2xl border transition-all text-center relative overflow-hidden group ${duration === opt.value
                                        ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                                        }`}
                                >
                                    <div className={`font-black text-sm mb-1 relative z-10 ${duration === opt.value ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{opt.label}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide relative z-10">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={!topic.trim()}
                            className="group w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                                Generate Curriculum <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

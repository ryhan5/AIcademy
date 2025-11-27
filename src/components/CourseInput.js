'use client';
import { useState } from 'react';

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
        <div className="glass-panel p-10 rounded-3xl max-w-2xl w-full animate-fade-in border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"></div>

            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-3xl shadow-lg">
                    📚
                </div>
                <h2 className="text-4xl font-bold mb-3 text-white">Generate a Course</h2>
                <p className="text-[var(--text-muted)] text-lg">
                    AI-powered curriculum with chapters, videos, and quizzes.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Topic Input */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-white ml-1">What do you want to learn?</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Advanced React Patterns, Python for Finance..."
                            className="w-full p-5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary)] focus:bg-black/30 transition-all text-lg shadow-inner"
                            required
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-0 group-hover:opacity-10 -z-10 blur-md transition-opacity"></div>
                    </div>
                </div>

                {/* Duration Selection */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-white ml-1">Course Depth</label>
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
                                className={`p-4 rounded-xl border transition-all text-center relative overflow-hidden group ${duration === opt.value
                                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="font-bold text-white mb-1 relative z-10">{opt.label}</div>
                                <div className="text-xs text-[var(--text-muted)] relative z-10">{opt.desc}</div>
                                {duration === opt.value && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-50"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!topic.trim()}
                    className="w-full py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>Generate Course</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </form>
        </div>
    );
}

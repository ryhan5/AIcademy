'use client';
import { useState } from 'react';

export default function RoadmapInput({ onSubmit }) {
    const [goal, setGoal] = useState('');
    const [experience, setExperience] = useState('beginner');
    const [timeline, setTimeline] = useState('4');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (goal.trim()) {
            onSubmit({
                goal: goal.trim(),
                experience,
                timeline: parseInt(timeline)
            });
        }
    };

    return (
        <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] max-w-2xl w-full animate-fade-in border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"></div>

            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-6 text-4xl shadow-lg">
                    🗺️
                </div>
                <h2 className="text-4xl font-black mb-4 text-white">Create Your Roadmap</h2>
                <p className="text-lg text-[var(--text-muted)]">
                    Tell us your goals, and AI will blueprint your path to mastery.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Goal Input */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-white ml-1 uppercase tracking-wider">Target Skill</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g., React, Python, Machine Learning..."
                            className="w-full p-5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary)] focus:bg-black/30 transition-all text-lg shadow-inner"
                            required
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-0 group-hover:opacity-10 -z-10 blur-md transition-opacity"></div>
                    </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-white ml-1 uppercase tracking-wider">Current Level</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { value: 'beginner', label: '🌱 Beginner', desc: 'Starting out' },
                            { value: 'intermediate', label: '🚀 Intermediate', desc: 'Some experience' },
                            { value: 'advanced', label: '⚡ Advanced', desc: 'Expert level' }
                        ].map((level) => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setExperience(level.value)}
                                className={`p-4 rounded-2xl border transition-all text-center relative overflow-hidden group ${experience === level.value
                                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="font-bold text-white mb-1 relative z-10">{level.label}</div>
                                <div className="text-xs text-[var(--text-muted)] relative z-10">{level.desc}</div>
                                {experience === level.value && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-50"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="block text-sm font-bold text-white ml-1 uppercase tracking-wider">Timeline</label>
                        <span className="text-2xl font-black text-[var(--primary)]">{timeline} <span className="text-sm font-bold text-[var(--text-muted)]">Weeks</span></span>
                    </div>

                    <div className="relative h-12 flex items-center px-2">
                        <input
                            type="range"
                            min="1"
                            max="12"
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--primary)] relative z-10"
                        />
                        <div className="absolute left-0 right-0 h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full opacity-20 blur-sm"></div>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] px-1">
                        <span>1 Week</span>
                        <span>12 Weeks</span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!goal.trim()}
                    className="w-full py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all relative overflow-hidden group mt-4"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>Generate Roadmap</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </form>
        </div>
    );
}

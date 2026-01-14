import { useState } from 'react';
import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-2xl mx-auto"
        >
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-50"></div>

            <div className="relative bg-[#0a0a0a]/80 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 opacity-50"></div>

                <div className="text-center mb-10 relative z-10">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-3xl shadow-2xl"
                    >
                        🗺️
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-black mb-3 text-white tracking-tight">Create Your Path</h2>
                    <p className="text-gray-500 font-medium">
                        AI will blueprint your journey to engineering mastery.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Goal Input */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Target Skill</label>
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g., Fullstack React, AI Engineering..."
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all text-lg font-medium"
                            required
                        />
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Current Level</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { value: 'beginner', label: 'Beginner', icon: '🌱' },
                                { value: 'intermediate', label: 'Intermediate', icon: '🚀' },
                                { value: 'advanced', label: 'Advanced', icon: '⚡' }
                            ].map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setExperience(level.value)}
                                    className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-1 ${experience === level.value
                                        ? 'border-white/20 bg-white/10 shadow-xl scale-[1.02]'
                                        : 'border-white/5 bg-white/5 hover:border-white/10 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <span className="text-xl mb-1">{level.icon}</span>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white">{level.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">Timeline</label>
                            <span className="text-xl font-black text-white tracking-tighter">{timeline} <span className="text-[10px] opacity-30">WEEKS</span></span>
                        </div>

                        <div className="relative h-8 flex items-center">
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={timeline}
                                onChange={(e) => setTimeline(e.target.value)}
                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!goal.trim()}
                        className="group w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-50"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            GENERATE ROADMAP <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

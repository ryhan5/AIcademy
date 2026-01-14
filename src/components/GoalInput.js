'use client';
import { useState } from 'react';

export default function GoalInput({
    onSubmit,
    label = "What's your career goal?",
    description = 'e.g., "Become a MERN Stack Developer", "Data Scientist", "UI/UX Designer"',
    placeholder = "Enter your dream role...",
    buttonText = "Start Assessment"
}) {
    const [goal, setGoal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (goal.trim()) {
            onSubmit(goal);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-xl mx-auto">
            <div className="space-y-3">
                <label className="block text-[10px] font-black text-white/40 ml-1 uppercase tracking-[0.2em]">{label}</label>
                <div className="relative group">
                    <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-5 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white font-medium placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.02] transition-all text-lg shadow-inner relative z-10 text-center"
                        required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-0 group-focus-within:opacity-20 blur-md transition-opacity duration-500 -z-10"></div>
                </div>
            </div>

            <button
                type="submit"
                disabled={!goal.trim()}
                className="group w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-50"
            >
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                    {buttonText} <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </button>
        </form>
    );
}

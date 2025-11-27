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
            <div className="relative group">
                <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-6 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary)] focus:bg-black/30 transition-all text-xl shadow-inner text-center"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-0 group-hover:opacity-10 -z-10 blur-md transition-opacity"></div>
            </div>

            <button
                type="submit"
                disabled={!goal.trim()}
                className="w-full py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all relative overflow-hidden group"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>{buttonText}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
        </form>
    );
}

'use client';
import { useState, useEffect } from 'react';
import { markModuleComplete, isModuleComplete, XP_REWARDS } from '../utils/UserProgress';
import XPNotification from './XPNotification';

import Link from 'next/link';

export default function RoadmapView({ goal, experience = 'beginner', timeline = 4 }) {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [xpNotification, setXpNotification] = useState(null);

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const response = await fetch('/api/generate-roadmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        goal,
                        experience,
                        timeline,
                        assessment: null
                    }),
                });

                if (!response.ok) throw new Error('Failed to generate roadmap');

                const data = await response.json();
                setRoadmap(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [goal, experience, timeline]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 animate-fade-in min-h-[50vh]">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-[var(--primary)]/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin-reverse opacity-70"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Crafting Your Journey</h3>
                <p className="text-lg text-[var(--text-muted)]">AI is mapping out the best path to master <span className="text-[var(--primary)]">{goal}</span>...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel p-12 rounded-3xl max-w-2xl w-full text-center animate-fade-in border border-red-500/20 shadow-2xl bg-red-500/5 mx-auto">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-red-500/20">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-2">Roadmap Generation Failed</h3>
                <p className="text-red-200/80 mb-8 max-w-md mx-auto">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all font-bold text-white border border-white/10"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const handleMarkComplete = (weekNumber) => {
        const moduleId = `week-${weekNumber}`;
        const reward = markModuleComplete(moduleId, goal);

        if (reward) {
            setXpNotification({ xp: reward.xpGained, reason: reward.reason });
            // Force re-render
            setRoadmap({ ...roadmap });
        }
    };

    return (
        <>
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            <div className="w-full max-w-5xl animate-fade-in pb-20">
                <div className="text-center mb-16">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white mb-8 transition-colors">
                        <span>←</span> Back to Dashboard
                    </Link>
                    <div className="block">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-3xl shadow-lg">
                            🗺️
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">{goal}</span></h2>
                    <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
                        A personalized {timeline}-week curriculum tailored to your {experience} level.
                    </p>
                </div>

                <div className="relative border-l-2 border-white/10 ml-4 md:ml-0 md:pl-12 space-y-16">
                    {roadmap?.weeks?.map((week, i) => {
                        const isComplete = isModuleComplete(`week-${week.week}`, goal);

                        return (
                            <div key={i} className="relative pl-8 md:pl-0 group">
                                {/* Timeline Dot */}
                                <div className={`absolute left-[-9px] top-0 w-5 h-5 rounded-full border-4 border-[var(--bg-dark)] transition-all duration-500 md:left-[-42px] z-10 ${isComplete
                                    ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-110'
                                    : 'bg-[var(--primary)] shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                                    }`}></div>

                                {/* Connector Line Highlight */}
                                <div className={`absolute left-[-8px] top-5 bottom-[-64px] w-0.5 md:left-[-41px] transition-all duration-1000 ${isComplete ? 'bg-gradient-to-b from-green-500 to-[var(--primary)] opacity-50' : 'bg-transparent'
                                    }`}></div>

                                <div className={`glass-panel p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden ${isComplete
                                    ? 'border-green-500/30 bg-green-500/5'
                                    : 'border-white/10 hover:border-[var(--primary)]/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]'
                                    }`}>
                                    {/* Card Background Glow */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Week {week.week}</div>
                                            <h3 className="text-2xl font-bold text-white group-hover:text-[var(--primary)] transition-colors">
                                                {week.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                                            {isComplete ? (
                                                <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-sm flex items-center gap-2">
                                                    <span>✓</span> Completed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkComplete(week.week)}
                                                    className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 shadow-lg shadow-[var(--primary)]/20"
                                                >
                                                    Complete (+{XP_REWARDS.WEEK_COMPLETE} XP)
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--text-muted)] mb-4 uppercase tracking-wider flex items-center gap-2">
                                                <span>🎯</span> Key Topics
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {week.topics.map((topic, j) => (
                                                    <span key={j} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/90 border border-white/5 transition-colors cursor-default">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--text-muted)] mb-4 uppercase tracking-wider flex items-center gap-2">
                                                <span>📚</span> Resources
                                            </h4>
                                            <div className="space-y-2">
                                                {week.resources.map((res, k) => (
                                                    <a
                                                        key={k}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[var(--secondary)]/30 transition-all group/link"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-lg group-hover/link:scale-110 transition-transform">
                                                            {res.type === 'Video' ? '📺' : '📄'}
                                                        </div>
                                                        <span className="text-sm text-white/80 group-hover/link:text-white truncate flex-1">
                                                            {res.title}
                                                        </span>
                                                        <span className="text-[var(--text-muted)] opacity-0 group-hover/link:opacity-100 transition-opacity">↗</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

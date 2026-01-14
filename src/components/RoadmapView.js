'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { markModuleComplete, isModuleComplete } from '../utils/UserProgress';
import XPNotification from './XPNotification';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoadmapView({ goal, experience = 'beginner', timeline = 4 }) {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [xpNotification, setXpNotification] = useState(null);
    const [expandedWeek, setExpandedWeek] = useState(null);

    const router = useRouter();

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
                // Expand the first week by default
                if (data.weeks && data.weeks.length > 0) {
                    setExpandedWeek(data.weeks[0].week);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [goal, experience, timeline]);

    const handleTopicClick = (topic) => {
        if (confirm(`🎓 Want to generate a full course for "${topic}"?`)) {
            router.push(`/course?topic=${encodeURIComponent(topic)}`);
        }
    };

    const toggleWeek = (weekNum) => {
        setExpandedWeek(expandedWeek === weekNum ? null : weekNum);
    };

    const handleMarkComplete = (weekId, e) => {
        e.stopPropagation(); // Prevent toggling accordion
        if (!isModuleComplete(weekId, goal)) {
            const reward = markModuleComplete(weekId, goal);
            if (reward) {
                setXpNotification({ xp: reward.xpGained, reason: reward.reason });
                // Force re-render to show checkmark (in a real app, use better state management)
                setRoadmap({ ...roadmap });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[60vh]">
                <div className="relative w-20 h-20 mb-10">
                    <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-2 border-white/10 border-b-transparent rounded-full animate-spin-slow"></div>
                </div>
                <h3 className="text-xl font-black text-white tracking-widest uppercase">Mapping Your Future</h3>
                <p className="mt-2 text-gray-500 font-medium">Synthesizing personalized curriculum...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 text-red-400">
                <p>Failed to generate roadmap: {error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-white underline">Try Again</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto pb-20">
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            {/* Header info */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Roadmap</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                    {goal}
                </h1>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 uppercase tracking-wide text-xs font-bold">{experience}</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 uppercase tracking-wide text-xs font-bold">{timeline} Weeks</span>
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-8 md:pl-0">
                {/* Central Line (Desktop) */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-x-1/2"></div>

                {/* Left Line (Mobile) */}
                <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                <div className="flex flex-col gap-12">
                    {roadmap?.weeks.map((week, index) => {
                        const weekId = `week-${week.week}`;
                        const isComplete = isModuleComplete(weekId, goal);
                        const isExpanded = expandedWeek === week.week;
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={week.week}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex items-center md:justify-between ${!isEven ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-black border-2 border-white/20 rounded-full -translate-x-1/2 z-10 flex items-center justify-center">
                                    {isComplete && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                                </div>

                                {/* Content Card */}
                                <div className={`w-full md:w-[45%] ml-12 md:ml-0 group`}>
                                    <div
                                        onClick={() => toggleWeek(week.week)}
                                        className={`
                                            cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300
                                            ${isComplete
                                                ? 'bg-emerald-900/10 border-emerald-500/30 hover:border-emerald-500/50'
                                                : isExpanded
                                                    ? 'bg-white/10 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }
                                        `}
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`
                                                        text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded
                                                        ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'}
                                                    `}>
                                                        Week {week.week}
                                                    </span>
                                                    {isComplete && (
                                                        <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`text-xl font-bold ${isComplete ? 'text-white' : 'text-white/90'}`}>
                                                    {week.title}
                                                </h3>
                                            </div>

                                            {/* Action Button (Complete or Expand) */}
                                            <div className="flex items-center gap-2">
                                                {!isComplete && (
                                                    <button
                                                        onClick={(e) => handleMarkComplete(weekId, e)}
                                                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                                                        title="Mark as Complete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    </button>
                                                )}
                                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-white/50`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content (Topics) */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                >
                                                    <div className="px-6 pb-6 pt-0 border-t border-white/5 space-y-3">
                                                        <p className="text-sm text-gray-400 mt-4 mb-4 italic">Select a topic to start learning:</p>
                                                        {week.topics.map((topic, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTopicClick(topic);
                                                                }}
                                                                className="group/topic flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"
                                                            >
                                                                <span className="text-sm font-medium text-gray-300 group-hover/topic:text-white transition-colors">
                                                                    {topic}
                                                                </span>
                                                                <span className="opacity-0 group-hover/topic:opacity-100 transition-opacity text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-lg shadow-blue-600/20">
                                                                    Start →
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-20 flex justify-center">
                <Link href="/dashboard" className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 font-bold tracking-wide transition-all">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}


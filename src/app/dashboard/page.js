'use client';
import { useEffect, useState } from 'react';
import { getUserProgress, getLeaderboardData, checkDailyLogin, verifyUser, isUserVerified } from '@/utils/UserProgress';
import ProgressDashboard from '@/components/ProgressDashboard';
import Leaderboard from '@/components/Leaderboard';
import Link from 'next/link';

export default function Dashboard() {
    const [userProgress, setUserProgress] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isVerified, setIsVerified] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Load initial data
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserProgress(getUserProgress());
        setLeaderboard(getLeaderboardData());
        setIsVerified(isUserVerified());

        // Check for daily login
        const loginReward = checkDailyLogin();
        if (loginReward) {
            // In a real app, show a modal or toast here
            console.log('Daily login reward:', loginReward);
            // Refresh progress
            setUserProgress(getUserProgress());
        }
    }, []);

    const handleVerify = () => {
        if (verifyUser()) {
            setIsVerified(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    };

    const quickActions = [
        { title: 'Resume Learning', icon: '▶️', link: '/course', color: 'from-blue-500 to-cyan-500' },
        { title: 'Take a Quiz', icon: '📝', link: '/quiz', color: 'from-purple-500 to-pink-500' },
        { title: 'Update Roadmap', icon: '🗺️', link: '/roadmap', color: 'from-orange-500 to-red-500' },
        { title: 'Mock Interview', icon: '🎙️', link: '/interview', color: 'from-emerald-500 to-teal-500' }
    ];

    const momentumTips = [
        "🔥 You're on a 3-day streak! Keep it up to earn a badge.",
        "💡 Try a 'System Design' quiz to boost your backend skills.",
        "👀 5 recruiters viewed your profile this week."
    ];

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-8 relative overflow-hidden bg-[var(--bg-dark)]">
            {/* Confetti Animation (Simple CSS implementation) */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="text-6xl animate-bounce">🎉</div>
                </div>
            )}

            {/* Dynamic Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--primary)] rounded-full blur-[150px] opacity-10 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--secondary)] rounded-full blur-[150px] opacity-10 animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Progress & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="animate-fade-in">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Builder 👋</h1>
                        <p className="text-[var(--text-muted)]">Here&apos;s your progress overview for today.</p>
                    </div>

                    {userProgress && <ProgressDashboard progress={userProgress} />}

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.title}
                                href={action.link}
                                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 group relative overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{action.title}</h3>
                                        <p className="text-xs text-[var(--text-muted)]">Continue where you left off</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Capstone Project / Verification Card */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    {isVerified ? '✅ AIcademy Verified' : '🎓 Capstone Project'}
                                </h3>
                                <p className="text-[var(--text-muted)] max-w-md">
                                    {isVerified
                                        ? "You have successfully verified your skills. Your profile is now highlighted to recruiters."
                                        : "Complete a final project to earn the 'AIcademy Verified' badge and boost your visibility."}
                                </p>
                            </div>
                            {!isVerified ? (
                                <button
                                    onClick={handleVerify}
                                    className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-white/10 whitespace-nowrap"
                                >
                                    Submit Project
                                </button>
                            ) : (
                                <div className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 font-bold rounded-xl flex items-center gap-2">
                                    <span>Verified</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard & Tips */}
                <div className="space-y-8">
                    <Leaderboard leaderboard={leaderboard} currentUserXP={userProgress?.xp || 0} />

                    <div className="glass-panel p-6 rounded-3xl border border-white/5">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span>🚀</span> Momentum Tips
                        </h3>
                        <div className="space-y-4">
                            {momentumTips.map((tip, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-[var(--text-muted)]">
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

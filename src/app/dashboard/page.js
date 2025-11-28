'use client';
import { useEffect, useState } from 'react';
import { getUserProgress, getLeaderboardData, checkDailyLogin, verifyUser, isUserVerified } from '@/utils/UserProgress';
import ProgressDashboard from '@/components/ProgressDashboard';
import Leaderboard from '@/components/Leaderboard';
import Link from 'next/link';

export default function Dashboard() {
    const [userProgress, setUserProgress] = useState(null);
    const [leaderboard, setLeaderboard] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Load initial data
        setUserProgress(getUserProgress());
        setLeaderboard(getLeaderboardData());
        setIsVerified(isUserVerified());

        // Check for daily login
        const loginReward = checkDailyLogin();
        if (loginReward) {
            console.log('Daily login reward:', loginReward);
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
        { title: 'Resume Learning', icon: '▶️', link: '/course', color: 'from-blue-500 to-cyan-500', desc: 'Jump back in' },
        { title: 'Take a Quiz', icon: '📝', link: '/quiz', color: 'from-purple-500 to-pink-500', desc: 'Test skills' },
        { title: 'Update Roadmap', icon: '🗺️', link: '/roadmap', color: 'from-orange-500 to-red-500', desc: 'Plan ahead' },
        { title: 'Mock Interview', icon: '🎙️', link: '/interview', color: 'from-emerald-500 to-teal-500', desc: 'Practice now' }
    ];

    const momentumTips = [
        "🔥 You're on a 3-day streak! Keep it up to earn a badge.",
        "💡 Try a 'System Design' quiz to boost your backend skills.",
        "👀 5 recruiters viewed your profile this week."
    ];

    return (
        <main className="min-h-screen pt-28 pb-12 px-6 lg:px-8 relative overflow-hidden bg-[#0a0a0a]">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="text-6xl animate-bounce">🎉</div>
                </div>
            )}

            {/* Ambient Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--primary)] rounded-full blur-[150px] opacity-10 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--secondary)] rounded-full blur-[150px] opacity-10 animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="mb-10 animate-fade-in">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Command Center</h1>
                    <p className="text-[var(--text-muted)] text-lg">Welcome back, Builder. Ready to ship?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Progress Command Center */}
                        {userProgress && <ProgressDashboard progress={userProgress} />}

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.title}
                                    href={action.link}
                                    className="group relative bg-[#0a0a0a]/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                            {action.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{action.title}</h3>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mt-1">{action.desc}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Capstone Project / Verification Card */}
                        <div className="relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 rounded-3xl border border-white/10 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                        {isVerified ? '✅ AIcademy Verified' : '🎓 Capstone Project'}
                                    </h3>
                                    <p className="text-[var(--text-muted)] max-w-md leading-relaxed">
                                        {isVerified
                                            ? "You have successfully verified your skills. Your profile is now highlighted to recruiters."
                                            : "Complete a final project to earn the 'AIcademy Verified' badge and boost your visibility."}
                                    </p>
                                </div>
                                {!isVerified ? (
                                    <button
                                        onClick={handleVerify}
                                        className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-white/10 whitespace-nowrap"
                                    >
                                        Submit Project
                                    </button>
                                ) : (
                                    <div className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 font-bold rounded-xl flex items-center gap-2">
                                        <span>Verified Developer</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Leaderboard leaderboard={leaderboard} currentUserXP={userProgress?.xp || 0} />

                        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <span>🚀</span> Momentum Tips
                            </h3>
                            <div className="space-y-3">
                                {momentumTips.map((tip, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-[var(--text-muted)] hover:bg-white/10 transition-colors">
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

'use client';
import { useState, useEffect } from 'react';
import { getUserProgress, calculateLevel, checkDailyLogin } from '../utils/UserProgress';

export default function ProgressDashboard() {
    const [progress, setProgress] = useState(null);
    const [loginReward, setLoginReward] = useState(null);

    useEffect(() => {
        // Check daily login on mount
        const reward = checkDailyLogin();
        if (reward.xpAwarded > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoginReward(reward);
        }

        // Load user progress
        const userProgress = getUserProgress();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(userProgress);
    }, []);

    if (!progress) return null;

    const { level, xpInCurrentLevel, xpForNextLevel } = calculateLevel(progress.xp);
    const progressPercent = (xpInCurrentLevel / xpForNextLevel) * 100;

    return (
        <div className="glass-panel p-8 rounded-3xl animate-fade-in border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[var(--primary)]/20 transition-colors duration-500"></div>

            {/* Daily Login Notification */}
            {loginReward && loginReward.xpAwarded > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl animate-slide-in flex items-center gap-3">
                    <div className="text-2xl">🎉</div>
                    <div>
                        <p className="text-green-400 font-bold">Daily Bonus Unlocked!</p>
                        <p className="text-sm text-green-300/80">
                            +{loginReward.xpAwarded} XP {loginReward.bonusAwarded && '• Streak Bonus Applied 🔥'}
                        </p>
                    </div>
                </div>
            )}

            {/* Header with Level and Streak */}
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Your Progress</h2>
                    <p className="text-[var(--text-muted)]">Keep the momentum going!</p>
                </div>

                {/* Streak Counter */}
                <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <span className="text-xl">{progress.streak > 0 ? '🔥' : '❄️'}</span>
                        <span className="text-2xl font-black text-white">{progress.streak}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Days</span>
                    </div>
                </div>
            </div>

            {/* Level and XP Progress */}
            <div className="mb-8 relative z-10">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <span className="text-4xl font-black text-white">Lvl {level}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-[var(--primary)]">{Math.round(progressPercent)}%</span>
                        <span className="text-sm text-[var(--text-muted)] ml-2">to Level {level + 1}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] transition-all duration-1000 ease-out relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                    </div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-muted)] text-right">
                    {xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 relative z-10">
                <div className="text-center p-4 glass-card rounded-2xl hover:bg-white/5 transition-colors">
                    <div className="text-2xl mb-1">✨</div>
                    <p className="text-xl font-bold text-white">{progress.xp.toLocaleString()}</p>
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Total XP</p>
                </div>

                <div className="text-center p-4 glass-card rounded-2xl hover:bg-white/5 transition-colors">
                    <div className="text-2xl mb-1">📚</div>
                    <p className="text-xl font-bold text-white">{progress.completedModules.length}</p>
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Modules</p>
                </div>

                <div className="text-center p-4 glass-card rounded-2xl hover:bg-white/5 transition-colors">
                    <div className="text-2xl mb-1">🚀</div>
                    <p className="text-xl font-bold text-white">{progress.completedRoadmaps.length}</p>
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Roadmaps</p>
                </div>
            </div>

            {/* Motivational Message */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-white/5 rounded-2xl relative z-10">
                <p className="text-sm text-center font-medium text-white/90">
                    {progress.streak >= 7 ? (
                        "🌟 Unstoppable! You're crushing your goals!"
                    ) : progress.streak >= 3 ? (
                        "💪 Consistency is key. You're doing great!"
                    ) : (
                        "🚀 Every expert was once a beginner. Keep going!"
                    )}
                </p>
            </div>
        </div>
    );
}

'use client';
import { useState, useEffect } from 'react';
import { getLeaderboardData } from '../utils/UserProgress';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState(null);

    useEffect(() => {
        const data = getLeaderboardData();
        setLeaderboard(data);
    }, []);

    if (!leaderboard) return null;

    const { topUsers, userRank } = leaderboard;

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    return (
        <div className="glass-panel p-8 rounded-3xl animate-fade-in border border-white/10 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">🏆 Leaderboard</h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Top learners this week</p>
                </div>
                <div className="px-4 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full">
                    <span className="text-sm text-[var(--text-muted)]">
                        Rank: <span className="font-bold text-[var(--primary)]">#{userRank}</span>
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {topUsers.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.username === 'You';
                    const medal = getMedalEmoji(rank);

                    return (
                        <div
                            key={user.userId}
                            className={`p-4 rounded-2xl transition-all flex items-center gap-4 ${isCurrentUser
                                ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/50 shadow-[0_0_20px_rgba(124,58,237,0.1)]'
                                : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${rank <= 3 ? 'bg-white/10 text-2xl' : 'text-[var(--text-muted)]'
                                }`}>
                                {medal || rank}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className={`font-bold ${isCurrentUser ? 'text-white' : 'text-white/90'}`}>
                                        {user.username}
                                    </p>
                                    {isCurrentUser && <span className="text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">YOU</span>}
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">Level {user.level}</p>
                            </div>

                            <div className="text-right">
                                <p className="font-bold text-[var(--accent)]">{user.xp.toLocaleString()}</p>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">XP</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-xs text-center text-blue-200/80 leading-relaxed">
                    💡 <span className="font-bold text-blue-200">Pro Tip:</span> Complete daily challenges and maintain your streak to climb the ranks faster!
                </p>
            </div>
        </div>
    );
}

'use client';
import { useState, useEffect } from 'react';
import { getLeaderboardData } from '../utils/UserProgress';

export default function Leaderboard({ leaderboard: initialData, currentUserXP }) {
    const [leaderboard, setLeaderboard] = useState(initialData || null);

    useEffect(() => {
        if (!initialData) {
            setLeaderboard(getLeaderboardData());
        }
    }, [initialData]);

    if (!leaderboard || !leaderboard.topUsers) return null;

    const { topUsers, userRank } = leaderboard;

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    return (
        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-6 rounded-3xl animate-fade-in border border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">🏆 Leaderboard</h2>
                    <p className="text-[var(--text-muted)] text-xs mt-1">Top learners this week</p>
                </div>
                <div className="px-3 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full">
                    <span className="text-xs text-[var(--text-muted)]">
                        Rank: <span className="font-bold text-[var(--primary)]">#{userRank}</span>
                    </span>
                </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {topUsers.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.username === 'You';
                    const medal = getMedalEmoji(rank);

                    return (
                        <div
                            key={user.userId}
                            className={`p-3 rounded-xl transition-all flex items-center gap-3 ${isCurrentUser
                                ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                                : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${rank <= 3 ? 'bg-white/10 text-lg' : 'text-[var(--text-muted)]'
                                }`}>
                                {medal || rank}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className={`font-bold text-sm truncate ${isCurrentUser ? 'text-white' : 'text-white/90'}`}>
                                        {user.username}
                                    </p>
                                    {isCurrentUser && <span className="text-[9px] bg-[var(--primary)] text-white px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)]">Level {user.level}</p>
                            </div>

                            <div className="text-right">
                                <p className="font-bold text-sm text-[var(--accent)]">{user.xp.toLocaleString()}</p>
                                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">XP</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

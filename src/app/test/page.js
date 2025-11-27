'use client';
import { useEffect, useState } from 'react';
import { getUserProgress, awardXP, checkDailyLogin, XP_REWARDS } from '../../utils/UserProgress';

export default function TestPage() {
    const [progress, setProgress] = useState(null);
    const [log, setLog] = useState([]);

    const addLog = (message) => {
        setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        addLog("Page loaded");
        const prog = getUserProgress();
        setProgress(prog);
        addLog(`Initial progress loaded: ${JSON.stringify(prog)}`);
    }, []);

    const handleAwardXP = () => {
        const result = awardXP(50, "Test award");
        addLog(`Awarded 50 XP. New total: ${result.newXP}`);
        setProgress(getUserProgress());
    };

    const handleDailyLogin = () => {
        const result = checkDailyLogin();
        addLog(`Daily login checked. Streak: ${result.currentStreak}, XP: ${result.xpAwarded}`);
        setProgress(getUserProgress());
    };

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">Gamification Test Page</h1>

            {progress && (
                <div className="glass-panel p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-bold mb-4">Current Progress</h2>
                    <p>XP: {progress.xp}</p>
                    <p>Level: {progress.level}</p>
                    <p>Streak: {progress.streak}</p>
                    <p>Completed Modules: {progress.completedModules.length}</p>
                    <p>Last Login: {progress.lastLoginDate || 'Never'}</p>
                </div>
            )}

            <div className="glass-panel p-6 rounded-lg mb-6">
                <h2 className="text-2xl font-bold mb-4">Test Actions</h2>
                <div className="flex gap-4">
                    <button
                        onClick={handleAwardXP}
                        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Award 50 XP
                    </button>
                    <button
                        onClick={handleDailyLogin}
                        className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
                    >
                        Check Daily Login
                    </button>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
                <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
                    {log.map((entry, i) => (
                        <div key={i} className="text-green-400">{entry}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

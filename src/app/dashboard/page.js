'use client';
import { useEffect, useState } from 'react';
import { getUserProgress, getLeaderboardData, checkDailyLogin, verifyUser, isUserVerified } from '@/utils/UserProgress';
import ProgressDashboard from '@/components/ProgressDashboard';
import Leaderboard from '@/components/Leaderboard';
import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [userProgress, setUserProgress] = useState(null);
    const [leaderboard, setLeaderboard] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Portfolio State
    const [skills, setSkills] = useState([
        { subject: 'Frontend', A: 50, fullMark: 150 },
        { subject: 'Backend', A: 30, fullMark: 150 },
        { subject: 'Design', A: 20, fullMark: 150 },
        { subject: 'DevOps', A: 10, fullMark: 150 },
        { subject: 'AI/ML', A: 10, fullMark: 150 },
        { subject: 'Mobile', A: 10, fullMark: 150 },
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [portfolioProjects, setPortfolioProjects] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user-profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.skills && data.skills.length > 0) {
                        const mappedSkills = data.skills.map(s => ({
                            subject: s.subject,
                            A: s.score,
                            fullMark: 150
                        }));
                        setSkills(mappedSkills);
                    }
                    if (data.portfolioProjects) {
                        setPortfolioProjects(data.portfolioProjects);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, []);

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

    const handleSlide = (index, value) => {
        const newSkills = skills.map((skill, i) => {
            if (i === index) {
                return { ...skill, A: parseInt(value) };
            }
            return skill;
        });
        setSkills(newSkills);
    };

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
        <main className="min-h-screen pt-28 pb-12 px-6 lg:px-8 relative overflow-hidden bg-[#030303] selection:bg-purple-500/30 font-inter">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="text-6xl animate-bounce">🎉</div>
                </div>
            )}

            {/* Premium Mesh Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

                {/* Visual Density Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">

                    {isVerified && (
                        <div className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-right shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <span>✓ Verified Developer</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
                    {/* Row 1: Quick Actions (Full Width) */}
                    <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.title}
                                href={action.link}
                                className="group relative bg-[#0a0a0a]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 overflow-hidden shadow-xl"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md pb-2">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm tracking-tight">{action.title}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">{action.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Row 2: Progress (8) + Momentum (4) */}
                    <div className="md:col-span-8 bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent"></div>
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-black text-white text-lg flex items-center gap-2">Stats Overview</h3>
                        </div>
                        <div className="relative z-10">
                            {userProgress ? <ProgressDashboard progress={userProgress} /> : <div className="h-40 animate-pulse bg-white/5 rounded-xl"></div>}
                        </div>
                    </div>

                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-transparent"></div>
                            <h3 className="font-black text-white mb-6 flex items-center gap-2 text-lg">
                                <span>🚀</span> Momentum Tips
                            </h3>
                            <div className="space-y-3">
                                {momentumTips.map((tip, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors">
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Skills (6) + Projects (6) */}
                    <div className="md:col-span-6 bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-transparent"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="font-black text-white flex items-center gap-2 text-lg">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                                Skill Matrix
                            </h3>
                            <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-gray-400 hover:text-white">
                                {isEditing ? 'Done' : 'Edit Skills'}
                            </button>
                        </div>

                        <div className="flex-1 min-h-[300px] flex items-center justify-center relative z-10 w-full h-full">
                            <div className="w-full h-full absolute inset-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                                        <PolarGrid stroke="#333" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                        <Radar name="Skills" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl p-6 rounded-3xl flex flex-col gap-3 overflow-y-auto animate-in fade-in border border-white/10">
                                    {skills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs font-medium">
                                            <span className="text-gray-300 w-16 font-bold">{skill.subject}</span>
                                            <input
                                                type="range" min="0" max="150" value={skill.A}
                                                onChange={(e) => handleSlide(idx, e.target.value)}
                                                className="flex-1 mx-3 accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-gray-500 w-8 text-right font-mono">{Math.round((skill.A / 150) * 100)}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-6 bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-transparent"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="font-black text-white flex items-center gap-2 text-lg">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                                Unlocked Projects
                            </h3>
                            <Link href="/side-project" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">View All →</Link>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2 relative z-10">
                            {portfolioProjects.length > 0 ? (
                                portfolioProjects.map((project, idx) => (
                                    <div key={idx} className="group relative p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer hover:bg-white/10 overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${project.color} rounded-l-2xl opacity-70`}></div>
                                        <div className="pl-3 relative z-10">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors flex items-center gap-2">
                                                    {project.title}
                                                    {project.progress === 100 && (
                                                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-black">
                                                            Done
                                                        </span>
                                                    )}
                                                </h4>
                                                <div className="flex gap-1">
                                                    {project.tags.slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[9px] bg-black/40 px-2 py-1 rounded-md text-gray-400 border border-white/5 font-bold uppercase tracking-wide">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 font-medium leading-relaxed mb-3">{project.desc}</p>

                                            {/* Progress Bar */}
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex items-center">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${project.progress === 100 ? 'bg-emerald-500' : `bg-gradient-to-r ${project.color}`}`}
                                                    style={{ width: `${project.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-1 text-[10px] text-gray-500 font-bold text-right">
                                                {project.progress || 0}% Complete
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                                    <span className="text-4xl mb-4 grayscale opacity-30">🔒</span>
                                    <p className="text-gray-500 text-sm font-medium">Complete courses to unlock projects.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 4: Leaderboard (8) + Verification (4) */}
                    <div className="md:col-span-8">
                        <Leaderboard leaderboard={leaderboard} currentUserXP={userProgress?.xp || 0} />
                    </div>

                    <div className="md:col-span-4">
                        {/* Capstone Project / Verification Card */}
                        <div className="h-full relative bg-gradient-to-br from-blue-900/10 to-purple-900/10 p-8 rounded-[2.5rem] border border-white/10 overflow-hidden group flex flex-col justify-center text-center">
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>

                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl shadow-purple-500/20">
                                    🎓
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                                    {isVerified ? 'AIcademy Verified' : 'Capstone Project'}
                                </h3>
                                <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
                                    {isVerified
                                        ? "Your profile is highlighted to top recruiters."
                                        : "Complete the final challenge to earn your verification badge."}
                                </p>
                                {!isVerified && (
                                    <button
                                        onClick={handleVerify}
                                        className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl shadow-white/10"
                                    >
                                        Start Project
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

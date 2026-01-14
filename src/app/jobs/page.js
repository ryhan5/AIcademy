'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import JobCard from '@/components/JobCard';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Job Data
const JOBS = [
    {
        id: 1,
        role: "Frontend Engineer",
        company: "Vercel",
        location: "Remote",
        salary: "$120k - $160k",
        logo: "▲",
        tags: ["React", "Next.js", "Tailwind", "Frontend"],
        requirements: ["Frontend", "React", "Next.js", "Design"],
        category: "Frontend"
    },
    {
        id: 2,
        role: "AI Engineer",
        company: "OpenAI",
        location: "San Francisco",
        salary: "$180k - $250k",
        logo: "🤖",
        tags: ["Python", "PyTorch", "LLMs", "AI/ML"],
        requirements: ["AI/ML", "Python", "Backend"],
        category: "AI/ML"
    },
    {
        id: 3,
        role: "Full Stack Developer",
        company: "Stripe",
        location: "New York",
        salary: "$150k - $200k",
        logo: "S",
        tags: ["Node.js", "Postgres", "React", "API"],
        requirements: ["Frontend", "Backend", "Database", "API"],
        category: "Fullstack"
    },
    {
        id: 4,
        role: "Mobile Developer",
        company: "Uber",
        location: "Seattle",
        salary: "$140k - $190k",
        logo: "🚗",
        tags: ["React Native", "iOS", "Mobile"],
        requirements: ["Mobile", "React Native", "Frontend"],
        category: "Mobile"
    },
    {
        id: 5,
        role: "DevOps Engineer",
        company: "Netflix",
        location: "Los Gatos",
        salary: "$170k - $220k",
        logo: "N",
        tags: ["AWS", "Docker", "Kubernetes", "DevOps"],
        requirements: ["DevOps", "Backend", "Cloud"],
        category: "DevOps"
    }
];

const CATEGORIES = ["All", "Frontend", "AI/ML", "Fullstack", "Mobile", "DevOps"];

export default function JobsPage() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user-profile');
                if (res.ok) {
                    const data = await res.json();
                    setSkills(data.skills || []);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Matching Logic
    const calculateMatch = (jobReqs, userSkills) => {
        if (!userSkills.length) return { score: 0, missing: jobReqs };

        const userSkillSubjects = userSkills.map(s => s.subject.toLowerCase());
        const infoMap = {};
        userSkills.forEach(s => infoMap[s.subject.toLowerCase()] = s.score);

        let matches = 0;
        const missing = [];

        jobReqs.forEach(req => {
            const r = req.toLowerCase();
            const found = userSkillSubjects.find(s => s.includes(r) || r.includes(s));

            if (found && infoMap[found] > 50) {
                matches++;
            } else {
                missing.push(req);
            }
        });

        const score = Math.round((matches / jobReqs.length) * 100);
        return { score, missing };
    };

    const filteredJobs = useMemo(() => {
        return JOBS.map(job => {
            const { score, missing } = calculateMatch(job.requirements, skills);
            return { ...job, matchScore: score, missingSkills: missing };
        })
            .filter(job => {
                const matchesSearch = job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    job.company.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = activeCategory === "All" || job.category === activeCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    }, [skills, searchQuery, activeCategory]);


    return (
        <main className="min-h-screen relative overflow-hidden bg-[#030303] selection:bg-purple-500/30 font-inter">
            {/* Premium Mesh Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

                {/* Visual Density Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 relative"
                >

                    <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                        Career
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400"> Launchpad</span>.
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Your skills are verified. We matched your profile with <span className="text-white font-bold">{JOBS.length} high-growth roles</span> that match your expert level.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{skills.length} Verified Skills</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">AI Matching Active</span>
                        </div>
                    </div>
                </motion.div>

                {/* Search & Filters */}
                <div className="max-w-4xl mx-auto mb-16 space-y-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 rounded-2xl opacity-20 group-focus-within:opacity-50 blur transition-opacity duration-500"></div>
                        <input
                            type="text"
                            placeholder="Search high-growth roles, innovative companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-8 py-5 text-lg font-medium text-white placeholder-gray-600 focus:outline-none focus:bg-[#0a0a0a] relative z-10 transition-all"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-gray-600 z-10">
                            <span className="text-xs font-black bg-white/10 px-2 py-1 rounded">CMD</span>
                            <span className="text-xs font-black bg-white/10 px-2 py-1 rounded">K</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                    ? 'bg-white text-black scale-105 shadow-xl'
                                    : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-96 rounded-[2rem] bg-white/5 border border-white/5 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredJobs.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <JobCard
                                            job={job}
                                            matchScore={job.matchScore}
                                            missingSkills={job.missingSkills}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredJobs.length === 0 && (
                            <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-md">
                                <div className="text-6xl mb-6 opacity-50">🔍</div>
                                <h3 className="text-2xl font-black text-white mb-2">No roles found</h3>
                                <p className="text-gray-500 font-medium">Try adjusting your search filters to find matches.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Footer Actions */}
                <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">Not finding the perfect fit?</h4>
                        <p className="text-gray-500 text-sm font-medium">Complete more AI courses to unlock specialized, higher-tier roles.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard" className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 transition-all">
                            Back to Dashboard
                        </Link>
                        <Link href="/roadmap" className="px-8 py-4 rounded-xl text-[10px] bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10">
                            Upskill Now
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

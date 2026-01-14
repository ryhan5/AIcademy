'use client';
import { useState } from 'react';
import ProjectMentorChat from '@/components/ProjectMentorChat';

export default function SideProjectView() {
    const [skills, setSkills] = useState('');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [blueprint, setBlueprint] = useState(null);
    const [loadingBlueprint, setLoadingBlueprint] = useState(false);

    // Engagement State
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const [chatTrigger, setChatTrigger] = useState(null);

    const generateBlueprint = async (project) => {
        setSelectedProject(project);
        setBlueprint(null);
        setCompletedTasks(new Set()); // Reset progress
        setChatTrigger(null);
        setLoadingBlueprint(true);

        try {
            const res = await fetch('/api/generate-project-blueprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectTitle: project.title,
                    techStack: project.techStack,
                    description: project.description
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setBlueprint(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingBlueprint(false);
        }
    };

    const generateProjects = async () => {
        if (!skills.trim()) return;
        setLoading(true);
        setError('');
        setProjects([]);

        try {
            const res = await fetch('/api/generate-side-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to generate ideas');

            setProjects(data.projects);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (task) => {
        const newSet = new Set(completedTasks);
        if (newSet.has(task)) {
            newSet.delete(task);
        } else {
            newSet.add(task);
        }
        setCompletedTasks(newSet);
    };

    const askMentor = (task) => {
        setChatTrigger(`I need help implementing this task: "${task}". Can you give me a step-by-step guide or code example?`);
    };

    // Calculate Progress
    const totalTasks = blueprint ? blueprint.sprints.reduce((acc, sprint) => acc + sprint.tasks.length, 0) : 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks.size / totalTasks) * 100) : 0;

    return (
        <div className="w-full">
            <div className="max-w-4xl mx-auto text-center mb-16 relative z-10 px-6">
                <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                    BUILD THE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400">
                        IMPOSSIBLE.
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
                    Convert abstract concepts into high-impact portfolio pieces. Tell us your stack, we'll blueprint the mission.
                </p>
            </div>

            {/* Input Section */}
            <div className="max-w-3xl mx-auto mb-24 px-6 relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 rounded-[2rem] opacity-20 group-hover:opacity-40 transition duration-700 blur-xl"></div>
                    <div className="relative bg-[#0a0a0a]/80 border border-white/10 rounded-[2rem] p-2 flex flex-col md:flex-row gap-3 backdrop-blur-3xl shadow-2xl">
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g. Next.js, Python, LLMs, Computer Vision..."
                            className="flex-1 bg-transparent border-none outline-none text-white px-6 py-5 text-xl placeholder:text-white/5 font-medium"
                            onKeyDown={(e) => e.key === 'Enter' && generateProjects()}
                        />
                        <button
                            onClick={generateProjects}
                            disabled={loading || !skills.trim()}
                            className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                    CALCULATING...
                                </>
                            ) : (
                                <>
                                    BLUEPRINT IDEAS <span className="text-2xl">⚡</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-400 mt-6 text-center font-bold tracking-tight uppercase text-xs">{error}</p>}
            </div>

            {/* Results Grid */}
            {projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700 px-6 max-w-7xl mx-auto">
                    {projects.map((project, idx) => (
                        <div
                            key={idx}
                            className={`group relative bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 hover:border-white/20 transition-all duration-500 hover:-translate-y-3 flex flex-col h-full overflow-hidden shadow-2xl
                                ${project.difficulty === 'Beginner' ? 'hover:shadow-emerald-500/5' :
                                    project.difficulty === 'Intermediate' ? 'hover:shadow-blue-500/5' : 'hover:shadow-fuchsia-500/5'}
                            `}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700
                                ${project.difficulty === 'Beginner' ? 'bg-emerald-500' :
                                    project.difficulty === 'Intermediate' ? 'bg-blue-500' : 'bg-fuchsia-500'}
                            `}></div>

                            <div className="relative z-10 mb-8">
                                <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6 border shadow-inner
                                    ${project.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        project.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'}`}
                                >
                                    {project.difficulty} LEVEL
                                </span>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">{project.title}</h3>
                                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">{project.description}</p>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {project.techStack.map((tech, i) => (
                                        <span key={i} className="text-[10px] bg-white/5 text-white/40 font-black px-3 py-1 rounded-full border border-white/5 uppercase tracking-tighter">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => generateBlueprint(project)}
                                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
                                >
                                    VIEW MISSION BLUEPRINT <span className="text-lg">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Blueprint Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a]/90 border border-white/10 rounded-[3rem] w-full max-w-7xl h-full md:h-[90vh] flex overflow-hidden relative shadow-2xl flex-col md:flex-row backdrop-blur-3xl">
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-6 right-6 z-30 w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-2xl text-white/50 hover:text-white transition-all border border-white/10 hover:bg-white/10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Left Column: Blueprint Content */}
                        <div className="flex-[1.5] overflow-y-auto p-8 md:p-12 scrollbar-none relative">
                            {/* Floating Progress Bar */}
                            {blueprint && !loadingBlueprint && (
                                <div className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-3xl border-b border-white/5 py-6 mb-12 -mx-12 px-12 transition-all">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-1">Involved Protocol</span>
                                            <h2 className="text-3xl font-black text-white tracking-tight">{selectedProject.title}</h2>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-white tracking-tighter">{progress}%</span>
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Status: Active</span>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {loadingBlueprint ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 mt-20">
                                    <span className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></span>
                                    <p className="text-white animate-pulse">Initializing Mission Protocol...</p>
                                </div>
                            ) : blueprint ? (
                                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
                                    {/* Mission Brief */}
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 relative overflow-hidden group/brief">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-8xl text-white select-none tracking-tighter">PROJECT</div>
                                        <h3 className="text-[10px] font-black text-fuchsia-400 mb-6 uppercase tracking-[0.4em] flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping"></span> LOG_01: MISSION BRIEF
                                        </h3>
                                        <p className="text-2xl text-white/90 font-medium leading-tight tracking-tight max-w-3xl">
                                            "{blueprint.missionBrief}"
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Resume Impact */}
                                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[2rem] p-8">
                                            <h3 className="text-[10px] font-black text-emerald-400 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
                                                💼 CV IMPACT_PROTOCOL
                                            </h3>
                                            <ul className="space-y-4">
                                                {blueprint.resumeBullets?.map((bullet, i) => (
                                                    <li key={i} className="flex gap-4 text-emerald-100/60 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-[13px] font-medium leading-relaxed">
                                                        <span className="text-emerald-500 font-black">✓</span> {bullet}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* Core Features */}
                                        <div className="bg-blue-500/[0.02] border border-blue-500/10 rounded-[2rem] p-8">
                                            <h3 className="text-[10px] font-black text-blue-400 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
                                                ✨ CORE_SYSTEM_FEATURES
                                            </h3>
                                            <ul className="space-y-3">
                                                {blueprint.features.map((feat, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-white/60 text-[13px] font-medium bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Interactive Sprints */}
                                    <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-10">
                                        <h3 className="text-[10px] font-black text-white/30 mb-10 uppercase tracking-[0.4em] flex items-center gap-3">
                                            🚀 EXECUTION_PIPELINE
                                        </h3>
                                        <div className="space-y-12">
                                            {blueprint.sprints?.map((sprint, i) => (
                                                <div key={i} className="relative pl-12 border-l border-white/5">
                                                    <div className="absolute -left-[1px] top-0 w-[1px] h-full bg-gradient-to-b from-fuchsia-500 to-transparent"></div>
                                                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-fuchsia-500 shadow-[0_0_15px_rgba(232,121,249,0.5)]"></div>

                                                    <h4 className="text-[10px] font-black text-fuchsia-500 mb-8 uppercase tracking-[0.3em] bg-fuchsia-500/5 inline-block px-4 py-2 border border-fuchsia-500/20 rounded-lg">
                                                        PHASE_0{i + 1}: {sprint.phase}
                                                    </h4>

                                                    <div className="grid gap-3">
                                                        {sprint.tasks.map((task, j) => {
                                                            const isCompleted = completedTasks.has(task);
                                                            return (
                                                                <div
                                                                    key={j}
                                                                    className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${isCompleted
                                                                        ? 'bg-emerald-500/5 border-emerald-500/10'
                                                                        : 'bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                                                                        }`}
                                                                >
                                                                    <div
                                                                        className="flex items-center gap-5 flex-1 cursor-pointer"
                                                                        onClick={() => toggleTask(task)}
                                                                    >
                                                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 ${isCompleted
                                                                            ? 'bg-emerald-500 border-emerald-500 text-black scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                                            : 'border-white/10 group-hover:border-white/40'
                                                                            }`}>
                                                                            {isCompleted && <span className="text-[10px] font-black">✓</span>}
                                                                        </div>
                                                                        <span className={`text-[15px] font-medium transition-all duration-500 ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-300'
                                                                            }`}>
                                                                            {task}
                                                                        </span>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => askMentor(task)}
                                                                        className="ml-4 p-3 text-white/20 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:text-white"
                                                                    >
                                                                        <span className="text-xl">💡</span>
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Architecture (Collapsed or moved to bottom) */}
                                    <div className="bg-white/5 rounded-xl p-6 border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                                        <details className="group">
                                            <summary className="font-bold text-white cursor-pointer flex items-center gap-2 list-none">
                                                <span className="group-open:rotate-90 transition-transform">▸</span> 🏗️ Technical Architecture
                                            </summary>
                                            <div className="grid md:grid-cols-3 gap-6 mt-4 pl-4 pt-4 border-t border-white/5">
                                                <div>
                                                    <span className="text-xs text-[var(--accent)] font-bold uppercase block mb-1">Frontend</span>
                                                    <p className="text-gray-400 text-sm">{blueprint.architecture.frontend}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-[var(--accent)] font-bold uppercase block mb-1">Backend</span>
                                                    <p className="text-gray-400 text-sm">{blueprint.architecture.backend}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-[var(--accent)] font-bold uppercase block mb-1">Database</span>
                                                    <p className="text-gray-400 text-sm">{blueprint.architecture.database}</p>
                                                </div>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-red-400 py-10">Failed to load blueprint.</div>
                            )}
                        </div>

                        {/* Right Column: AI Mentor */}
                        {blueprint && (
                            <ProjectMentorChat
                                project={{ ...selectedProject, ...blueprint }}
                                triggerMessage={chatTrigger}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

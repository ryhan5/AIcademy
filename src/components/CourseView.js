'use client';
import { useState, useEffect } from 'react';
import { markModuleComplete, isModuleComplete, awardXP, XP_REWARDS } from '../utils/UserProgress';
import XPNotification from './XPNotification';
import MentorChat from './MentorChat';
import LoadingSpinner from './ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function CourseView({ topic, duration, initialData, onCourseGenerated }) {
    const [course, setCourse] = useState(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState(null);
    const [activeChapter, setActiveChapter] = useState(0);
    const [quizMode, setQuizMode] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [xpNotification, setXpNotification] = useState(null);
    const [showMentor, setShowMentor] = useState(false);
    const router = useRouter();


    // Reader Mode Logic
    const [activeDoc, setActiveDoc] = useState(null);
    const [loadingDoc, setLoadingDoc] = useState(false);

    useEffect(() => {
        if (initialData) {
            setCourse(initialData);
            setLoading(false);
            return;
        }

        if (!topic) return;

        const fetchCourse = async () => {
            try {
                const response = await fetch('/api/generate-course', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, duration }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || `Server error: ${response.status}`);
                }

                const data = await response.json();
                setCourse(data);
                if (onCourseGenerated) {
                    onCourseGenerated();
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic, duration, initialData]);

    const handleQuizAnswer = (questionIndex, answer) => {
        setQuizAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleQuizSubmit = () => {
        const chapter = course.chapters[activeChapter];
        const correctCount = chapter.quiz.reduce((acc, q, idx) => {
            return acc + (quizAnswers[idx] === q.correctAnswer ? 1 : 0);
        }, 0);

        // Award XP
        const xpEarned = correctCount * 10 + (correctCount === chapter.quiz.length ? 50 : 0);
        const reward = awardXP(xpEarned, `${correctCount}/${chapter.quiz.length} correct!`);
        setXpNotification({ xp: reward.xpGained, reason: reward.reason });

        setShowResults(true);
    };

    const handleCompleteChapter = async () => {
        const moduleId = `course_${topic}_ch${activeChapter}`;
        const reward = markModuleComplete(moduleId, topic);
        if (reward) {
            setXpNotification({ xp: reward.xpGained, reason: reward.reason });
        }

        if (activeChapter < (course.chapters?.length || 0) - 1) {
            setActiveChapter(prev => prev + 1);
            setQuizMode(false);
            setQuizAnswers({});
            setShowResults(false);
            setActiveTab('watch');
        } else {
            // Course Finished Logic
            try {
                const res = await fetch('/api/complete-course', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: course.topic })
                });
                const data = await res.json();

                if (data.skillUpdate) {
                    // Show a specific notification for skill boost
                    setTimeout(() => {
                        setXpNotification({
                            xp: data.skillUpdate.boost,
                            reason: `📈 ${data.skillUpdate.subject} Skill Boosted!`
                        });
                    }, 2000); // Show after the XP notification

                    if (data.newProject) {
                        setTimeout(() => {
                            alert(`🎉 New Portfolio Project Unlocked: ${data.newProject.title}`);
                        }, 4000);
                    }
                }
            } catch (err) {
                console.error("Failed to complete course", err);
            }
        }
    };

    const handleResourceClick = async (e, url, type) => {
        if (type === 'Video') return;

        e.preventDefault();
        setLoadingDoc(true);
        setActiveDoc({ url, type, content: null });

        try {
            const res = await fetch(`/api/read-url?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setActiveDoc(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Reader error:', error);
            setActiveDoc(prev => ({ ...prev, error: 'Failed to load content. Opening in new tab...', content: 'error' }));
            setTimeout(() => {
                window.open(url, '_blank');
                setActiveDoc(null);
            }, 1500);
        } finally {
            setLoadingDoc(false);
        }
    };



    // Tab State
    const [activeTab, setActiveTab] = useState('watch'); // 'watch', 'read', 'practice'

    if (loading) {
        return (
            <LoadingSpinner
                title="Generating Course"
                message={`Curating the best content for ${topic}...`}
            />
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl border border-red-500/20">⚠️</div>
                <h3 className="text-xl font-black text-white mb-2">Generation Failed</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest text-white border border-white/10"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!course || !course.chapters) return null;

    const currentChapter = course.chapters[activeChapter];
    if (!currentChapter) return null;

    const isChapterComplete = isModuleComplete(`course_${topic || course.topic}_ch${activeChapter}`, topic || course.topic);

    return (
        <div className="flex h-full text-white overflow-hidden font-inter selection:bg-purple-500/30">
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            {/* SIDEBAR NAVIGATION */}
            <aside className="w-80 flex-shrink-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-20">
                <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                    <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white mb-4 transition-colors">
                        ← Dashboard
                    </button>
                    <h1 className="text-lg font-black text-white leading-tight mb-3 tracking-tight line-clamp-2">{course.topic}</h1>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5">{course.chapters.length} Chapters</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5">{course.duration}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                    {course.chapters.map((chap, idx) => {
                        const isActive = activeChapter === idx;
                        const isCompleted = idx < activeChapter || isModuleComplete(`course_${topic || course.topic}_ch${idx}`, topic || course.topic);

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setActiveChapter(idx);
                                    setQuizMode(false);
                                    setShowResults(false);
                                    setActiveTab('watch'); // Reset to watch on chapter change
                                }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-purple-500/10 border-purple-500/30 shadow-lg'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] border flex-shrink-0 font-black ${isActive
                                        ? 'bg-purple-500 text-white border-purple-400'
                                        : isCompleted
                                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                            : 'bg-white/5 border-white/10 text-gray-500'
                                        }`}>
                                        {isCompleted ? '✓' : idx + 1}
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold mb-1 line-clamp-1 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                            {chap.title}
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-wide">Video & Quiz</div>
                                    </div>
                                </div>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/[0.02] mix-blend-overlay"></div>
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Progress</span>
                            <span className="text-[10px] font-black text-purple-400">{Math.round(((activeChapter) / course.chapters.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden relative z-10">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${((activeChapter) / course.chapters.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Top Bar */}
                <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md z-10 sticky top-0">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
                            <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase tracking-widest">Chapter {activeChapter + 1}</span>
                            {currentChapter.title}
                        </h2>
                    </div>
                    {/* Tabs Switcher */}
                    <div className="flex gap-1 p-1 bg-[#0a0a0a] border border-white/10 rounded-xl">
                        {[
                            { id: 'watch', label: 'Watch', icon: '📺' },
                            { id: 'read', label: 'Read', icon: '📄' },
                            { id: 'practice', label: 'Practice', icon: '⚡' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-black' : 'opacity-70'}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/10 bg-transparent">
                    <div className="max-w-6xl mx-auto p-8 lg:p-12">

                        {/* CONTENT: WATCH */}
                        {activeTab === 'watch' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid gap-12">
                                    {currentChapter.videos?.map((video, idx) => (
                                        <div key={idx} className="group relative rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl">
                                            {/* Video Player */}
                                            <div className="relative aspect-video w-full bg-black">
                                                {video.videoId ? (
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${video.videoId}`}
                                                        title={video.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="w-full h-full"
                                                    ></iframe>
                                                ) : (
                                                    // Fallback UI
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#151515] text-center p-8 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]"></div>
                                                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-4xl grayscale opacity-30">
                                                            🎥
                                                        </div>
                                                        <h3 className="text-white font-bold mb-2 text-lg">{video.title}</h3>
                                                        <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest font-bold">Preview unavailable externally</p>
                                                        <a
                                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery || video.title)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10 relative z-10"
                                                        >
                                                            Watch on YouTube ↗
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-8 flex items-start justify-between gap-4 bg-white/[0.02]">
                                                <div>
                                                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">{video.title}</h3>
                                                    <p className="text-sm font-medium text-gray-500">{video.creator} • {video.duration}</p>
                                                </div>
                                                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 flex justify-end">
                                    <button
                                        onClick={() => setActiveTab('read')}
                                        className="group px-8 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-white/10"
                                    >
                                        Next: Read Summary <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CONTENT: READ */}
                        {activeTab === 'read' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid md:grid-cols-2 gap-6 mb-12">
                                    {/* Flashcards */}
                                    {currentChapter.flashcards?.map((card, idx) => (
                                        <div key={idx} className="group h-64 [perspective:1000px] cursor-pointer">
                                            <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] transition-all ease-out">
                                                <div className="absolute inset-0 [backface-visibility:hidden] bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl hover:border-white/20 transition-colors">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Concept</span>
                                                    <h4 className="font-black text-white text-xl leading-snug">{card.front}</h4>
                                                </div>
                                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-900/20 backdrop-blur-md border border-indigo-500/30 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-y-auto">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Explanation</span>
                                                    <p className="text-indigo-100 font-medium text-sm leading-relaxed">{card.back}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#0a0a0a]/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wide flex items-center gap-3">
                                        <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                                        Key Takeaways
                                    </h3>
                                    <ul className="grid gap-4">
                                        {currentChapter.topics?.map((t, i) => (
                                            <li key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                                <span className="font-black text-purple-500 opacity-50">0{i + 1}</span>
                                                <span className="font-medium text-gray-300 leading-relaxed">{t}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-12 flex justify-end">
                                    <button
                                        onClick={() => setActiveTab('practice')}
                                        className="group px-8 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-white/10"
                                    >
                                        Next: Practice Quiz <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CONTENT: PRACTICE */}
                        {activeTab === 'practice' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[2.5rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                                    {!quizMode && !showResults ? (
                                        <div className="text-center py-10 relative z-10">
                                            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl">⚡</div>
                                            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Knowledge Check</h3>
                                            <p className="text-gray-400 mb-10 font-medium">Verify your understanding of Chapter {activeChapter + 1}.</p>
                                            <button
                                                onClick={() => setQuizMode(true)}
                                                className="px-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                            >
                                                Start Quiz
                                            </button>
                                        </div>
                                    ) : (
                                        // Quiz Component Logic (Reused)
                                        <div className="space-y-10 relative z-10">
                                            {!showResults ? (
                                                <>
                                                    {currentChapter.quiz?.map((q, idx) => (
                                                        <div key={idx} className="space-y-6">
                                                            <h4 className="text-xl font-bold text-white leading-snug">
                                                                <span className="text-purple-500 mr-2 opacity-50">0{idx + 1}.</span>{q.question}
                                                            </h4>
                                                            <div className="grid gap-3">
                                                                {q.options?.map((option, optIdx) => (
                                                                    <button
                                                                        key={optIdx}
                                                                        onClick={() => handleQuizAnswer(idx, option)}
                                                                        className={`w-full text-left p-5 rounded-xl text-sm font-medium transition-all border relative overflow-hidden group ${quizAnswers[idx] === option
                                                                            ? 'bg-purple-600 border-purple-500 text-white shadow-xl'
                                                                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                                                                            }`}
                                                                    >
                                                                        {quizAnswers[idx] === option && <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>}
                                                                        <span className="relative z-10">{option}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="pt-8 border-t border-white/5">
                                                        <button
                                                            onClick={handleQuizSubmit}
                                                            disabled={Object.keys(quizAnswers).length !== (currentChapter.quiz?.length || 0)}
                                                            className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-xl"
                                                        >
                                                            Submit Answers
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl">🏆</div>
                                                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Quiz Complete!</h3>
                                                    <p className="text-gray-400 mb-10 font-bold uppercase tracking-wide">
                                                        Score: <span className="text-emerald-400">{currentChapter.quiz.filter((q, i) => quizAnswers[i] === q.correctAnswer).length}</span> / {currentChapter.quiz.length}
                                                    </p>

                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={handleCompleteChapter}
                                                            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-purple-500/20"
                                                        >
                                                            {activeChapter < (course.chapters?.length || 0) - 1 ? 'Next Chapter →' : 'Finish Course 🎓'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MENTOR FAB (Floating Action Button) */}
            <button
                onClick={() => setShowMentor(!showMentor)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center text-3xl hover:scale-110 transition-transform z-50 hover:bg-gray-100"
                title="Ask AI Mentor"
            >
                ✨
            </button>

            {/* SLIDE-OVER PANELS (Mentor/Reader) */}
            <div className={`fixed inset-y-0 right-0 w-[450px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-50 ${showMentor || activeDoc ? 'translate-x-0' : 'translate-x-full'}`}>
                {activeDoc ? (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="font-black text-white text-sm truncate max-w-[200px] uppercase tracking-wide">{activeDoc.title || 'Document'}</h3>
                            <button onClick={() => setActiveDoc(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-sm">
                            {loadingDoc ? <p className="text-center text-gray-500 font-bold animate-pulse">Loading Content...</p> : <div dangerouslySetInnerHTML={{ __html: activeDoc.content }} />}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="font-black text-white text-sm uppercase tracking-wide flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                AI Mentor
                            </h3>
                            <button onClick={() => setShowMentor(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="flex-1">
                            <MentorChat
                                topic={course.topic}
                                chapter={currentChapter}
                                videoContext={currentChapter.videos?.[0]}
                                onClose={() => setShowMentor(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

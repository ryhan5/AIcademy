'use client';
import { useState, useEffect } from 'react';
import { markModuleComplete, isModuleComplete, awardXP, XP_REWARDS } from '../utils/UserProgress';
import XPNotification from './XPNotification';
import MentorChat from './MentorChat';
import Link from 'next/link';


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

    const handleCompleteChapter = () => {
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



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-[var(--primary)]/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Generating Course...</h3>
                <p className="text-[var(--text-muted)]">Curating the best YouTube content for you</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
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
        <div className="h-full flex flex-col relative">
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            {/* Sticky Glass Header */}
            <div className="sticky top-0 z-30 px-8 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white mb-1">{course.topic}</h1>
                    <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                            {course.duration}
                        </span>
                        <span>•</span>
                        <span>{course.chapters?.length || 0} Chapters</span>
                    </div>
                </div>
                <div className="flex gap-3">

                    <button
                        onClick={() => { setShowMentor(!showMentor); setActiveDoc(null); }}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 border shadow-lg ${showMentor ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-[var(--primary)]/20' : 'bg-white/5 border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/10'}`}
                    >
                        <span>🤖</span>
                        <span className="hidden md:inline font-medium">AI Mentor</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left: Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent transition-all duration-300 min-w-0">
                    <div className="max-w-5xl mx-auto space-y-10">

                        {/* Timeline Navigation */}
                        <div className="relative flex items-center justify-between mb-12 px-2">
                            {/* Connecting Line */}
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/5 -z-10"></div>

                            {course.chapters?.map((chap, idx) => {
                                const isActive = activeChapter === idx;
                                const isCompleted = idx < activeChapter; // Simplified for now
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setActiveChapter(idx);
                                            setQuizMode(false);
                                            setShowResults(false);
                                        }}
                                        className={`relative group flex flex-col items-center gap-3 transition-all ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${isActive
                                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-[0_0_20px_-5px_var(--primary)]'
                                            : isCompleted
                                                ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]'
                                                : 'bg-[#1a1b26] border-white/10 text-[var(--text-muted)] group-hover:border-white/30 group-hover:text-white'
                                            }`}>
                                            {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`absolute top-12 text-xs font-medium whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100'}`}>
                                            Chapter {idx + 1}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Chapter Title & Tags */}
                        <div className="animate-fade-in">
                            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">{currentChapter.title}</h2>

                            <div className="flex flex-wrap gap-2 mb-10">
                                {currentChapter.topics?.map((topic, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-[var(--text-secondary)] hover:bg-white/10 transition-colors cursor-default">
                                        #{topic}
                                    </span>
                                ))}
                            </div>

                            {/* Cinema Video Player */}
                            <div className="grid gap-8 mb-16">
                                {currentChapter.videos?.map((video, idx) => (
                                    <div key={idx} className="group relative rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/50">
                                        {/* Glow Effect */}
                                        <div className="absolute -inset-1 bg-gradient-to-b from-[var(--primary)]/20 to-transparent opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>

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
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-center p-8">
                                                    <div className="text-5xl mb-4 opacity-50">🎥</div>
                                                    <h3 className="text-white font-medium mb-2">{video.title}</h3>
                                                    <p className="text-sm text-[var(--text-muted)] mb-6">Video unavailable directly</p>
                                                    <a
                                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery || video.title)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/20"
                                                    >
                                                        Search on YouTube ↗
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative p-6 bg-[#0a0a0a] border-t border-white/5">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--primary)] transition-colors line-clamp-1 mb-1">{video.title}</h3>
                                                    <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">▶</span>
                                                        {video.creator} • {video.duration}
                                                    </p>
                                                </div>
                                                {video.videoId && (
                                                    <a
                                                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-all hover:scale-105"
                                                        title="Watch on YouTube"
                                                    >
                                                        ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Flashcards (Bento Style) */}
                            <div className="mb-16">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">⚡</span>
                                    Flashcards
                                </h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentChapter.flashcards?.map((card, idx) => (
                                        <div
                                            key={idx}
                                            className="group h-48 [perspective:1000px] cursor-pointer"
                                        >
                                            <div className="relative w-full h-full duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] transition-transform">
                                                {/* Front */}
                                                <div className="absolute inset-0 [backface-visibility:hidden] bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg group-hover:shadow-yellow-500/10 transition-all">
                                                    <div className="text-3xl mb-3">❓</div>
                                                    <h4 className="font-bold text-white text-lg">{card.front}</h4>
                                                    <p className="text-xs text-[var(--text-muted)] mt-4 uppercase tracking-wider">Hover to reveal</p>
                                                </div>

                                                {/* Back */}
                                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[var(--primary)]/20 to-purple-600/20 border border-[var(--primary)]/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-sm">
                                                    <div className="text-3xl mb-3">💡</div>
                                                    <p className="text-white font-medium text-sm leading-relaxed">{card.back}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quiz Challenge Card */}
                            <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[var(--primary)]/50 to-purple-600/50">
                                <div className="bg-[#0a0a0a] rounded-[23px] p-8 relative overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[80px] pointer-events-none"></div>

                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">Knowledge Check</h3>
                                            <p className="text-sm text-[var(--text-muted)]">Prove your mastery of this chapter</p>
                                        </div>
                                        {!quizMode && !showResults && (
                                            <button
                                                onClick={() => setQuizMode(true)}
                                                className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/25 hover:scale-105 active:scale-95"
                                            >
                                                Start Quiz
                                            </button>
                                        )}
                                    </div>

                                    {quizMode && !showResults && (
                                        <div className="space-y-8 animate-fade-in relative z-10">
                                            {currentChapter.quiz?.map((q, idx) => (
                                                <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                                    <p className="text-white font-medium text-lg mb-6 flex gap-3">
                                                        <span className="text-[var(--primary)] font-bold">{idx + 1}.</span>
                                                        {q.question}
                                                    </p>
                                                    <div className="grid gap-3">
                                                        {q.options?.map((option, optIdx) => (
                                                            <button
                                                                key={optIdx}
                                                                onClick={() => handleQuizAnswer(idx, option)}
                                                                className={`w-full text-left p-4 rounded-xl text-sm font-medium transition-all border ${quizAnswers[idx] === option
                                                                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                                                                    : 'bg-black/20 border-white/5 text-[var(--text-secondary)] hover:bg-white/5 hover:border-white/10'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-end pt-4">
                                                <button
                                                    onClick={handleQuizSubmit}
                                                    disabled={Object.keys(quizAnswers).length !== (currentChapter.quiz?.length || 0)}
                                                    className="px-10 py-4 bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[var(--primary)]/20 hover:scale-105 active:scale-95"
                                                >
                                                    Submit Answers
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {showResults && (
                                        <div className="space-y-6 animate-fade-in relative z-10">
                                            <div className="text-center mb-8">
                                                <div className="inline-block p-4 rounded-full bg-green-500/10 mb-4 border border-green-500/20">
                                                    <div className="text-4xl">🎉</div>
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Quiz Results</h3>
                                                <p className="text-[var(--text-muted)]">
                                                    You got <span className="text-white font-bold">{currentChapter.quiz.filter((q, i) => quizAnswers[i] === q.correctAnswer).length}</span> out of <span className="text-white font-bold">{currentChapter.quiz.length}</span> correct!
                                                </p>
                                            </div>

                                            {currentChapter.quiz.map((q, idx) => {
                                                const isCorrect = quizAnswers[idx] === q.correctAnswer;
                                                return (
                                                    <div key={idx} className={`rounded-2xl p-6 border ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                        <p className="text-white font-medium text-lg mb-4 flex gap-3">
                                                            <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{idx + 1}.</span>
                                                            {q.question}
                                                        </p>
                                                        <div className="space-y-2 mb-4">
                                                            {q.options.map((opt, optIdx) => {
                                                                const isSelected = quizAnswers[idx] === opt;
                                                                const isTheCorrectAnswer = opt === q.correctAnswer;
                                                                let className = "w-full text-left p-3 rounded-lg text-sm border transition-all ";

                                                                if (isTheCorrectAnswer) {
                                                                    className += "bg-green-500/20 border-green-500/50 text-green-200 font-medium";
                                                                } else if (isSelected && !isCorrect) {
                                                                    className += "bg-red-500/20 border-red-500/50 text-red-200";
                                                                } else {
                                                                    className += "bg-black/20 border-white/5 text-[var(--text-muted)] opacity-50";
                                                                }

                                                                return (
                                                                    <div key={optIdx} className={className}>
                                                                        <div className="flex justify-between items-center">
                                                                            <span>{opt}</span>
                                                                            {isTheCorrectAnswer && <span>✓</span>}
                                                                            {isSelected && !isCorrect && <span>✗</span>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {q.explanation && (
                                                            <div className="text-sm text-[var(--text-muted)] bg-black/20 p-4 rounded-xl border border-white/5 flex gap-2 items-start">
                                                                <span className="text-lg">💡</span>
                                                                <div>
                                                                    <span className="font-bold text-[var(--primary)] block mb-1">Explanation</span>
                                                                    {q.explanation}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            <div className="flex justify-center pt-8">
                                                <button
                                                    onClick={handleCompleteChapter}
                                                    className="px-10 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all shadow-xl hover:scale-105 active:scale-95"
                                                >
                                                    {activeChapter < (course.chapters?.length || 0) - 1 ? 'Next Chapter →' : 'Finish Course 🏆'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Panels (Mentor, Reader, Playground) */}
                <div className={`${showMentor || activeDoc ? 'w-[450px] opacity-100' : 'w-0 opacity-0'} shrink-0 h-full bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-2xl z-40 overflow-hidden`}>
                    {activeDoc ? (
                        // Reader Panel
                        <div className="h-full flex flex-col w-[450px]">
                            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">📄</div>
                                    <h3 className="font-bold text-white text-sm truncate" title={activeDoc.title}>
                                        {loadingDoc ? 'Loading...' : activeDoc.title || 'Document'}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <a href={activeDoc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors" title="Open in new tab">↗</a>
                                    <button onClick={() => setActiveDoc(null)} className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors">✕</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10">
                                {loadingDoc ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm text-[var(--text-muted)]">Fetching content...</p>
                                    </div>
                                ) : activeDoc.content ? (
                                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-[var(--primary)] prose-strong:text-white prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                        <div dangerouslySetInnerHTML={{ __html: activeDoc.content }} />
                                    </div>
                                ) : (
                                    <div className="text-center text-[var(--text-muted)] py-12">
                                        Failed to load content.
                                    </div>
                                )}
                            </div>
                            {/* Mini Mentor Toggle when Reader is open */}
                            {!showMentor && (
                                <button
                                    onClick={() => setShowMentor(true)}
                                    className="absolute bottom-8 right-8 w-14 h-14 bg-[var(--primary)] rounded-full flex items-center justify-center text-white shadow-xl shadow-[var(--primary)]/30 hover:scale-110 transition-transform z-50 border-2 border-white/10"
                                    title="Ask AI about this"
                                >
                                    <span className="text-2xl">🤖</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        // Mentor Panel
                        <div className="h-full w-[450px]">
                            <MentorChat
                                topic={course.topic}
                                chapter={currentChapter}
                                videoContext={currentChapter.videos?.[0]}
                                onClose={() => setShowMentor(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

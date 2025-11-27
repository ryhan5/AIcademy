'use client';
import { useState, useEffect } from 'react';
import { markModuleComplete, isModuleComplete, awardXP, XP_REWARDS } from '../utils/UserProgress';
import XPNotification from './XPNotification';

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

    useEffect(() => {
        if (initialData) {
            setCourse(initialData);
            setLoading(false);
            return;
        }

        if (!topic) return;

        const fetchCourse = async () => {
            try {
                console.log('Fetching course...', { topic, duration });
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

        // Move to next chapter
        if (activeChapter < course.chapters.length - 1) {
            setActiveChapter(activeChapter + 1);
            setQuizMode(false);
            setQuizAnswers({});
            setShowResults(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-[var(--primary)]/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-xl font-medium text-white">Generating your curriculum...</p>
                <p className="text-[var(--text-muted)] mt-2">AI is curating videos and quizzes</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 glass-panel border-red-500/30 bg-red-500/5 rounded-3xl">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                <p className="text-red-300 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-semibold transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!course) return null;

    if (!course.chapters || course.chapters.length === 0) {
        console.error("Invalid Course Data:", course);
        return (
            <div className="text-center p-12">
                <h3 className="text-xl font-bold text-white mb-2">Invalid Course Data</h3>
                <p className="text-[var(--text-muted)]">This course seems to be missing content.</p>
                <pre className="text-xs text-left bg-black/50 p-4 rounded mt-4 overflow-auto max-w-lg mx-auto text-red-400">
                    {JSON.stringify(course, null, 2)}
                </pre>
            </div>
        );
    }

    // Ensure activeChapter is valid
    if (activeChapter >= course.chapters.length) {
        setActiveChapter(0);
        return null; // Render next cycle
    }

    const currentChapter = course.chapters[activeChapter];
    const isChapterComplete = isModuleComplete(`course_${topic || course.topic}_ch${activeChapter}`, topic || course.topic);
    const progress = Math.round(((activeChapter + (isChapterComplete ? 1 : 0)) / course.chapters.length) * 100);

    return (
        <>
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            <div className="w-full animate-fade-in p-6">
                {/* Course Header */}
                <div className="glass-panel p-8 md:p-10 rounded-3xl mb-8 relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div>
                                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white mb-4 transition-colors">
                                    <span>←</span> Back to Dashboard
                                </Link>
                                <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">Course</div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{course.title}</h1>
                                <p className="text-[var(--text-muted)] text-lg max-w-2xl">{course.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 min-w-[200px]">
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-white">{progress}%</span>
                                    <span className="text-sm text-[var(--text-muted)] ml-2">Complete</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[300px_1fr] gap-8">
                    {/* Chapter Navigation Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-4 rounded-3xl sticky top-24 border border-white/5">
                            <h3 className="font-bold text-white px-4 py-3 mb-2 text-sm uppercase tracking-wider opacity-70">Chapters</h3>
                            <div className="space-y-1">
                                {course.chapters.map((ch, idx) => {
                                    const isActive = activeChapter === idx;
                                    const isComplete = isModuleComplete(`course_${topic}_ch${idx}`, topic);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActiveChapter(idx);
                                                setQuizMode(false);
                                                setShowResults(false);
                                            }}
                                            className={`w-full text-left p-4 rounded-2xl transition-all group relative overflow-hidden ${isActive
                                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                                                : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${isActive ? 'border-white text-white' : isComplete ? 'border-[var(--accent)] bg-[var(--accent)] text-black border-transparent' : 'border-white/20'}`}>
                                                    {isComplete ? '✓' : idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white'}`}>
                                                        {ch.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-1">
                        {!quizMode ? (
                            <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5 relative">
                                {/* Chapter Title */}
                                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                                    <div>
                                        <div className="text-sm font-bold text-[var(--primary)] mb-2">CHAPTER {activeChapter + 1}</div>
                                        <h2 className="text-3xl font-bold text-white">{currentChapter.title}</h2>
                                    </div>
                                    {isChapterComplete && (
                                        <div className="px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm font-bold border border-[var(--accent)]/20">
                                            Completed
                                        </div>
                                    )}
                                </div>

                                <p className="text-lg text-[var(--text-muted)] mb-8 leading-relaxed">
                                    {currentChapter.description}
                                </p>

                                {/* Key Concepts */}
                                <div className="mb-10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span>🎯</span> Key Concepts
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentChapter.keyConcepts.map((concept, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white border border-white/5 transition-colors cursor-default">
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Videos */}
                                <div className="mb-10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span>📺</span> Video Tutorials
                                    </h3>
                                    <div className="grid gap-4">
                                        {currentChapter.videos.map((video, idx) => (
                                            <a
                                                key={idx}
                                                href={video.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-4 p-5 glass-card rounded-2xl hover:border-[var(--primary)]/50 hover:bg-white/5 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 text-xl group-hover:scale-110 transition-transform">
                                                    ▶
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white group-hover:text-[var(--primary)] transition-colors mb-1">{video.title}</h4>
                                                    <p className="text-sm text-[var(--text-muted)]">By {video.creator}</p>
                                                </div>
                                                <div className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform">↗</div>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Reading Materials */}
                                <div className="mb-10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span>📖</span> Reading Materials
                                    </h3>
                                    <div className="grid gap-3">
                                        {currentChapter.materials.map((material, idx) => (
                                            <a
                                                key={idx}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-4 glass-card rounded-xl hover:border-[var(--secondary)]/50 hover:bg-white/5 transition-all group"
                                            >
                                                <div className="text-xl">{material.type === 'Documentation' ? '📄' : '📝'}</div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white group-hover:text-[var(--secondary)] transition-colors">{material.title}</h4>
                                                    <p className="text-xs text-[var(--text-muted)]">{material.type}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-white/5">
                                    <button
                                        onClick={() => setQuizMode(true)}
                                        className="flex-1 py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/40 hover:-translate-y-1"
                                    >
                                        📝 Take Chapter Quiz
                                    </button>
                                    {!isChapterComplete && (
                                        <button
                                            onClick={handleCompleteChapter}
                                            className="flex-1 py-4 glass-card hover:bg-white/10 text-white rounded-2xl font-bold transition-all hover:-translate-y-1"
                                        >
                                            ✅ Mark Complete (+100 XP)
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Quiz Mode
                            <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-white">📝 Chapter {activeChapter + 1} Quiz</h2>
                                    <div className="text-sm text-[var(--text-muted)]">
                                        {Object.keys(quizAnswers).length} / {currentChapter.quiz.length} Answered
                                    </div>
                                </div>

                                {!showResults ? (
                                    <>
                                        <div className="space-y-8 mb-10">
                                            {currentChapter.quiz.map((q, idx) => (
                                                <div key={idx} className="p-6 glass-card rounded-2xl border border-white/5">
                                                    <p className="font-bold text-lg text-white mb-4">
                                                        <span className="text-[var(--primary)] mr-2">{idx + 1}.</span>
                                                        {q.question}
                                                    </p>
                                                    <div className="space-y-3">
                                                        {q.options.map((option, optIdx) => (
                                                            <button
                                                                key={optIdx}
                                                                onClick={() => handleQuizAnswer(idx, option)}
                                                                className={`w-full text-left p-4 rounded-xl transition-all border ${quizAnswers[idx] === option
                                                                    ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-white'
                                                                    : 'bg-white/5 border-transparent hover:bg-white/10 text-[var(--text-muted)] hover:text-white'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${quizAnswers[idx] === option ? 'border-[var(--primary)]' : 'border-white/30'}`}>
                                                                        {quizAnswers[idx] === option && <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>}
                                                                    </div>
                                                                    {option}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 sticky bottom-4 z-10">
                                            <button
                                                onClick={() => setQuizMode(false)}
                                                className="flex-1 py-4 glass-card backdrop-blur-xl hover:bg-white/10 rounded-2xl font-bold text-white transition-all"
                                            >
                                                ← Back
                                            </button>
                                            <button
                                                onClick={handleQuizSubmit}
                                                disabled={Object.keys(quizAnswers).length < currentChapter.quiz.length}
                                                className="flex-1 py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-2xl font-bold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Submit Answers
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // Quiz Results
                                    <div className="animate-fade-in">
                                        <div className="text-center mb-10">
                                            <div className="text-6xl mb-4">🎉</div>
                                            <h3 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h3>
                                            <p className="text-[var(--text-muted)]">You've earned XP for your progress.</p>
                                        </div>

                                        <div className="space-y-6 mb-10">
                                            {currentChapter.quiz.map((q, idx) => {
                                                const isCorrect = quizAnswers[idx] === q.correctAnswer;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-6 rounded-2xl border ${isCorrect
                                                            ? 'border-green-500/30 bg-green-500/10'
                                                            : 'border-red-500/30 bg-red-500/10'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className={`text-xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                                {isCorrect ? '✓' : '✕'}
                                                            </div>
                                                            <p className="font-bold text-white text-lg">{q.question}</p>
                                                        </div>

                                                        {!isCorrect && (
                                                            <div className="ml-8 mb-2 text-red-300 text-sm">
                                                                Your answer: <span className="font-semibold">{quizAnswers[idx]}</span>
                                                            </div>
                                                        )}
                                                        <div className="ml-8 mb-4 text-green-400 text-sm">
                                                            Correct answer: <span className="font-semibold">{q.correctAnswer}</span>
                                                        </div>

                                                        <div className="ml-8 p-4 bg-black/20 rounded-xl text-sm text-[var(--text-muted)] border border-white/5">
                                                            <span className="font-bold text-white mr-2">💡 Explanation:</span>
                                                            {q.explanation}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setQuizMode(false);
                                                setShowResults(false);
                                                setQuizAnswers({});
                                            }}
                                            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-[var(--primary)]/30 hover:-translate-y-1"
                                        >
                                            Continue Learning
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

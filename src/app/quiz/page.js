'use client';
import { useState } from 'react';
import GoalInput from '@/components/GoalInput';
import Quiz from '@/components/Quiz';
import Link from 'next/link';

export default function QuizPage() {
    const [step, setStep] = useState('goal'); // goal, quiz, results
    const [userGoal, setUserGoal] = useState('');
    const [quizResults, setQuizResults] = useState(null);

    const handleGoalSubmit = (goal) => {
        setUserGoal(goal);
        setStep('quiz');
    };

    const handleQuizComplete = (results) => {
        setQuizResults(results);
        setStep('results');
    };

    const handleRetake = () => {
        setStep('quiz');
        setQuizResults(null);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[var(--bg-dark)]">
            {/* Background Ambience */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[var(--primary)] rounded-full blur-[180px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-[var(--accent)] rounded-full blur-[180px] opacity-20 animate-pulse-slow delay-1000"></div>
            </div>

            {step === 'goal' && (
                <div className="glass-panel p-8 sm:p-14 rounded-[2.5rem] max-w-3xl w-full border border-white/10 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"></div>

                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-8 shadow-lg transform hover:scale-110 transition-transform duration-500 group">
                            <span className="text-4xl group-hover:rotate-12 transition-transform duration-300">🧠</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tight text-white">
                            Test Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">Skills</span>
                        </h1>
                        <p className="text-xl text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
                            Challenge yourself with AI-generated quizzes tailored to any topic. Get instant feedback and level up your knowledge.
                        </p>
                    </div>
                    <GoalInput
                        onSubmit={handleGoalSubmit}
                        label="What do you want to master?"
                        description='e.g., "React Hooks", "Python Basics", "System Design"'
                        placeholder="Enter a topic..."
                        buttonText="Start Challenge"
                    />
                    <div className="mt-8 text-center">
                        <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-white transition-colors flex items-center justify-center gap-2">
                            <span>←</span> Back to Dashboard
                        </Link>
                    </div>
                </div>
            )}

            {step === 'quiz' && <Quiz goal={userGoal} onComplete={handleQuizComplete} />}

            {step === 'results' && quizResults && (
                <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] max-w-5xl w-full animate-fade-in border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"></div>

                    <div className="text-center mb-12">
                        <div className="text-6xl mb-4 animate-bounce-slow">🎉</div>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">Quiz Complete!</h2>
                        <p className="text-xl text-[var(--text-muted)]">Here&apos;s how you performed</p>
                    </div>

                    {/* Score Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Score */}
                        <div className="glass-card p-8 rounded-3xl text-center border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-3">Score</p>
                            <p className="text-6xl font-black text-white">
                                {quizResults.score}<span className="text-3xl text-[var(--text-muted)]">/{quizResults.total}</span>
                            </p>
                        </div>

                        {/* Accuracy */}
                        <div className="glass-card p-8 rounded-3xl text-center border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-3">Accuracy</p>
                            <p className="text-6xl font-black text-[var(--accent)]">
                                {Math.round((quizResults.score / quizResults.total) * 100)}<span className="text-3xl">%</span>
                            </p>
                        </div>

                        {/* Level */}
                        <div className="glass-card p-8 rounded-3xl text-center border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-3">Level</p>
                            <p className="text-4xl font-black text-white mt-2">
                                {quizResults.level}
                            </p>
                        </div>
                    </div>

                    {/* Question Review */}
                    <div className="space-y-6 mb-12">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">📋</span>
                            Detailed Review
                        </h3>
                        {quizResults.details.map((item, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${item.isCorrect
                                    ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                                    : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
                                    }`}
                            >
                                <div className="flex items-start gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${item.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {item.isCorrect ? '✓' : '✕'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-xl text-white mb-4 leading-snug">
                                            <span className="text-[var(--text-muted)] mr-3 text-base font-normal">Q{index + 1}</span>
                                            {item.question}
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-4 mb-5">
                                            {!item.isCorrect && (
                                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                                    <p className="text-xs text-red-300 uppercase font-bold mb-2 tracking-wider">Your Answer</p>
                                                    <p className="text-red-100 font-medium text-lg">{item.userAnswer}</p>
                                                </div>
                                            )}
                                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                                <p className="text-xs text-emerald-300 uppercase font-bold mb-2 tracking-wider">Correct Answer</p>
                                                <p className="text-emerald-100 font-medium text-lg">{item.correctAnswer}</p>
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-base leading-relaxed text-[var(--text-muted)]">
                                                <span className="font-bold text-[var(--primary)] mr-2">💡 Insight:</span>
                                                {item.explanation || "Understanding this concept is key to mastering the topic."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleRetake}
                            className="px-8 py-4 rounded-2xl font-bold glass-card hover:bg-white/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-white"
                        >
                            <span>🔄</span> Retake Quiz
                        </button>
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <span>📊</span> Back to Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { awardXP, XP_REWARDS } from '../utils/UserProgress';
import XPNotification from './XPNotification';

export default function Quiz({ goal, onComplete }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [xpNotification, setXpNotification] = useState(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                const res = await fetch('/api/generate-assessment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ goal }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to generate assessment');
                }

                const data = await res.json();
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                } else {
                    throw new Error('No questions generated');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (goal) {
            fetchQuestions();
        }
    }, [goal]);

    const handleAnswer = (option) => {
        const currentQ = questions[currentQuestion];
        const newAnswers = { ...answers, [currentQ.id]: option };
        setAnswers(newAnswers);

        // Award XP for answering question
        const isCorrect = option === currentQ.correctAnswer;
        if (isCorrect) {
            const reward = awardXP(XP_REWARDS.QUIZ_QUESTION, 'Correct answer!');
            setXpNotification({ xp: reward.xpGained, reason: reward.reason });
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Evaluate locally or send to API
            const score = questions.reduce((acc, q) => {
                return acc + (newAnswers[q.id] === q.correctAnswer ? 1 : 0);
            }, 0);

            const percentage = (score / questions.length) * 100;
            let level = "Beginner";
            if (percentage > 80) level = "Advanced";
            else if (percentage > 40) level = "Intermediate";

            // Award completion bonus
            const completionReward = awardXP(XP_REWARDS.QUIZ_COMPLETE, 'Quiz completed!');
            setXpNotification({ xp: completionReward.xpGained, reason: completionReward.reason });

            onComplete({
                answers: newAnswers,
                score,
                total: questions.length,
                level,
                details: questions.map(q => ({
                    question: q.question,
                    userAnswer: newAnswers[q.id],
                    correctAnswer: q.correctAnswer,
                    isCorrect: newAnswers[q.id] === q.correctAnswer,
                    explanation: q.explanation
                }))
            });
        }
    };

    if (loading) {
        return (
            <div className="glass-panel p-12 rounded-3xl max-w-2xl w-full flex flex-col items-center justify-center animate-fade-in border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5"></div>
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-[var(--primary)]/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin-reverse opacity-70"></div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Generating Challenge</h3>
                <p className="text-[var(--text-muted)] text-center text-lg">AI is crafting a custom quiz on <span className="text-[var(--primary)] font-semibold">{goal}</span>...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel p-12 rounded-3xl max-w-2xl w-full text-center animate-fade-in border border-red-500/20 shadow-2xl bg-red-500/5">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-red-500/20">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-2">Generation Failed</h3>
                <p className="text-red-200/80 mb-8 max-w-md mx-auto">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all font-bold text-white border border-white/10"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (questions.length === 0) return null;

    return (
        <>
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            <div className="glass-panel p-8 sm:p-12 rounded-3xl max-w-3xl w-full animate-fade-in border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] transition-all duration-500 relative"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-10 mt-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                            Question {currentQuestion + 1} / {questions.length}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--accent)] font-bold uppercase tracking-wider bg-[var(--accent)]/10 px-3 py-1.5 rounded-full border border-[var(--accent)]/20">
                            <span>⚡</span> +{XP_REWARDS.QUIZ_QUESTION} XP
                        </span>
                    </div>
                </div>

                <div className="mb-12 relative z-10">
                    <h3 className="text-2xl sm:text-4xl font-black leading-tight mb-8 text-white">
                        {questions[currentQuestion].question}
                    </h3>

                    <div className="grid gap-4">
                        {questions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="group relative p-6 text-left rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[var(--primary)]/50 transition-all duration-300 overflow-hidden"
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-10 h-10 rounded-xl border border-white/10 bg-black/20 flex items-center justify-center text-sm font-bold text-[var(--text-muted)] group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary)]/10 transition-all">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                                        {option}
                                    </span>
                                </div>
                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

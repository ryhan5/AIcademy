'use client';
import { useState, useEffect, useRef } from 'react';
import { awardXP, XP_REWARDS } from '../utils/UserProgress';
import XPNotification from './XPNotification';
import LoadingSpinner from './ui/LoadingSpinner';

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
            <LoadingSpinner
                title="Generating Assessment"
                message={`Crafting questions for ${goal}...`}
            />
        );
    }

    if (error) {
        return (
            <div className="relative w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                <div className="relative bg-[#0a0a0a]/90 border border-red-500/20 p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl text-center">
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
            </div>
        );
    }

    if (questions.length === 0) return null;

    return (
        <div className="relative w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-2xl opacity-50"></div>

            <div className="relative bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col min-h-[500px]">
                {/* Top Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-50"></div>

                <div className="p-8 pb-0">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                Question {currentQuestion + 1} / {questions.length}
                            </span>
                        </div>
                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black leading-tight text-white mb-8 min-h-[3rem]">
                        {questions[currentQuestion].question}
                    </h3>
                </div>

                <div className="flex-1 p-8 pt-0 flex flex-col justify-end gap-3">
                    {questions[currentQuestion].options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            className="group relative p-5 text-left rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 overflow-hidden flex items-center gap-4 active:scale-[0.99]"
                        >
                            <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-white group-hover:text-black transition-colors">
                                {String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-base font-medium text-gray-300 group-hover:text-white transition-colors">
                                {option}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

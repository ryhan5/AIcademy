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
        <main className="min-h-screen relative overflow-hidden bg-[#030303] selection:bg-purple-500/30 font-inter flex flex-col items-center justify-center p-4">
            {/* Premium Mesh Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

                {/* Visual Density Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto">
                {step === 'goal' && (
                    <div className="relative w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                        {/* Background Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-2xl opacity-50"></div>

                        <div className="relative bg-[#0a0a0a]/90 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden">
                            {/* Top Gradient Line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-50"></div>

                            <div className="text-center mb-10 relative z-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-3xl shadow-2xl">
                                    🧠
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black mb-3 text-white tracking-tight">
                                    Knowledge Challenge
                                </h1>
                                <p className="text-gray-500 font-medium max-w-lg mx-auto">
                                    Generate an AI-powered assessment to test your mastery of any technical topic.
                                </p>
                            </div>

                            <GoalInput
                                onSubmit={handleGoalSubmit}
                                label="TARGET TOPIC"
                                description='e.g., "React Hooks", "System Design", "Advanced Python"'
                                placeholder="Enter a topic to master..."
                                buttonText="GENERATE ASSESSMENT"
                            />

                            <div className="mt-8 text-center">
                                <Link href="/dashboard" className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                                    Cancel & Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'quiz' && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <Quiz goal={userGoal} onComplete={handleQuizComplete} />
                    </div>
                )}

                {step === 'results' && quizResults && (
                    <div className="relative w-full animate-in fade-in zoom-in-95 duration-500">
                        {/* Background Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-2xl opacity-50"></div>

                        <div className="relative bg-[#0a0a0a]/90 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-50"></div>

                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-3xl shadow-2xl">
                                    🏆
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Assessment Complete</h2>
                                <p className="text-gray-500 font-medium">Performance Analysis</p>
                            </div>

                            {/* Score Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                {/* Score */}
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center group hover:bg-white/[0.07] transition-colors">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Score</p>
                                    <p className="text-4xl font-black text-white">
                                        {quizResults.score}<span className="text-xl text-gray-600">/{quizResults.total}</span>
                                    </p>
                                </div>

                                {/* Accuracy */}
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center group hover:bg-white/[0.07] transition-colors">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Accuracy</p>
                                    <p className="text-4xl font-black text-emerald-400">
                                        {Math.round((quizResults.score / quizResults.total) * 100)}<span className="text-xl">%</span>
                                    </p>
                                </div>

                                {/* Level */}
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center group hover:bg-white/[0.07] transition-colors">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Rating</p>
                                    <p className="text-3xl font-black text-purple-400 mt-1">
                                        {quizResults.level}
                                    </p>
                                </div>
                            </div>

                            {/* Question Review */}
                            <div className="space-y-4 mb-12">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Detailed Breakdown</h3>
                                {quizResults.details.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-6 rounded-2xl border transition-all ${item.isCorrect
                                            ? 'border-emerald-500/20 bg-emerald-500/5'
                                            : 'border-red-500/20 bg-red-500/5'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <p className="font-bold text-white text-lg leading-snug">
                                                        <span className="text-gray-500 mr-3 text-sm font-black">0{index + 1}</span>
                                                        {item.question}
                                                    </p>
                                                    <div className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.isCorrect ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'
                                                        }`}>
                                                        {item.isCorrect ? 'Correct' : 'Missed'}
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                                    {!item.isCorrect && (
                                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                                            <p className="text-[9px] text-red-300 uppercase font-black mb-1">Your Selection</p>
                                                            <p className="text-red-100 font-medium text-sm">{item.userAnswer}</p>
                                                        </div>
                                                    )}
                                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                        <p className="text-[9px] text-emerald-300 uppercase font-black mb-1">Correct Answer</p>
                                                        <p className="text-emerald-100 font-medium text-sm">{item.correctAnswer}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                                        <span className="text-purple-400 font-bold mr-2">Insight:</span>
                                                        {item.explanation || "Review the core concepts behind this question."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-white/5">
                                <button
                                    onClick={handleRetake}
                                    className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all hover:scale-105"
                                >
                                    Retry Assessment
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-black hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                                >
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

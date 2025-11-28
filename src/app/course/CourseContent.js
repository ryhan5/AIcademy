'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseInput from '@/components/CourseInput';
import CourseView from '@/components/CourseView';
import Link from 'next/link';

export default function CourseContent() {
    const searchParams = useSearchParams();
    const topicParam = searchParams.get('topic');

    const [step, setStep] = useState('input');
    const [courseData, setCourseData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        if (topicParam) {
            setCourseData({ topic: topicParam, duration: '2 hours' });
            setStep('course');
        }
    }, [topicParam]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/courses');
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = (data) => {
        setCourseData(data);
        setStep('course');
    };

    const loadCourse = (course) => {
        setCourseData(course);
        setStep('course');
    };

    return (
        <main className="h-[calc(100vh-6rem)] flex overflow-hidden bg-[#0a0a0a] text-white selection:bg-[var(--primary)]/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[var(--primary)]/20 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000 mix-blend-screen"></div>
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] animate-pulse-slow delay-2000 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
            </div>

            {/* Sidebar */}
            <div className={`${showSidebar ? 'w-80 opacity-100' : 'w-0 opacity-0'} shrink-0 bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col relative z-20 overflow-hidden`}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">Your Learning</h2>
                        <p className="text-xs text-[var(--text-muted)]">History & Progress</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setStep('input')}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all hover:scale-105 active:scale-95"
                            title="New Course"
                        >
                            <span className="text-lg leading-none mb-0.5">+</span>
                        </button>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all hover:scale-105 active:scale-95 md:hidden"
                            title="Close Sidebar"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {loadingHistory ? (
                        <div className="flex flex-col gap-2 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-[var(--text-muted)] py-8 text-sm border border-dashed border-white/10 rounded-xl">
                            No courses yet. <br /> Start your first journey!
                        </div>
                    ) : (
                        history.map((course) => (
                            <button
                                key={course._id}
                                onClick={() => loadCourse(course)}
                                className={`group w-full text-left p-4 rounded-xl transition-all duration-300 border ${courseData?._id === course._id
                                    ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 shadow-[0_0_20px_-5px_var(--primary)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                    }`}
                            >
                                <div className={`font-medium truncate mb-1 transition-colors ${courseData?._id === course._id ? 'text-[var(--primary)]' : 'text-white group-hover:text-white'}`}>
                                    {course.title}
                                </div>
                                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            ←
                        </div>
                        <span className="font-medium text-sm">Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
                {/* Toggle Sidebar Button (Floating) */}
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`absolute top-6 left-6 z-50 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 ${showSidebar ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    →
                </button>

                <div className="flex-1 overflow-hidden relative">
                    {step === 'input' && (
                        <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
                            <div className="w-full max-w-2xl">
                                <CourseInput onSubmit={handleSubmit} />
                            </div>
                        </div>
                    )}

                    {step === 'course' && courseData && (
                        <div className="h-full animate-fade-in">
                            <CourseView
                                topic={courseData.topic}
                                duration={courseData.duration}
                                initialData={courseData.chapters ? courseData : null}
                                onCourseGenerated={fetchHistory}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

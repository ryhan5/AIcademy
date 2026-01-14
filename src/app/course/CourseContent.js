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
        <main className="h-[calc(100vh-6rem)] flex overflow-hidden bg-[#030303] text-white selection:bg-purple-500/30 relative font-inter">
            {/* Premium Mesh Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

                {/* Visual Density Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Sidebar */}
            <div className={`${showSidebar ? 'w-80 opacity-100' : 'w-0 opacity-0'} shrink-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/10 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col relative z-20 overflow-hidden shadow-2xl`}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
                    <div>
                        <h2 className="font-black text-lg tracking-tight text-white">Your Learning</h2>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">History & Progress</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setStep('input')}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95 text-gray-400 hover:text-white"
                            title="New Course"
                        >
                            <span className="text-xl leading-none mb-0.5">+</span>
                        </button>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95 md:hidden text-gray-400"
                            title="Close Sidebar"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {loadingHistory ? (
                        <div className="flex flex-col gap-3 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-white/5 rounded-2xl border border-white/5"></div>
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            <span className="text-2xl mb-2 grayscale opacity-30">📚</span>
                            <p className="text-xs text-gray-500 font-medium">No courses yet.<br />Start your first journey!</p>
                        </div>
                    ) : (
                        history.map((course) => (
                            <button
                                key={course._id}
                                onClick={() => loadCourse(course)}
                                className={`group w-full text-left p-4 rounded-2xl transition-all duration-300 border relative overflow-hidden ${courseData?._id === course._id
                                    ? 'bg-indigo-600/10 border-indigo-500/30'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                    }`}
                            >
                                {courseData?._id === course._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                                <div className={`font-bold truncate mb-1 text-sm transition-colors ${courseData?._id === course._id ? 'text-indigo-300' : 'text-gray-300 group-hover:text-white'}`}>
                                    {course.title}
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Resume →</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group border border-transparent hover:border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform text-sm font-black text-gray-500 group-hover:text-white">
                            ←
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wide">Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
                {/* Toggle Sidebar Button (Floating) */}
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`absolute top-6 left-6 z-50 w-10 h-10 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-xl ${showSidebar ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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

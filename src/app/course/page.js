'use client';
import { useState, useEffect } from 'react';
import CourseInput from '@/components/CourseInput';
import CourseView from '@/components/CourseView';
import Link from 'next/link';

export default function CoursePage() {
    const [step, setStep] = useState('input');
    const [courseData, setCourseData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [showSidebar, setShowSidebar] = useState(true);

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
        <main className="h-screen flex overflow-hidden bg-[var(--bg-dark)]">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'w-80' : 'w-0'} shrink-0 bg-black/20 border-r border-white/5 transition-all duration-300 flex flex-col relative overflow-hidden`}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <h2 className="font-bold text-white whitespace-nowrap">Your Courses</h2>
                    <button onClick={() => setStep('input')} className="text-xs bg-[var(--primary)] text-white px-2 py-1 rounded hover:opacity-90">
                        + New
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loadingHistory ? (
                        <div className="text-center text-[var(--text-muted)] py-4">Loading...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-[var(--text-muted)] py-4 text-sm">No courses yet</div>
                    ) : (
                        history.map((course) => (
                            <button
                                key={course._id}
                                onClick={() => loadCourse(course)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${courseData?._id === course._id
                                    ? 'bg-white/10 text-white'
                                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="font-medium truncate">{course.title}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">
                                    {new Date(course.createdAt).toLocaleDateString()}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Toggle Sidebar Button */}
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                    {showSidebar ? '←' : '→'}
                </button>

                {/* Dynamic Background */}
                <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--primary)] rounded-full blur-[120px] opacity-10 animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[var(--secondary)] rounded-full blur-[120px] opacity-10 animate-pulse-slow delay-1000"></div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {step === 'input' && (
                        <div className="min-h-full flex flex-col items-center justify-center p-6">
                            <CourseInput onSubmit={handleSubmit} />
                            <Link href="/dashboard" className="mt-8 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
                                <span>←</span> Back to Dashboard
                            </Link>
                        </div>
                    )}

                    {step === 'course' && courseData && (
                        <div className="min-h-full">
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

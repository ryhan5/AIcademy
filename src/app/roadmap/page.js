'use client';
import { useState } from 'react';
import RoadmapInput from '@/components/RoadmapInput';
import RoadmapView from '@/components/RoadmapView';

import Link from 'next/link';

export default function RoadmapPage() {
    const [step, setStep] = useState('input'); // input, roadmap
    const [roadmapData, setRoadmapData] = useState(null);

    const handleSubmit = (data) => {
        setRoadmapData(data);
        setStep('roadmap');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start p-6 md:p-12 relative overflow-hidden bg-[var(--bg-dark)]">
            {/* Dynamic Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[var(--primary)] rounded-full blur-[180px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-[var(--secondary)] rounded-full blur-[180px] opacity-20 animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-white/5 rounded-full opacity-30"></div>
            </div>

            {step === 'input' && (
                <div className="w-full max-w-2xl flex flex-col items-center">
                    <RoadmapInput onSubmit={handleSubmit} />
                    <Link href="/dashboard" className="mt-8 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-2">
                        <span>←</span> Back to Dashboard
                    </Link>
                </div>
            )}
            {step === 'roadmap' && roadmapData && (
                <RoadmapView
                    goal={roadmapData.goal}
                    experience={roadmapData.experience}
                    timeline={roadmapData.timeline}
                />
            )}
        </main>
    );
}

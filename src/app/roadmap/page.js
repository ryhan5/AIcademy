'use client';
import { useState } from 'react';
import RoadmapInput from '@/components/RoadmapInput';
import RoadmapView from '@/components/RoadmapView';

import Link from 'next/link';
import SideProjectView from '@/components/SideProjectView';

export default function RoadmapPage() {
    const [step, setStep] = useState('input'); // input, roadmap
    const [roadmapData, setRoadmapData] = useState(null);
    const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'projects'

    const handleSubmit = (data) => {
        setRoadmapData(data);
        setStep('roadmap');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start p-6 md:p-12 relative overflow-hidden bg-[var(--bg-dark)]">
            {/* Premium Mesh Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

                {/* Visual Density Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Navigation Header */}
            <header className="relative z-20 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
                <div className="flex bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 shadow-2xl">
                    <button
                        onClick={() => setActiveTab('roadmap')}
                        className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'roadmap'
                            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Career Roadmap
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'projects'
                            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Project Lab
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="w-full max-w-7xl">
                {activeTab === 'roadmap' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {step === 'input' && (
                            <div className="w-full max-w-2xl mx-auto flex flex-col items-center mt-12">
                                <RoadmapInput onSubmit={handleSubmit} />
                            </div>
                        )}
                        {step === 'roadmap' && roadmapData && (
                            <RoadmapView
                                goal={roadmapData.goal}
                                experience={roadmapData.experience}
                                timeline={roadmapData.timeline}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SideProjectView />
                    </div>
                )}
            </div>
        </main>
    );
}

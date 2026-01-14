'use client';
import { useState } from 'react';
import InterviewSetup from '@/components/InterviewSetup';
import InterviewSession from '@/components/InterviewSession';

export default function InterviewPage() {
    const [step, setStep] = useState('setup'); // setup, session
    const [setupData, setSetupData] = useState(null);

    const handleStart = (data) => {
        setSetupData(data);
        setStep('session');
    };

    const handleEnd = () => {
        setStep('setup');
        setSetupData(null);
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#030303] selection:bg-purple-500/30 font-inter">
            {/* Premium Mesh Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>

                {/* Visual Density Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 w-full min-h-screen">
                {step === 'setup' && (
                    <div className="animate-in fade-in zoom-in-95 duration-700 ease-out-expo">
                        <InterviewSetup onStart={handleStart} />
                    </div>
                )}

                {step === 'session' && setupData && (
                    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out-expo">
                        <InterviewSession setupData={setupData} onEnd={handleEnd} />
                    </div>
                )}
            </div>
        </main>
    );
}

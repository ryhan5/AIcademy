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
        <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#0a0a0a]">
            {/* Background Ambience */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[var(--primary)] rounded-full blur-[180px] opacity-10 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[var(--accent)] rounded-full blur-[180px] opacity-10 animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
            </div>

            {step === 'setup' && <InterviewSetup onStart={handleStart} />}
            {step === 'session' && setupData && (
                <InterviewSession setupData={setupData} onEnd={handleEnd} />
            )}
        </main>
    );
}

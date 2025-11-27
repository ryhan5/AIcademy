'use client';
import { useState, useEffect, useRef } from 'react';

export default function InterviewSession({ setupData, onEnd }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [permissionError, setPermissionError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [generatingFeedback, setGeneratingFeedback] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const videoRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Webcam
    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setPermissionError(null);
            } catch (err) {
                console.error("Error accessing webcam:", err);
                setPermissionError("Camera access denied. Please enable camera permissions.");
            }
        };
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // Keep listening
            recognitionRef.current.interimResults = true; // Show real-time results
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setPermissionError("Microphone access denied. Please enable microphone permissions in your browser settings.");
                    setIsListening(false);
                }
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    // recognitionRef.current.start(); 
                } else {
                    setIsListening(false);
                }
            };
        }
    }, [isListening]);

    const speakText = (text) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setPermissionError(null);
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                console.error("Failed to start speech recognition:", err);
            }
        }
    };

    // Initial greeting
    useEffect(() => {
        const startInterview = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/interview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [],
                        context: setupData
                    }),
                });
                const data = await res.json();
                const reply = data.reply;
                setMessages([{ role: 'assistant', content: reply }]);
                speakText(reply);
            } catch (error) {
                console.error('Failed to start interview:', error);
            } finally {
                setLoading(false);
            }
        };
        startInterview();
    }, [setupData]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        window.speechSynthesis.cancel();

        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    context: setupData
                }),
            });
            const data = await res.json();
            const reply = data.reply;
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            speakText(reply);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async () => {
        window.speechSynthesis.cancel();
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        setGeneratingFeedback(true);
        try {
            const res = await fetch('/api/interview-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    context: setupData
                }),
            });
            const data = await res.json();
            setFeedback(data);
        } catch (error) {
            console.error('Failed to generate feedback:', error);
            // Fallback or error state could be handled here
        } finally {
            setGeneratingFeedback(false);
        }
    };

    if (feedback) {
        return (
            <div className="glass-panel rounded-[2.5rem] max-w-4xl w-full p-8 border border-white/10 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] mb-4 shadow-lg">
                        <span className="text-4xl">📊</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Interview Analysis</h2>
                    <p className="text-[var(--text-muted)]">Here's how you performed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="col-span-1 bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
                        <div className="text-5xl font-bold text-[var(--accent)] mb-2">{feedback.score}</div>
                        <div className="text-sm text-[var(--text-muted)] uppercase tracking-wider">Overall Score</div>
                    </div>
                    <div className="col-span-2 bg-white/5 rounded-3xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-3">Summary</h3>
                        <p className="text-[var(--text-muted)] leading-relaxed">{feedback.feedback}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-green-500/5 rounded-3xl p-6 border border-green-500/10">
                        <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                            <span>💪</span> Strengths
                        </h3>
                        <ul className="space-y-3">
                            {feedback.strengths.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-white/80">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-orange-500/5 rounded-3xl p-6 border border-orange-500/10">
                        <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                            <span>🎯</span> Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {feedback.weaknesses.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-white/80">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-blue-500/5 rounded-3xl p-6 border border-blue-500/10 mb-8">
                    <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <span>🚀</span> Action Plan
                    </h3>
                    <div className="space-y-4">
                        {feedback.improvement_plan.map((step, i) => (
                            <div key={i} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <p className="text-white/90">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onEnd}
                    className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[var(--primary)]/20"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (generatingFeedback) {
        return (
            <div className="glass-panel rounded-[2.5rem] max-w-2xl w-full p-12 border border-white/10 shadow-2xl animate-fade-in flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-4xl">🧠</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Analyzing Interview...</h2>
                <p className="text-[var(--text-muted)]">Our AI is reviewing your answers and generating a detailed report.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-[2.5rem] max-w-6xl w-full h-[90vh] flex flex-col border border-white/10 shadow-2xl relative overflow-hidden animate-fade-in">
            {/* Header & Avatar */}
            <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center relative overflow-hidden">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-3xl shadow-lg relative z-10 transition-transform ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
                            🤖
                        </div>
                        {isSpeaking && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-50 animate-ping"></div>
                                <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-30 animate-ping delay-150"></div>
                            </>
                        )}
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg">AI Interviewer</h3>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                            {isSpeaking ? (
                                <span className="text-[var(--accent)] animate-pulse">● Speaking...</span>
                            ) : (
                                <span>{setupData.role} • {setupData.experience}</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Webcam Feed (Picture-in-Picture style) */}
                <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg bg-black/50">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-white">YOU</span>
                    </div>
                </div>

                <button
                    onClick={handleEndSession}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-bold ml-4"
                >
                    End Session
                </button>
            </div>

            {/* Permission Error Banner */}
            {permissionError && (
                <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3 text-red-400">
                        <span className="text-xl">⚠️</span>
                        <p className="text-sm font-medium">{permissionError}</p>
                    </div>
                    <button
                        onClick={() => setPermissionError(null)}
                        className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-5 rounded-3xl text-lg leading-relaxed ${msg.role === 'user'
                                ? 'bg-[var(--primary)] text-white rounded-tr-none shadow-[0_5px_15px_rgba(124,58,237,0.3)]'
                                : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 px-6 py-4 rounded-3xl rounded-tl-none border border-white/5 flex gap-2 items-center">
                            <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-black/20">
                <div className="relative flex gap-4">
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-4 rounded-2xl transition-all ${isListening
                            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                            : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white'
                            }`}
                        title="Toggle Microphone"
                    >
                        🎤
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type your answer..."}
                        className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="px-6 py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/20"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

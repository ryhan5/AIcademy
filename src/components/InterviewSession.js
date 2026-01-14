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
                setPermissionError("Camera access denied.");
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
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setPermissionError("Microphone access denied.");
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
        } finally {
            setGeneratingFeedback(false);
        }
    };

    if (feedback) {
        return (
            <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] max-w-5xl w-full p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 border-b border-white/5 pb-8">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">
                            Session Complete
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight">Performance Report</h2>
                        <p className="text-gray-500 mt-2 font-medium">{setupData.role} • {setupData.experience}</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center min-w-[120px]">
                        <div className="text-4xl font-black text-white tracking-tighter">{feedback.score}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Score</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="col-span-full bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Synopsis</h3>
                        <p className="text-gray-300 leading-relaxed text-sm font-medium">{feedback.feedback}</p>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Standout Areas
                        </h3>
                        <div className="space-y-3">
                            {feedback.strengths.map((point, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl text-sm text-gray-300">
                                    {point}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Growth Opportunities
                        </h3>
                        <div className="space-y-3">
                            {feedback.weaknesses.map((point, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl text-sm text-gray-300">
                                    {point}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Recommended Action Plan</h3>
                    <div className="space-y-2">
                        {feedback.improvement_plan.map((step, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-sm text-gray-400 hover:text-gray-200">
                                <span className="font-bold text-white/20">0{i + 1}</span>
                                <span className="font-medium">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-white/5 pt-8">
                    <button onClick={onEnd} className="px-8 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    if (generatingFeedback) {
        return (
            <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] p-16 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white animate-spin mb-8"></div>
                <h3 className="text-xl font-black text-white tracking-widest uppercase mb-2">Analyzing Session</h3>
                <p className="text-gray-500 font-medium text-sm">Synthesizing performance metrics and feedback...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] max-w-6xl w-full h-[85vh] flex flex-col border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500">
            {/* Minimal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500/20'}`}></div>
                    <div>
                        <h3 className="font-bold text-white text-sm tracking-tight">AI Interviewer</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isSpeaking ? 'Speaking' : 'Listening'}</p>
                    </div>
                </div>

                <button
                    onClick={handleEndSession}
                    className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    End Session
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Clean Video Feed */}
                <div className="hidden md:flex md:w-[35%] border-r border-white/5 p-6 flex-col justify-center bg-black/20">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative shadow-2xl">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1] opacity-70"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-md border border-white/10 text-[9px] font-black text-white/60 uppercase tracking-widest">
                                REC
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 px-4">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 text-center">Session Controls & Context</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                <div className="text-xl font-bold text-white mb-1">{setupData.experience}</div>
                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Level</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                <div className="text-xl font-bold text-white mb-1">{setupData.role}</div>
                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Role</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-transparent relative">
                    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 scrollbar-hide">
                        <div className="flex justify-center mb-8">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Session Started</span>
                        </div>

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed font-medium ${msg.role === 'user'
                                    ? 'bg-white text-black rounded-br-sm shadow-xl'
                                    : 'bg-white/5 text-gray-300 rounded-bl-sm border border-white/10'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/5 flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Minimal Input Area */}
                    <div className="p-6 bg-white/[0.02] border-t border-white/5">
                        <form onSubmit={handleSend} className="relative flex gap-4">
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${isListening
                                    ? 'bg-red-500/20 text-red-500 border-red-500/30'
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {isListening ? '⏹️' : '🎤'}
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your response..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-medium"
                            />

                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="px-6 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

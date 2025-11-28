'use client';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

export default function MentorChat({ topic, chapter, videoContext, onClose }) {

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi! I'm your AI Mentor for **${topic}**. I'm here to help you understand "${chapter.title}". Ask me anything!`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [permissionError, setPermissionError] = useState(null);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    const handleCaptureScreen = async () => {
        if (isCapturing || isLoading) return;
        setIsCapturing(true);

        try {
            if (chatContainerRef.current) chatContainerRef.current.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(document.body, {
                useCORS: true,
                ignoreElements: (element) => element.classList.contains('mentor-chat-container')
            });

            if (chatContainerRef.current) chatContainerRef.current.style.opacity = '1';

            let finalCanvas = canvas;
            const MAX_WIDTH = 1280;
            if (canvas.width > MAX_WIDTH) {
                const scale = MAX_WIDTH / canvas.width;
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = MAX_WIDTH;
                tempCanvas.height = canvas.height * scale;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                finalCanvas = tempCanvas;
            }

            const imageBase64 = finalCanvas.toDataURL('image/jpeg', 0.5);

            setMessages(prev => [...prev, {
                role: 'user',
                content: "👁️ [Shared Screen] Can you explain what's on my screen right now?"
            }]);

            setIsLoading(true);

            const response = await fetch('/api/ai-mentor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Analyze this screen capture. Explain any code, diagrams, or educational content visible.",
                    history: messages.filter(m => m.role !== 'system'),
                    context: {
                        topic,
                        chapterTitle: chapter.title,
                        videoTitle: videoContext?.title

                    },
                    image: imageBase64
                })
            });

            const data = await response.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                speakText(data.reply);
            } else {
                throw new Error('No reply received');
            }

        } catch (error) {
            console.error('Screen capture error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't see the screen clearly. Please try again." }]);
            if (chatContainerRef.current) chatContainerRef.current.style.opacity = '1';
        } finally {
            setIsCapturing(false);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        window.speechSynthesis.cancel();

        try {
            const response = await fetch('/api/ai-mentor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.filter(m => m.role !== 'system'),
                    context: {
                        topic,
                        chapterTitle: chapter.title,
                        videoTitle: videoContext?.title

                    }
                })
            });

            const data = await response.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                speakText(data.reply);
            } else {
                throw new Error('No reply received');
            }
        } catch (error) {
            console.error('Mentor chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={chatContainerRef} className="mentor-chat-container flex flex-col h-full bg-transparent w-full">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--primary)]/20 transition-transform ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
                            AI
                        </div>
                        {isSpeaking && (
                            <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-50 animate-ping"></div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1b26]"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">AI Mentor</h3>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            {isSpeaking ? (
                                <span className="text-[var(--accent)] animate-pulse">● Speaking...</span>
                            ) : (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Online & Ready
                                </>
                            )}
                        </p>

                    </div>
                </div>
                <button
                    onClick={() => { window.speechSynthesis.cancel(); onClose(); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-all"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                        <div className={`text-[10px] text-[var(--text-muted)] mb-1 px-1`}>
                            {msg.role === 'user' ? 'You' : 'Mentor'}
                        </div>
                        <div
                            className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-lg ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-[var(--primary)] to-purple-600 text-white rounded-tr-none'
                                : 'bg-white/10 backdrop-blur-md text-white rounded-tl-none border border-white/5'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col items-start animate-fade-in">
                        <div className="text-[10px] text-[var(--text-muted)] mb-1 px-1">Mentor</div>
                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 border border-white/5 flex gap-1.5 items-center">
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Permission Error */}
            {permissionError && (
                <div className="px-5 pb-2">
                    <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-red-400">{permissionError}</span>
                        <button onClick={() => setPermissionError(null)} className="text-xs text-red-400 hover:text-white">✕</button>
                    </div>
                </div>
            )}

            {/* Input Command Center */}
            <div className="p-5 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity blur-md"></div>
                    <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl p-1.5 transition-colors group-focus-within:border-[var(--primary)]/50">
                        <button
                            type="button"
                            onClick={handleCaptureScreen}
                            disabled={isCapturing || isLoading}
                            className={`p-2.5 rounded-lg transition-all ${isCapturing
                                ? 'bg-red-500/20 text-red-400 animate-pulse'
                                : 'hover:bg-white/10 text-[var(--text-muted)] hover:text-white'
                                }`}
                            title="Share Screen with AI"
                        >
                            {isCapturing ? '📷' : '👁️'}
                        </button>

                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`p-2.5 rounded-lg transition-all ml-1 ${isListening
                                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                : 'hover:bg-white/10 text-[var(--text-muted)] hover:text-white'
                                }`}
                            title="Voice Input"
                        >
                            🎤
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask anything..."}
                            className="flex-1 bg-transparent border-none text-sm text-white placeholder-[var(--text-muted)] px-3 focus:outline-none h-10"
                        />

                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="p-2.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--primary)]/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

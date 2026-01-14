'use client';
import { useState, useRef, useEffect } from 'react';

export default function ProjectMentorChat({ project, onClose, triggerMessage }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi! I'm your Tech Lead for **${project.title}**. \n\nI've reviewed the mission brief. How can I help you get started?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle external triggers (e.g., "Guide Me" buttons)
    useEffect(() => {
        if (triggerMessage) {
            sendMessage(triggerMessage);
        }
    }, [triggerMessage]);

    const sendMessage = async (content) => {
        if (!content.trim() || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', content }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/project-mentor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    history: messages.filter(m => m.role !== 'system'),
                    context: {
                        projectTitle: project.title,
                        mission: project.missionBrief,
                        techStack: project.techStack
                    }
                })
            });

            const data = await response.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                throw new Error('No reply received');
            }
        } catch (error) {
            console.error('Mentor chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Check your connection?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        await sendMessage(msg);
    };

    return (
        <div className="flex flex-col h-full bg-[#111] border-l border-white/10 w-full md:w-[400px]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--primary)] to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        TL
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Tech Lead</h3>
                        <p className="text-[10px] text-[var(--accent)] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}
                    >
                        <div className={`max-w-[90%] rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                            ? 'bg-[var(--primary)] text-white rounded-tr-none'
                            : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start">
                        <div className="bg-white/10 rounded-xl rounded-tl-none p-3 border border-white/5 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your project..."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--primary)] rounded-md text-white hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

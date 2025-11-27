'use client';
import { useState, useEffect } from 'react';

export default function XPNotification({ xp, reason, onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setVisible(true), 100);

        // Auto-dismiss after 3 seconds
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose && onClose(), 300);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!xp) return null;

    return (
        <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className="glass-panel p-4 rounded-lg border-2 border-[var(--primary)] shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">✨</div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--primary)]">+{xp} XP</p>
                        {reason && <p className="text-sm text-[var(--text-muted)]">{reason}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

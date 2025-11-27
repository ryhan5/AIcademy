'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getUserProgress, saveProgress, getDefaultProgress } from '@/utils/UserProgress';

const UserContext = createContext();

export function UserProvider({ children }) {
    const { data: session, status } = useSession();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load progress
    useEffect(() => {
        async function loadProgress() {
            if (status === 'loading') return;

            if (status === 'authenticated' && session?.user) {
                // Fetch from DB
                try {
                    const res = await fetch('/api/user/progress');
                    if (res.ok) {
                        const dbData = await res.json();
                        // Optional: Merge strategy could go here. For now, DB wins if logged in.
                        setProgress(dbData);
                    } else {
                        // Fallback to local if API fails
                        console.warn("Failed to fetch user progress from DB, falling back to local");
                        setProgress(getUserProgress());
                    }
                } catch (error) {
                    console.error("Failed to load user progress", error);
                    setProgress(getUserProgress());
                }
            } else {
                // Guest: Load from LocalStorage
                setProgress(getUserProgress());
            }
            setLoading(false);
        }

        loadProgress();
    }, [status, session]);

    // Sync back to storage/DB on change
    const updateProgress = (newProgress) => {
        setProgress(newProgress);

        // Always save to local for redundancy/guest
        if (typeof window !== 'undefined') {
            localStorage.setItem('skillsync_user_progress', JSON.stringify(newProgress));
        }

        // If logged in, also save to DB
        if (status === 'authenticated') {
            // fire and forget or await
            fetch('/api/user/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProgress),
            }).catch(err => console.error("Failed to sync to DB", err));
        }
    };

    return (
        <UserContext.Provider value={{ progress, updateProgress, loading, user: session?.user }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}

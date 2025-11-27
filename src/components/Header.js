'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { isUserVerified } from '@/utils/UserProgress';

export default function Header() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [scrolled, setScrolled] = useState(false);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Check verification status
        const checkVerification = () => {
            setVerified(isUserVerified());
        };
        checkVerification();
        // Poll for changes (simple way to keep sync without context)
        const interval = setInterval(checkVerification, 2000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    const navItems = [
        { name: 'Roadmap', path: '/roadmap' },
        { name: 'Courses', path: '/course' },
        { name: 'Quiz', path: '/quiz' },
        { name: 'Interview', path: '/interview' },
        { name: 'Dashboard', path: '/dashboard' },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className={`glass-panel rounded-full px-6 py-3 flex items-center justify-between border border-white/10 transition-all duration-300 ${scrolled ? 'bg-black/40 backdrop-blur-xl shadow-lg' : 'bg-transparent border-transparent'}`}>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(124,58,237,0.3)] group-hover:scale-110 transition-transform">
                            S
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight group-hover:text-white/90 transition-colors">
                            SkillSync
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group ${isActive
                                        ? 'text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                                        : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 blur-sm"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {status === 'authenticated' ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 group relative"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[10px] font-bold text-white">
                                        {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-white group-hover:text-[var(--primary)] transition-colors">
                                        {session.user.name || 'Profile'}
                                    </span>
                                    {verified && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white border border-black shadow-lg animate-pulse-slow" title="Verified Developer">
                                            ✓
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

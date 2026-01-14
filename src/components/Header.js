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

        const checkVerification = () => {
            setVerified(isUserVerified());
        };
        checkVerification();
        const interval = setInterval(checkVerification, 2000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    const navItems = [
        { name: 'Roadmap', path: '/roadmap' },
        { name: 'Courses', path: '/course' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'Quiz', path: '/quiz' },
        { name: 'Interview', path: '/interview' },
        { name: 'Dashboard', path: '/dashboard' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled
                ? 'bg-[#050505]/80 backdrop-blur-md border-b border-transparent py-4'
                : 'bg-transparent border-b border-transparent py-8'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">

                {/* Logo: Clean & Bold */}
                <Link href="/" className="group relative z-10">
                    <span className="font-black text-2xl text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
                        AIcademy
                        <span className="text-purple-500 group-hover:text-white transition-colors">.</span>
                    </span>
                </Link>

                {/* Navigation: Minimal Text */}
                <nav className="hidden md:flex items-center gap-8 relative z-10">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`text-sm font-bold tracking-wide transition-colors duration-300 relative group/link ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {item.name}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions: Refined */}
                <div className="flex items-center gap-6 relative z-10">
                    {status === 'authenticated' ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="hidden sm:flex items-center gap-3 group"
                            >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border bg-white/5 text-white text-[10px] font-black transition-all duration-300 ${verified ? 'border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-white/10 group-hover:border-white/30'}`}>
                                    {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                                </div>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="pl-4 border-l border-white/10 text-sm font-bold text-white hover:text-purple-400 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

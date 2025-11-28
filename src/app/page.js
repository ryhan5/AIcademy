'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const features = [
        {
            title: 'Precision Guidance',
            description: 'Transform career goals into weekly AI-assisted sprints with milestones that adapt to your progress.',
            link: '/roadmap',
            icon: '🗺️',
            size: 'large', // spans 2 cols, 2 rows
            gradient: 'from-violet-600/20 via-transparent to-teal-400/10',
            points: ['Adaptive pacing', 'Focus blocks', 'Outcome metrics']
        },
        {
            title: 'Build, Don\'t Cram',
            description: 'Project-based learning with instant AI feedback on your code.',
            link: '/course',
            icon: '💻',
            size: 'normal',
            gradient: 'from-blue-500/20 via-transparent to-purple-500/10'
        },
        {
            title: 'Motivation Engine',
            description: 'Gamified streaks, XP bursts, and community challenges.',
            link: '/dashboard',
            icon: '🔥',
            size: 'normal',
            gradient: 'from-emerald-500/20 via-transparent to-blue-500/10'
        },
        {
            title: 'Skill Assessment',
            description: 'Verify your skills with adaptive quizzes that pinpoint your gaps.',
            link: '/quiz',
            icon: '🎯',
            size: 'wide', // spans 2 cols
            gradient: 'from-orange-500/20 via-transparent to-red-500/10',
            points: ['Real-time eval', 'Study recs']
        }
    ];

    const stats = [
        { label: 'Active Learners', value: '14k+' },
        { label: 'Courses Generated', value: '62k+' },
        { label: 'Career Switches', value: '3.5k' }
    ];

    const testimonials = [
        {
            quote: 'AIcademy turned my scattered Google Docs into a job-ready workflow in six weeks flat.',
            name: 'Priya N.',
            role: 'Frontend Developer @ Globex'
        },
        {
            quote: 'The AI mentor nudged me the moment I stalled. I shipped three data projects in a month.',
            name: 'Marcus L.',
            role: 'Data Analyst @ InsightOps'
        },
        {
            quote: 'I finally maintain a learning rhythm. The streaks + roadmap combo is absolute magic.',
            name: 'Aisha K.',
            role: 'Product Designer (Freelance)'
        }
    ];

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#0a0a0a] selection:bg-[var(--primary)] selection:text-white">
            {/* Dynamic Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--primary)] rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[var(--secondary)] rounded-full blur-[120px] opacity-20 animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-30"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 hover:border-white/20 transition-colors cursor-default shadow-[0_0_20px_rgba(124,58,237,0.1)] backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                        <span className="text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">The Career Accelerator</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-8 leading-[1.1]">
                        Accelerate your career with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] animate-gradient-x">
                            intelligent acceleration
                        </span>
                    </h1>

                    <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed">
                        Stop consuming random tutorials. Start building with adaptive roadmaps,
                        AI-generated projects, and a motivation engine designed for high-performers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Link
                            href="/roadmap"
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
                        >
                            <span className="relative z-10">Start the journey</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                        </Link>
                        <Link
                            href="/course"
                            className="px-8 py-4 bg-white/5 backdrop-blur-md text-white rounded-full font-bold text-lg border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
                        >
                            Explore Courses
                        </Link>
                    </div>
                </div>

                {/* Hero Stats */}
                <div className={`mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 border-t border-white/5 pt-10 transition-all duration-1000 delay-300 w-full max-w-4xl ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
                            <span className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</span>
                            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to level up</h2>
                    <p className="text-[var(--text-muted)] text-lg">A complete ecosystem for your professional growth.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {features.map((feature, idx) => (
                        <Link
                            key={feature.title}
                            href={feature.link}
                            className={`group relative bg-[#0a0a0a]/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden
                ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${feature.size === 'wide' ? 'md:col-span-2' : ''}
              `}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-lg">
                                        {feature.icon}
                                    </div>
                                    <h3 className={`font-bold text-white mb-3 ${feature.size === 'large' ? 'text-3xl' : 'text-xl'}`}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-[var(--text-muted)] text-lg leading-relaxed max-w-md">
                                        {feature.description}
                                    </p>

                                    {feature.points && (
                                        <ul className="mt-6 space-y-2">
                                            {feature.points.map((point, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                                                    <span className="text-[var(--primary)]">✓</span> {point}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-[var(--accent)] font-semibold mt-8 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    Explore Feature <span className="text-xl">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Testimonials Section (Glass Cards) */}
            <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What learners say</h2>
                    <p className="text-lg text-[var(--text-muted)]">
                        Join a community of builders turning ambition into outcomes.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={testimonial.name}
                            className="bg-[#0a0a0a]/40 backdrop-blur-lg rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:bg-white/5"
                        >
                            <div className="flex items-center gap-1 text-[var(--accent)] text-sm mb-6">
                                {Array.from({ length: 5 }).map((_, starIdx) => (
                                    <span key={starIdx}>★</span>
                                ))}
                            </div>
                            <p className="text-lg text-white leading-relaxed mb-8 italic opacity-90">&ldquo;{testimonial.quote}&rdquo;</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center font-bold text-white text-sm">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div className="text-sm">
                                    <div className="font-bold text-white">{testimonial.name}</div>
                                    <div className="text-[var(--text-muted)]">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to accelerate?</h2>
                    <p className="text-xl text-[var(--text-muted)] mb-12">
                        Join thousands of developers who are building their future with AIcademy.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-[var(--primary)]/25 hover:scale-105"
                        >
                            Create Free Account
                        </Link>
                    </div>
                    <p className="mt-8 text-sm text-[var(--text-muted)]">
                        No credit card required • Free tier available forever
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl pt-16 pb-8 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="text-2xl font-black text-white mb-4 tracking-tighter">AIcademy.</div>
                        <p className="text-sm text-[var(--text-muted)]">
                            The AI-powered career accelerator for modern developers.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                            <li><Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
                            <li><Link href="/course" className="hover:text-white transition-colors">Courses</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 text-center text-sm text-[var(--text-muted)]">
                    © {new Date().getFullYear()} AIcademy Inc. All rights reserved.
                </div>
            </footer>
        </main>
    );
}

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
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            ),
            size: 'large', // spans 2 cols
            gradient: 'from-violet-600/20 via-transparent to-teal-400/10',
            points: ['Adaptive pacing & focus blocks', 'Weekly retrospective summaries', 'Goal tracking with outcome metrics']
        },
        {
            title: 'Build, Don\'t Cram',
            description: 'Project-based learning with instant AI feedback on your code.',
            link: '/course',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            size: 'normal',
            gradient: 'from-blue-500/20 via-transparent to-purple-500/10'
        },
        {
            title: 'Motivation Engine',
            description: 'Gamified streaks, XP bursts, and community challenges to keep you shipping.',
            link: '/dashboard',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            size: 'normal',
            gradient: 'from-emerald-500/20 via-transparent to-blue-500/10'
        },
        {
            title: 'Skill Assessment',
            description: 'Verify your skills with adaptive quizzes that pinpoint your gaps.',
            link: '/quiz',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            size: 'wide', // spans 2 cols
            gradient: 'from-orange-500/20 via-transparent to-red-500/10',
            points: ['Real-time code evaluation', 'Personalized study recommendations']
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

    const journeySteps = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            title: 'Set your north star',
            description: 'Tell AIcademy where you want to go and when. We blueprint a realistic path that flexes with life.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            title: 'Sprint with clarity',
            description: 'Consume micro-lessons, build portfolio-worthy projects, and let AI tutors unblock you.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            title: 'Track momentum',
            description: 'Stay in flow with streaks, weekly retros, and adaptive adjustments based on your velocity.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            ),
            title: 'Showcase & level up',
            description: 'Publish your verified progress hub and unlock curated job matches tailored to your new skills.'
        }
    ];

    const trustedCompanies = [
        'Google', 'Meta', 'Amazon', 'Netflix', 'Microsoft', 'Spotify', 'Uber', 'Airbnb'
    ];

    return (
        <main className="min-h-screen relative overflow-hidden bg-[var(--bg-dark)] selection:bg-[var(--primary)] selection:text-white">
            {/* Dynamic Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--primary)] rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[var(--secondary)] rounded-full blur-[120px] opacity-20 animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-30"></div>

                {/* Floating Code Snippets (Decorative) */}
                <div className="absolute top-[15%] left-[5%] p-4 glass-card rounded-xl opacity-10 rotate-[-6deg] animate-float hidden lg:block">
                    <pre className="text-xs text-[var(--primary)]"><code>git commit -m "feat: level up"</code></pre>
                </div>
                <div className="absolute top-[20%] right-[8%] p-4 glass-card rounded-xl opacity-10 rotate-[12deg] animate-float delay-700 hidden lg:block">
                    <pre className="text-xs text-[var(--accent)]"><code>npm run build:career</code></pre>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-white/10 mb-8 hover:border-white/20 transition-colors cursor-default shadow-[0_0_20px_rgba(124,58,237,0.1)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                        <span className="text-sm font-medium text-[var(--text-muted)] tracking-wide">THE CAREER ACCELERATOR</span>
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
                            className="px-8 py-4 glass-card text-white rounded-full font-bold text-lg border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
                        >
                            Explore Courses
                        </Link>
                    </div>
                </div>

                {/* Hero Stats */}
                <div className={`mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 border-t border-white/5 pt-10 transition-all duration-1000 delay-300 w-full max-w-4xl ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <span className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</span>
                            <span className="text-sm text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-12 border-y border-white/5 bg-black/20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-8">Trusted by builders at</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {trustedCompanies.map((company) => (
                            <span key={company} className="text-xl md:text-2xl font-black text-white hover:text-[var(--primary)] transition-colors cursor-default">
                                {company}
                            </span>
                        ))}
                    </div>
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
                            className={`group relative glass-panel rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden
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

                            {/* Decorative Elements for Large Cards */}
                            {feature.size === 'large' && (
                                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-l from-[var(--bg-dark)] to-transparent z-10"></div>
                                    <div className="w-full h-full border-l border-t border-white/10 rounded-tl-3xl bg-white/5 backdrop-blur-sm transform translate-y-10 translate-x-10"></div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </section>

            {/* Journey Section */}
            <section className="py-24 border-t border-white/5 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-16">
                        <div className="sticky top-24 h-fit">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Your learning journey, choreographed</h2>
                            <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                                AIcademy keeps momentum high—from the moment you set a goal to the day you land your next role.
                                Each step is supported with automation, insights, and community energy.
                            </p>
                            <Link href="/roadmap" className="inline-flex items-center gap-2 text-[var(--primary)] font-bold hover:gap-3 transition-all">
                                Start Your Journey <span>→</span>
                            </Link>
                        </div>
                        <div className="space-y-12 relative">
                            <div className="absolute left-[23px] top-8 bottom-8 w-px bg-gradient-to-b from-[var(--primary)] to-transparent opacity-30"></div>
                            {journeySteps.map((step, idx) => (
                                <div key={step.title} className="relative flex gap-8 group">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-lg font-bold text-white border border-white/10 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)]/20 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 glass-panel rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/5">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-2xl">{step.icon}</span>
                                            <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                                        </div>
                                        <p className="text-[var(--text-muted)] leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="glass-panel rounded-[3rem] p-8 md:p-16 border border-white/10 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/10 to-transparent opacity-50"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Join the Builder Community</h2>
                        <p className="text-xl text-[var(--text-muted)] mb-10">
                            Connect with 14,000+ developers shipping projects, sharing wins, and leveling up together.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                            {['🚀 500+ Projects Shipped', '💬 24/7 Code Help', '🤝 Career Networking'].map((tag) => (
                                <span key={tag} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <button className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-2 mx-auto">
                            <span>Join Discord</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
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
                            className="glass-panel rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:bg-white/5"
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
            <section className="py-24 px-6 lg:px-8 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--primary)]/5"></div>
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
            <footer className="border-t border-white/5 bg-black/20 pt-16 pb-8 px-6 lg:px-8">
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

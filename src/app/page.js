'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
          const duration = 2000;
          const steps = 60;
          const increment = numValue / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= numValue) {
              setCount(numValue);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const displayValue = value.includes('k')
    ? `${count.toFixed(1)}k`
    : value.includes('%')
      ? `${Math.round(count)}%`
      : Math.round(count).toString();

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

// Floating Orb Component
function FloatingOrb({ className, style }) {
  return (
    <div
      className={`orb ${className}`}
      style={style}
    />
  );
}

// Feature Card with 3D tilt
function FeatureCard({ title, desc, icon, gradient, delay = 0 }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.08] p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]"
      style={{
        transitionDelay: `${delay}ms`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Gradient glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />

      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:border-white/20 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, desc, isLast }) {
  return (
    <div className="relative flex gap-6">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent" />
      )}

      {/* Number badge */}
      <div className="relative z-10 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{number}</span>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl opacity-50 animate-glow-pulse" />
      </div>

      {/* Content */}
      <div className="pb-12">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Testimonial Card
function TestimonialCard({ quote, name, role, avatar }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.08] p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06] min-w-[400px] max-w-[400px]">
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-[-2px] rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-border-flow" style={{ backgroundSize: '200% 200%' }} />
      </div>

      <div className="relative z-10">
        {/* Quote icon */}
        <div className="text-purple-500/30 text-5xl font-serif mb-4">"</div>

        <p className="text-gray-300 text-base leading-relaxed mb-6">{quote}</p>

        <div className="flex items-center gap-4">
          {/* Avatar with animated ring */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {avatar}
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-spin-slow" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
          </div>

          <div>
            <div className="font-bold text-white">{name}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const stats = [
    { value: '9.4k+', label: 'Active Learners' },
    { value: '1.8k+', label: 'Projects Shipped' },
    { value: '71%', label: 'Offer Rate' },
  ];

  const features = [
    {
      title: 'AI-Powered Roadmaps',
      desc: 'Personalized weekly plans that adapt as you progress—built from real AI career paths, not generic playlists.',
      icon: '🗺️',
      gradient: 'from-purple-500/10 via-transparent to-transparent',
    },
    {
      title: 'Portfolio Labs',
      desc: 'Ship portfolio-grade projects with checkpoints, mentor reviews, and deployment guides.',
      icon: '🚀',
      gradient: 'from-blue-500/10 via-transparent to-transparent',
    },
    {
      title: 'Interview Simulator',
      desc: 'Practice with AI-powered mock interviews and get instant feedback on your responses.',
      icon: '🎯',
      gradient: 'from-cyan-500/10 via-transparent to-transparent',
    },
    {
      title: 'Career Dashboard',
      desc: 'Track your progress, streaks, XP, and portfolio completion in one powerful dashboard.',
      icon: '📊',
      gradient: 'from-emerald-500/10 via-transparent to-transparent',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Diagnose Your Gaps',
      desc: 'Take a quick assessment to discover exactly what skills you need to reach your target role.',
    },
    {
      number: '02',
      title: 'Build & Ship Projects',
      desc: 'Complete portfolio-grade projects with AI mentorship, checkpoints, and peer reviews.',
    },
    {
      number: '03',
      title: 'Get Hired',
      desc: 'Ace interviews with our simulator and let your verified portfolio speak for itself.',
    },
  ];

  const testimonials = [
    {
      quote: 'AIcademy gave me structure + output. I stopped consuming content and started shipping proof that recruiters actually wanted to see.',
      name: 'Ananya S.',
      role: 'Product → AI Engineer',
      avatar: 'A',
    },
    {
      quote: 'The roadmap + labs loop is addictive. The dashboard made it obvious what to do next and what to ignore completely.',
      name: 'Marcus T.',
      role: 'Data Analyst → ML Engineer',
      avatar: 'M',
    },
    {
      quote: 'I went from tutorial hell to shipping 3 portfolio projects in 2 months. The interview prep was a game changer.',
      name: 'Priya K.',
      role: 'Bootcamp → AI Startup',
      avatar: 'P',
    },
  ];

  return (
    <main className="min-h-screen bg-[#030303] selection:bg-purple-500/30 relative overflow-hidden">
      {/* Premium Mesh Background - Matching other pages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow [animation-delay:1s]"></div>

        {/* Visual Density Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>


      <div className="relative z-10 px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">

          {/* ============ HERO SECTION ============ */}
          <section ref={heroRef} className="relative pt-16 lg:pt-28 pb-20">
            {/* Mouse follow glow */}
            <div
              className="pointer-events-none absolute w-[500px] h-[500px] rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                left: mousePos.x - 250,
                top: mousePos.y - 250,
                transition: 'left 0.3s ease-out, top 0.3s ease-out',
              }}
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border border-fuchsia-500/20 backdrop-blur-xl mb-8 animate-fade-in-up">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  AIcademy · The Career Accelerator
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <span className="text-white">Stop watching tutorials.</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">Start building proof.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                AI-powered roadmaps, portfolio labs, and interview prep—designed to turn learning into <span className="text-cyan-400 font-semibold">job offers</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center rounded-2xl px-8 py-4 text-white font-bold text-sm uppercase tracking-wider overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-[length:200%_100%] animate-gradient-x" />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Your Journey
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>

                <Link
                  href="/roadmap"
                  className="group inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/[0.05] backdrop-blur-xl px-8 py-4 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/[0.12] hover:border-fuchsia-500/30 transition-all"
                >
                  Explore Roadmaps
                  <span className="ml-2 text-fuchsia-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">↗</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="relative group rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-xl hover:bg-white/[0.06] hover:border-fuchsia-500/20 transition-all"
                  >
                    <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight mb-1">
                      <AnimatedCounter value={stat.value} />
                      {stat.value.includes('+') && <span className="text-fuchsia-400">+</span>}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                      {stat.label}
                    </div>
                  </div>

                ))}
              </div>
            </div>
          </section>

          {/* ============ FEATURES BENTO GRID ============ */}
          <section className="py-20 lg:py-28">
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">
                Everything You Need
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                One platform. Total transformation.
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                From confused learner to job-ready professional—with proof.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                  delay={index * 100}
                />
              ))}
            </div>
          </section>

          {/* ============ HOW IT WORKS ============ */}
          <section className="py-20 lg:py-28">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
              {/* Left side - Text */}
              <div className="lg:sticky lg:top-32">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">
                  How It Works
                </p>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                  A simple loop that compounds.
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Each cycle produces proof: projects, writeups, and interview clarity. Your portfolio grows automatically.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-white font-bold hover:text-purple-400 transition-colors"
                >
                  See your dashboard
                  <span className="text-xl">↗</span>
                </Link>
              </div>

              {/* Right side - Steps */}
              <div className="relative">
                <div className="relative pl-2">
                  {steps.map((step, index) => (
                    <StepCard
                      key={step.number}
                      {...step}
                      isLast={index === steps.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ============ TESTIMONIALS ============ */}
          <section className="py-20 lg:py-28 overflow-hidden">
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">
                Success Stories
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Built for people who ship.
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Join thousands who turned learning into career momentum.
              </p>
            </div>

            {/* Scrolling testimonials */}
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.name} className="snap-center">
                    <TestimonialCard {...testimonial} />
                  </div>
                ))}
              </div>

              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-6 w-20 bg-gradient-to-r from-[#030303] to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-6 w-20 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none" />
            </div>
          </section>

          {/* ============ CTA SECTION ============ */}
          <section className="py-20">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
              {/* Aurora background */}
              <div className="absolute inset-0 aurora-bg opacity-50" />

              {/* Animated gradient border glow */}
              <div className="absolute inset-0 rounded-[3rem] opacity-30">
                <div className="absolute inset-[-1px] rounded-[3rem] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-sm" />
              </div>

              <div className="relative z-10 p-12 sm:p-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] mb-8">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Join 9,400+ learners</span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
                  Ready to accelerate?
                </h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                  Create your account, pick a roadmap, and start building proof of work that recruiters can&apos;t ignore.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="group relative inline-flex items-center justify-center rounded-2xl bg-white text-black font-bold text-sm uppercase tracking-wider px-10 py-5 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Create Free Account
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-10 py-5 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/[0.08] hover:border-white/20 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ============ FOOTER ============ */}
          <footer className="pt-20 pb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-lg">AIcademy<span className="text-purple-500">.</span></span>
              </div>
              <div className="flex items-center gap-8">
                <Link href="/roadmap" className="hover:text-white transition-colors">Roadmaps</Link>
                <Link href="/course" className="hover:text-white transition-colors">Courses</Link>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              </div>
              <div className="text-gray-600">
                © 2026 AIcademy. Built for builders.
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main >
  );
}

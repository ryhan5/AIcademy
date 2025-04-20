'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '../i18n'; // Import i18n setup

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLangSelect = (lng) => {
    i18n.changeLanguage(lng);
    setShowLangMenu(false);
  }
  // const { data: session } = useSession(); // Removed next-auth
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [careerIndex, setCareerIndex] = useState(0);
  const careers = ['Data Science', 'Web Development', 'AI Engineering', 'Digital Marketing'];
  const typeSpeed = 150; // Speed of typing
  const deleteSpeed = 75; // Speed of deleting
  const pauseTime = 2000; // Pause time after completing a word

  useEffect(() => {
    let timeoutId;
    let currentText = '';

    const typeText = () => {
      const currentCareer = careers[careerIndex];

      if (!isDeleting && currentText.length < currentCareer.length) {
        currentText += currentCareer.charAt(currentText.length);
        setTypedText(currentText);
        timeoutId = setTimeout(typeText, typeSpeed);
      } 
      else if (isDeleting && currentText.length > 0) {
        currentText = currentText.slice(0, -1);
        setTypedText(currentText);
        timeoutId = setTimeout(typeText, deleteSpeed);
      } 
      else if (!isDeleting && currentText.length === currentCareer.length) {
        setIsDeleting(true);
        timeoutId = setTimeout(typeText, pauseTime);
      } 
      else {
        setIsDeleting(false);
        setCareerIndex((prev) => (prev + 1) % careers.length);
        timeoutId = setTimeout(typeText, typeSpeed);
      }
    };

    timeoutId = setTimeout(typeText, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [careerIndex, isDeleting]);

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-12 pb-12">
        {/* Language Switcher - Floating Button with Popover */}
        <div>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all focus:outline-none"
            aria-label="Change Language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 18.523 2 13 6.477 3 12 3zm0 0v18m0-18C7.477 3 3 7.477 3 13c0 5.523 4.477 10 9 10m0-18c4.523 0 9 4.477 9 10 0 5.523-4.477 10-9 10" />
            </svg>
          </button>
          {showLangMenu && (
            <div className="fixed bottom-24 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex flex-col items-start animate-fade-in">
              <span className="text-gray-700 font-semibold mb-2 ml-1">Change Language</span>
              <button onClick={() => handleLangSelect('en')} className="flex items-center w-40 px-3 py-2 mb-1 rounded hover:bg-blue-50 transition-all">
                <span role="img" aria-label="English" className="mr-2">🇬🇧</span> English
              </button>
              <button onClick={() => handleLangSelect('hi')} className="flex items-center w-40 px-3 py-2 mb-1 rounded hover:bg-blue-50 transition-all">
                <span role="img" aria-label="Hindi" className="mr-2">🇮🇳</span> हिंदी
              </button>
              <button onClick={() => handleLangSelect('bn')} className="flex items-center w-40 px-3 py-2 rounded hover:bg-blue-50 transition-all">
                <span role="img" aria-label="Bengali" className="mr-2">🇧🇩</span> বাংলা
              </button>
            </div>
          )}
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content Section */}
          <div className="text-center lg:text-left space-y-6">
            {/* Removed session-based conditional rendering */}
            <h1 className="text-2xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              {t('careerTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 min-h-[1.2em] inline-block">
                {typedText || '...'}
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl">
              {t('transformCareer')}
            </p>

            {/* Enhanced CTA Section */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {/* Removed session-based conditional rendering and signin link */}
              <>
                {/* <Link
                  href="/auth/signin" // Removed link to signin
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300"
                >
                  Get Started Free
                </Link> */}
                 <Link
                    href="/dashboard" // Link directly to dashboard
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300"
                  >
                    Get Started Free
                  </Link>
                <Link
                  href="/insights"
                  className="px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold shadow-lg hover:shadow-xl border border-gray-300 hover:border-blue-300 transition-all duration-300"
                >
                  Learn More
                </Link>
              </>
            </div>
          </div>

          {/* Enhanced Image Section */}
          <div className="relative mt-10 lg:mt-20">
            <div className="relative">
              <Image
                src="/hero-image.jpeg"
                alt="Career Development Illustration"
                width={500}
                height={500}
                className="rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                priority
              />

              {/* Enhanced Floating Elements */}
              <div className="absolute top-10 -left-6 p-4 bg-white rounded-full shadow-xl animate-bounce">
                <Image src="/ai-icon.jpeg" alt="AI Icon" width={40} height={40} className="rounded-full" />
              </div>
              
              {/* Add more floating elements */ }
              <div className="absolute bottom-10 right-10 p-3 bg-white rounded-full shadow-xl animate-pulse">
                <svg className="w-6 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div> 
            </div>
          </div>
        </div>
      </div>

      {/* How We Bridge the Skill Gap */}
      <div className="max-w-6xl mx-auto my-24">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30 -ml-32 -mb-32"></div>
          
          <h2 className="text-4xl font-bold text-center mb-12 relative">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Bridge to Tech Excellence
            </span>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4"></div>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {[
              {
                title: "AI-Driven Skill Analysis",
                description: "Our AI engine analyzes market trends and your profile to identify high-impact skills you need to succeed",
                icon: (
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-200 blur-lg opacity-40 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-500 p-5 rounded-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                  </div>
                ),
                features: ["Real-time Skill Gap Analysis", "Market Demand Tracking", "Personalized Learning Path"]
              },
              {
                title: "Hands-on Innovation Lab",
                description: "Build real products using cutting-edge tech stacks while getting feedback from industry experts",
                icon: (
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-200 blur-lg opacity-40 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-5 rounded-2xl transform -rotate-3 hover:rotate-0 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                ),
                features: ["Live Projects", "Expert Code Reviews", "Industry Mentorship"]
              },
              {
                title: "Career Acceleration Hub",
                description: "Access exclusive job opportunities, mock interviews with tech leaders, and salary negotiation support",
                icon: (
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-200 blur-lg opacity-40 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-green-500 to-blue-500 p-5 rounded-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                ),
                features: ["Interview Preparation", "Salary Negotiation", "Career Coaching"]
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 mb-6">{item.description}</p>
                
                {/* Features list */}
                <ul className="space-y-3">
                  {item.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Hover effect button */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="text-blue-600 font-medium flex items-center">
                    Learn More
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom decorative wave */}
          <div className="absolute bottom-0 left-0 w-full h-16 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                    className="fill-current text-blue-600"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats and Benefits Section */}
      <div className="relative mt-24 lg:mt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Statistics */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transform -skew-y-3"></div>
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 mb-24">
              {[
                {
                  value: "10K+",
                  label: "Successful Placements",
                  icon: "👨‍💻",
                  color: "from-blue-600 to-indigo-600"
                },
                {
                  value: "95%",
                  label: "Placement Rate",
                  icon: "📈",
                  color: "from-purple-600 to-pink-600"
                },
                {
                  value: "500+",
                  label: "Partner Companies",
                  icon: "🤝",
                  color: "from-blue-600 to-cyan-600"
                },
                {
                  value: "40%",
                  label: "Salary Increase",
                  icon: "💰",
                  color: "from-green-600 to-teal-600"
                },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-white rounded-2xl transform transition-transform group-hover:scale-105 group-hover:rotate-2"></div>
                  <div className="relative p-8 bg-white rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 group-hover:shadow-2xl border border-gray-100">
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <h3 className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </h3>
                    <p className="text-gray-600 mt-2 font-medium">{stat.label}</p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Journey Path */}
          <div className="relative mt-32 mb-24">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Journey to Success
              </span>
            </h2>
            
            {/* Animated Path Line */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2">
              <div className="h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full"></div>
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-progress"></div>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  title: "Skill Assessment",
                  description: "AI-powered evaluation of your current skills and goals",
                  icon: "🎯",
                  color: "from-blue-500 to-indigo-500"
                },
                {
                  step: "2",
                  title: "Custom Roadmap",
                  description: "Personalized learning path tailored to your career goals",
                  icon: "🗺️",
                  color: "from-indigo-500 to-purple-500"
                },
                {
                  step: "3",
                  title: "Interactive Learning",
                  description: "Hands-on projects and expert-led training sessions",
                  icon: "💡",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  step: "4",
                  title: "Career Launch",
                  description: "Interview prep and direct job placement support",
                  icon: "🚀",
                  color: "from-pink-500 to-rose-500"
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  {/* Connector Lines */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform translate-y-px"></div>
                  )}
                  
                  <div className="relative bg-white p-6 rounded-xl shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                    {/* Step Number */}
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold ring-4 ring-white`}>
                      {item.step}
                    </div>

                    <div className="mt-6 text-center">
                      <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110">{item.icon}</div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>

                    {/* Hover Effect Border */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform rounded-b-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      
      {/* Features and Benefits Section */}
      <div className="mt-16 max-w-7xl mx-auto px-4">
        {/* Success Stories */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Data Scientist at Google",
                image: "/one.jpg",
                quote: "Transformed from marketing to data science in 6 months!",
                increase: "+120% Salary"
              },
              {
                name: "Michael Chen",
                role: "Full Stack Developer",
                image: "/two.jpg",
                quote: "Found my dream job through the platform's network.",
                increase: "+85% Salary"
              },
              {
                name: "Emma Williams",
                role: "AI Engineer at Microsoft",
                image: "/three.jpg",
                quote: "The mentorship program was a game-changer for me.",
                increase: "+150% Salary"
              }
            ].map((story, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg">{story.name}</h3>
                    <p className="text-sm text-gray-200">{story.role}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 italic mb-4">"{story.quote}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-500 font-bold">{story.increase}</span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Read More →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div className="text-center mb-24">
          <h3 className="text-xl text-gray-600 mb-8">{t('trustedBy')}</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {/* Add partner logos here */}
            {['X', 'Y', 'Z', 'W', 'M'].map((partner, index) => (
              <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
                <Image
                  src={`/${partner.toLowerCase()}.jpg`}
                  alt={partner}
                  width={120}
                  height={40}
                  className="h-8 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="relative mb-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl transform -rotate-1"></div>
          <div className="relative bg-white rounded-2xl p-12 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('startJourney')}
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('joinThousands')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  {t('getStarted')}
                </button>
                <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-300">
                  {t('scheduleDemo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

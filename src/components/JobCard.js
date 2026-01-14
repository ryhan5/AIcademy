import Link from 'next/link';
import { motion } from 'framer-motion';

export default function JobCard({ job, matchScore, missingSkills }) {
    const isHighMatch = matchScore >= 80;
    const isMediumMatch = matchScore >= 50 && matchScore < 80;

    const accentColor = isHighMatch ? 'rgba(34, 197, 94, 0.5)' : isMediumMatch ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)';
    const textColor = isHighMatch ? 'text-green-400' : isMediumMatch ? 'text-yellow-400' : 'text-red-400';

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 transition-all hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden h-full flex flex-col"
        >
            {/* Background Effects */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none transition-all group-hover:opacity-20 translate-x-12 -translate-y-12"
                style={{ backgroundColor: accentColor }}
            ></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                        {job.logo}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">{job.role}</h3>
                        <p className="text-gray-400 font-medium">{job.company}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {job.location}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-black ${textColor}`}>
                        {matchScore}%
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Match</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                {job.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:border-white/10 transition-colors">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex-grow">
                {missingSkills && missingSkills.length > 0 && (
                    <div className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10 group-hover:bg-white/[0.03] transition-colors">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            Locking Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {missingSkills.map((skill, i) => (
                                <span key={i} className="text-[11px] text-red-200/70 px-2.5 py-1 bg-red-500/10 rounded-lg font-medium border border-red-500/10">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                <div className="text-lg font-bold text-white/90">
                    {job.salary}
                </div>
                <button
                    className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 ${isHighMatch
                        ? 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:shadow-purple-500/20 active:scale-95'
                        : 'bg-white/5 text-gray-500 hover:bg-white/10 cursor-not-allowed border border-white/5'
                        }`}
                    disabled={!isHighMatch}
                >
                    {isHighMatch ? 'Apply Now' : 'Locked'}
                </button>
            </div>

            {/* Selection highlight border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/20 rounded-[2rem] transition-colors pointer-events-none"></div>
        </motion.div>
    );
}

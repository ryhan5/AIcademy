export default function LoadingSpinner({ title = "Loading...", message = "Please wait while we prepare your content." }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 py-20">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-3xl opacity-50 z-0"></div>

            <div className="relative z-10 p-12 flex flex-col items-center justify-center text-center">
                {/* Spinner Orb */}
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>

                {/* Text Content */}
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide drop-shadow-lg">{title}</h3>
                <p className="text-gray-400 font-medium max-w-sm mx-auto">{message}</p>
            </div>
        </div>
    );
}

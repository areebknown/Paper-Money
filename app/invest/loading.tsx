export default function Loading() {
    return (
        <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex flex-col items-center gap-6 relative z-10 animate-pulse">
                <div className="w-16 h-16 rounded-3xl bg-[#1e293b] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.15)] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FBBF24]/20 to-transparent animate-[spin_3s_linear_infinite]" />
                    <span className="material-icons-round text-[#FBBF24] text-3xl drop-shadow-lg animate-pulse" style={{ animationDuration: '1.5s' }}>currency_rupee</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <div className="text-[#FBBF24] font-['Russo_One'] tracking-[0.2em] text-sm opacity-90">
                        FETCHING MARKETS
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-[#FBBF24]/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}

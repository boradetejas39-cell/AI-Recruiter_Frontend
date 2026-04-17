import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 overflow-hidden select-none">
      {/* Scrollbar-hide utility for the right side */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Left side: AI Banner (Fixed Sidebar) */}
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] relative overflow-hidden h-full">
        {/* The Banner Image */}
        <img 
          src="/auth_banner.png" 
          alt="AI Recruitment" 
          className="absolute inset-0 w-full h-full object-cover border-r border-white/5 opacity-70"
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"></div>
        
        {/* Animated Background Mesh */}
        <div className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-end p-10 lg:p-14 w-full h-full">
           <div className="mb-6 p-2.5 w-fit bg-white/10 backdrop-blur-md border border-white/15 rounded-xl shadow-xl">
              <span className="text-white font-black text-xl tracking-tighter">AI</span>
           </div>
           
           <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.05] mb-4">
              Recruit Smarter <br/> 
              With <span className="text-primary-400">Intelligence.</span>
           </h1>
           
           <p className="text-slate-400 text-base font-medium max-w-sm leading-relaxed mb-6 opacity-80">
              Transform your recruitment with our AI-powered talent matching ecosystem.
           </p>

           <div className="flex items-center gap-5 text-slate-500 text-[10px] font-bold tracking-widest uppercase opacity-60">
              <div className="flex items-center gap-1.5">
                 <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                 Top Talent
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                 Smart Screen
              </div>
           </div>
        </div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* Right side: Login Form (Internally Scrollable but Scrollbar Hidden) */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 relative bg-slate-950 h-full overflow-y-auto no-scrollbar">
         {/* Link to home - Top Right */}
         <div className="absolute top-5 right-6 z-20">
           <Link to="/" className="flex items-center gap-1.5 text-slate-500 hover:text-primary-400 transition-all group font-black tracking-widest text-[9px]">
             <span className="group-hover:-translate-x-1 transition-transform">←</span>
             HOME
           </Link>
         </div>

         {/* Form area with glass tray - WIDER (max-w-xl) and Lower Padding */}
         <div className="w-full max-w-xl relative z-10 py-2 md:py-4 transition-all duration-700 animate-in fade-in slide-in-from-right-8">
            
            {/* Logo for mobile only */}
            <div className="md:hidden flex flex-col items-center mb-6">
               <div className="h-10 w-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/20 mb-2">
                  <span className="text-white font-black text-lg tracking-tighter">AI</span>
               </div>
               <h2 className="text-lg font-black text-white tracking-tight">AI RECRUITER</h2>
            </div>

            {/* The Form Glass Card - Wider and more compact vertical padding */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 md:p-7 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors duration-500">
               {/* Internal glow */}
               <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-[70px] pointer-events-none"></div>
               
               <div className="relative z-10">
                 {children}
               </div>
            </div>
            
            <p className="mt-6 text-center text-[8px] text-slate-600 font-bold tracking-widest uppercase opacity-30">
              SECURE ACCESS PORTAL &copy; {new Date().getFullYear()}
            </p>
         </div>

         {/* Background mesh for right side */}
         <div className="absolute top-0 right-0 w-full h-full bg-primary-900/5 rounded-full blur-[150px] pointer-events-none"></div>
         
         {/* Noise Texture */}
         <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      </div>
    </div>
  );
};

export default AuthLayout;

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  CpuChipIcon, 
  UserCircleIcon, 
  DocumentMagnifyingGlassIcon,
  ChartBarSquareIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "AI Skill Matching",
      description: "Our proprietary neural network analyzes your technical skills and matches them against thousands of job requirements with 98% accuracy.",
      icon: CpuChipIcon,
      color: "blue"
    },
    {
      title: "Smart Resume Scanner",
      description: "Instantly see how an AI recruiter 'reads' your resume. Get real-time feedback on formatting and keyword density.",
      icon: DocumentMagnifyingGlassIcon,
      color: "purple"
    },
    {
      title: "Integrity Verified",
      description: "Secure, blockchain-backed verification for your credentials and experience to build instant trust with premium employers.",
      icon: ShieldCheckIcon,
      color: "emerald"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium">
              <SparklesIcon className="h-4 w-4" />
              Next-Gen AI Recruitment
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
               Welcome back, {user?.name}! <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
                 Find Your Future with AI
               </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              You are now using the world's most advanced AI-driven recruitment platform. Our algorithms are working in the background to match your unique profile with top-tier opportunities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/app/user/resumes/upload" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 group">
                <DocumentArrowUpIcon className="h-5 w-5" />
                Upload New Resume
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/app/user/jobs" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all">
                Browse AI Matches
              </Link>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0 animate-pulse">
             <div className="w-56 h-56 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl shadow-3xl shadow-primary-500/20 rotate-6 flex items-center justify-center">
                <CpuChipIcon className="h-24 w-24 text-white/50" />
             </div>
          </div>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-${f.color}-50 flex items-center justify-center mb-4`}>
              <f.icon className={`h-6 w-6 text-${f.color}-600`} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Access Sidebar Elements Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ChartBarSquareIcon className="h-6 w-6 text-primary-600" />
                Your Success Journey
              </h2>
           </div>
           <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                 <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-600">Profile Completeness</span>
                    <span className="font-bold text-primary-600">85%</span>
                 </div>
                 <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary-600 h-full w-[85%]"></div>
                 </div>
              </div>
              <p className="text-slate-500 text-sm">
                Add your latest project to reach 100% and get 3x more visibility!
              </p>
           </div>
        </div>

        <div className="bg-indigo-600 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
           <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
           <h2 className="text-xl font-bold mb-2">Ready for an interview?</h2>
           <p className="text-indigo-100 text-sm mb-6 max-w-xs">
             Our AI Mock Interviewer is ready to help you practice your responses.
           </p>
           <Link to="/app/user/interviews" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors">
              My Interview Rounds
           </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

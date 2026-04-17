import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Card, CardBody } from '../../components/UI/Card';

const Profile = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';
  const isRegularUser = user?.role === 'user';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Your Profile</h1>
        <p className="text-slate-500 mt-2">Manage your account credentials and platform settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Identification Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
            <CardBody className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                  <span className="text-4xl font-black text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-slate-900 shadow-lg"></div>
              </div>
              <h3 className="text-2xl font-bold">{user?.name}</h3>
              <p className="text-primary-400 font-medium capitalize mt-1 tracking-wide">{user?.role}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 border border-white/10">
                  ID: {user?._id?.slice(-6) || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 border border-white/10">
                  {user?.company || 'Personal Account'}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
               <h4 className="font-bold text-slate-900 mb-4">Quick Navigation</h4>
               <div className="space-y-2">
                  <Link to={isRegularUser ? '/app/user/dashboard' : isHR ? '/app/hr/dashboard' : '/app/dashboard'} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium group">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                       <BriefcaseIcon className="h-5 w-5" />
                    </div>
                    Main Dashboard
                  </Link>
                  <Link to="/app/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                       <CogIcon className="h-5 w-5" />
                    </div>
                    Account Settings
                  </Link>
               </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: Detailed Info & Meta Sidebar Representation */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
               <h4 className="text-lg font-bold text-slate-900">Personal Details</h4>
            </div>
            <CardBody className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-900 font-medium">{user?.name}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Correspondence</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-900 font-medium">{user?.email}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-900 font-medium">{user?.phone || 'Not provided'}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Since</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-900 font-medium">{new Date(user?.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sidebar Elements Integration */}
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Platform Workspace</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {isRegularUser ? (
                 <>
                   <Link to="/app/user/resumes/upload" className="group p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <DocumentTextIcon className="h-6 w-6" />
                      </div>
                      <h5 className="font-bold text-slate-900">My Resumes</h5>
                      <p className="text-xs text-slate-500 mt-1">Manage and optimize your AI-ready documents.</p>
                   </Link>
                   <Link to="/app/user/jobs" className="group p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BriefcaseIcon className="h-6 w-6" />
                      </div>
                      <h5 className="font-bold text-slate-900">Job Matching</h5>
                      <p className="text-xs text-slate-500 mt-1">Discover opportunities selected by our AI.</p>
                   </Link>
                 </>
               ) : (
                 <>
                   <Link to="/app/jobs" className="group p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <BriefcaseIcon className="h-6 w-6" />
                      </div>
                      <h5 className="font-bold text-slate-900">Workforce Planning</h5>
                      <p className="text-xs text-slate-500 mt-1">Manage pipeline and job distributions.</p>
                   </Link>
                   <Link to="/app/resumes" className="group p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <DocumentTextIcon className="h-6 w-6" />
                      </div>
                      <h5 className="font-bold text-slate-900">Talent Pool</h5>
                      <p className="text-xs text-slate-500 mt-1">Search and filter AI-ranked candidates.</p>
                   </Link>
                 </>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

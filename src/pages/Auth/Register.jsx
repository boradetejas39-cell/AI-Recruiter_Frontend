import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSafeGoogleLogin, GOOGLE_ENABLED } from '../../utils/googleAuth';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/UI';
import { Button } from '../../components/UI';
import { SparklesIcon, UserIcon, EnvelopeIcon, LockClosedIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Google "G" logo SVG (official colors)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Role pill options
const roleOptions = [
  { value: 'user', label: 'Job Seeker', icon: '🔍', description: 'Find your dream job' },
  { value: 'hr', label: 'HR Pro', icon: '👔', description: 'Manage hiring pipeline' }
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    company: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Google sign-up via useGoogleLogin hook (custom button)
  const handleGoogleSignup = useSafeGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setErrors({});
      try {
        const result = await googleLogin(tokenResponse.access_token, formData.role, 'access_token');
        if (result.success) {
          toast.success('Account created with Google!');
          navigate('/app/dashboard');
        } else {
          setErrors({ general: result.error });
        }
      } catch (error) {
        setErrors({ general: 'Google sign-up failed' });
        toast.error('Google sign-up failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-up failed');
      setErrors({ general: 'Google sign-up was cancelled or failed' });
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if ((formData.role === 'hr' || formData.role === 'recruiter') && !formData.company.trim()) {
      newErrors.company = 'Company name is required for HR/Recruiter';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { confirmPassword, agreeTerms, ...registrationData } = formData;
      const result = await register(registrationData);
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/app/dashboard');
      } else {
        if (result.error) setErrors({ general: result.error });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
        <p className="mt-2 text-slate-400">
          Join AI Recruiter and modernize your hiring.
        </p>
      </div>

      {/* Error message */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-shake">
          <div className="bg-red-500/20 p-1 rounded-full text-red-500">⚠️</div>
          <p className="text-sm text-red-400 font-medium">{errors.general}</p>
        </div>
      )}

      {/* Role Selection — Improved Cards */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1 text-center">
          I want to join as
        </label>
        <div className="flex justify-around gap-6">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: opt.value }))}
              className={`relative flex flex-col items-center justify-center p-4 w-[45%] h-28 rounded-2xl border-2 transition-all duration-300 group ${formData.role === opt.value
                ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
            >
              <span className={`text-2xl mb-2 transition-transform duration-300 ${formData.role === opt.value ? 'scale-110' : 'group-hover:scale-110'}`}>
                {opt.icon}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${formData.role === opt.value ? 'text-primary-400' : 'text-slate-400'}`}>
                {opt.label}
              </span>
              
              {formData.role === opt.value && (
                <div className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white p-0.5 rounded-full shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Google Sign-Up */}
      {GOOGLE_ENABLED && (
        <>
          <button
            type="button"
            onClick={() => handleGoogleSignup()}
            disabled={googleLoading || loading}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-slate-200 font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-8 overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            {googleLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            ) : (
              <GoogleIcon />
            )}
            <span>{googleLoading ? 'Creating Account...' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="bg-[#0f172a] px-4 text-slate-500 font-black">OR EMAIL SIGNUP</span>
            </div>
          </div>
        </>
      )}

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative">
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full h-12 pl-11 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
                <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
              </div>
            </div>
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full h-12 pl-11 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <EnvelopeIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
              </div>
            </div>
          </div>

          {(formData.role === 'hr' || formData.role === 'recruiter') && (
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Company Entity</label>
              <div className="relative">
                <input
                  name="company"
                  type="text"
                  required
                  className="w-full h-12 pl-11 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Enter organization name"
                  value={formData.company}
                  onChange={handleChange}
                />
                <BuildingOfficeIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-4 px-1">
          <input
            id="agree-terms"
            name="agreeTerms"
            type="checkbox"
            className="mt-1 h-5 w-5 bg-white/5 border-white/10 rounded text-primary-600 focus:ring-offset-slate-900"
            checked={formData.agreeTerms}
            onChange={handleChange}
          />
          <label htmlFor="agree-terms" className="text-xs text-slate-400 leading-relaxed font-medium">
            I agree to the <span className="text-slate-200 cursor-pointer hover:underline">User Agreement</span> and <span className="text-slate-200 cursor-pointer hover:underline">Privacy Charter</span>.
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] border-0 mt-4"
          loading={loading}
          disabled={loading || googleLoading}
        >
          {loading ? 'Initializing...' : 'BUILD MY ACCOUNT'}
        </Button>

        <div className="text-center pt-8 border-t border-white/5 mt-8">
          <p className="text-slate-400 font-medium tracking-tight text-sm">
            Already registered?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-all hover:underline decoration-2 underline-offset-4">
              Sign In Instead
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;

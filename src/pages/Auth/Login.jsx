import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSafeGoogleLogin, GOOGLE_ENABLED } from '../../utils/googleAuth';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/UI';
import { Button } from '../../components/UI';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Google "G" logo SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin, logout } = useAuth();
  const navigate = useNavigate();

  // Google login via useGoogleLogin hook (custom button)
  const handleGoogleLogin = useSafeGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setErrors({});
      try {
        const result = await googleLogin(tokenResponse.access_token, undefined, 'access_token');
        if (result.success) {
          if (result.user?.role === 'admin') {
            await logout();
            setErrors({ general: 'Administrators must use the dedicated Admin Gateway at /admin-gateway.' });
            toast.error('Admin account detected. Please use the Admin Gateway (/admin-gateway).');
          } else {
            navigate('/app/dashboard');
          }
        } else {
          setErrors({ general: result.error });
        }
      } catch (error) {
        setErrors({ general: 'Google sign-in failed' });
        toast.error('Google sign-in failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-in failed');
      setErrors({ general: 'Google sign-in was cancelled or failed' });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await login(formData);
      if (result.success) {
        toast.success('Login successful!');
        
        // Dynamic navigation based on role - prevent admin login here
        if (result.user?.role === 'admin') {
          await logout(); // Clear the session
          setErrors({ general: 'Administrators must use the dedicated Admin Gateway at /admin-gateway.' });
          toast.error('Admin account detected. Please use the Admin Gateway (/admin-gateway).');
          return;
        } else {
          navigate('/app/dashboard');
        }
      } else {
        if (result.error) {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="mt-1 text-slate-400 text-sm">
          Enter your credentials to access your workspace.
        </p>
      </div>

      {/* Error message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-shake">
          <div className="bg-red-500/20 p-1 rounded-full">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-red-400 leading-relaxed font-medium">{errors.general}</p>
        </div>
      )}

      {/* Google Sign-In Button - Compact */}
      {GOOGLE_ENABLED && (
        <>
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 group mb-4"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <GoogleIcon />
            )}
            <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="bg-[#0f172a] px-3 text-slate-500 font-bold">OR</span>
            </div>
          </div>
        </>
      )}

      {/* Email Form - COMPACT */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="relative group">
            <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-500 transition-colors">
                <EnvelopeIcon className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-11 pl-11 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-300 group-hover:border-white/20 text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="relative group">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <button type="button" className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors">
                Forgot?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-500 transition-colors">
                <LockClosedIcon className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full h-11 pl-11 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-300 group-hover:border-white/20 text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center pl-1">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 bg-white/5 border-white/10 rounded text-primary-600 focus:ring-primary-500 focus:ring-offset-slate-900 transition-all"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400 font-medium">
            Stay signed in
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 scale-[1] hover:scale-[1.01] active:scale-[0.98] border-0 text-sm"
          loading={loading}
          disabled={loading || googleLoading}
        >
          {loading ? 'Authorizing...' : 'SIGN IN'}
        </Button>

        <div className="text-center pt-4">
          <p className="text-slate-400 font-medium tracking-tight text-xs">
            New here?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-bold transition-all hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button } from '../../components/UI';
import { LockClosedIcon, ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await login(formData);
      if (result.success) {
        if (result.user?.role === 'admin') {
          toast.success('Admin login successful!');
          navigate('/adminpanel');
        } else {
          setErrors({ general: 'Access denied. You are not an administrator.' });
          toast.error('Access denied. Administrator privileges required.');
        }
      } else {
        setErrors({ general: result.error || 'Invalid credentials' });
      }
    } catch (error) {
       const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
       setErrors({ general: errorMessage });
       toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 mb-6">
              <ShieldCheckIcon className="h-9 w-9 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Admin Gateway
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Secure access for system administrators only
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <div className="text-red-500 mt-0.5">⚠️</div>
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Admin Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="pl-11 bg-slate-800/50 border-slate-700 text-white focus:border-red-500 focus:ring-red-500/20 rounded-xl h-12"
                    placeholder="admin@ai-recruiter.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Secret Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <LockClosedIcon className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-11 bg-slate-800/50 border-slate-700 text-white focus:border-red-500 focus:ring-red-500/20 rounded-xl h-12"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 border-0 transition-all duration-300 transform active:scale-95"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Authorize Access'}
            </Button>
            
            <div className="text-center pt-4">
              <a href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Standard user login? Click here
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

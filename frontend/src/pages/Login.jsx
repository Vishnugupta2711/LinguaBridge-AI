import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Languages } from 'lucide-react';
import { backendApi } from '../utils/api';
import toast from 'react-hot-toast';

const Login = ({ setAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    try {
      const res = await backendApi.post(endpoint, formData);
      const data = res.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(true);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="saas-card w-full max-w-md p-10"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <Languages size={32} strokeWidth={2.5} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? 'Enter your details to access your workspace.' : 'Start breaking language barriers today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  className="input-saas pl-10" 
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                className="input-saas pl-10" 
                placeholder="name@company.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              {isLogin && <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                className="input-saas pl-10" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary-saas w-full flex justify-center items-center gap-2 mt-8 text-base h-12"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign in' : 'Create account'} 
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ username: '', email: '', password: '' });
            }}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

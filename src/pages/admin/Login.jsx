import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAdmin, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  React.useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-admin-accent/30 selection:text-admin-accent">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-admin-accent/10 via-[#030303] to-[#030303] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-admin-accent/10 blur-[150px] rounded-full pointer-events-none z-0 mix-blend-screen animate-pulse duration-10000"></div>

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }
        }} 
      />

      <div className="w-full max-w-[420px] bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Inner subtle glow */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-admin-accent/50 to-transparent"></div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-6 overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center p-1.5 relative group">
            <div className="absolute inset-0 bg-admin-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit'] mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-sm font-medium">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="w-full bg-[#111] border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 placeholder:text-gray-600 shadow-inner font-medium hover:border-white/20"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                className="w-full bg-[#111] border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 placeholder:text-gray-600 shadow-inner font-medium hover:border-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-10 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-admin-accent via-yellow-500 to-yellow-600 text-[#050505] font-black tracking-wide text-lg rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={submitting || authLoading}
          >
            {submitting || authLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <ShieldCheck size={24} />
                Sign In Securely
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

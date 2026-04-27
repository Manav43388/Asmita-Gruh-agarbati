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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-admin-accent/10 via-[#050505] to-[#050505]">
      <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-admin-accent/5 animate-in slide-in-from-bottom-8 duration-700 fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full border border-admin-accent/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-4 overflow-hidden bg-[#0a0a0a] flex items-center justify-center p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-white font-['Outfit'] mb-2 tracking-wide text-center">Asmita Admin</h1>
          <p className="text-gray-400 text-sm text-center">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all placeholder:text-gray-600 shadow-inner"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all placeholder:text-gray-600 shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={submitting || authLoading}
          >
            {submitting || authLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <ShieldCheck size={24} />
                Login to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, ShieldCheck, KeyRound, X, ArrowLeft } from 'lucide-react';

const ForgotPasswordModal = ({ onClose, resetPassword }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    setSending(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else {
        toast.error(error.message || 'Failed to send reset email.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Card */}
      <div
        className="w-full max-w-sm rounded-3xl border border-[#2a2a2a] bg-[#141414] p-8 shadow-2xl"
        style={{
          animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          boxShadow: '0 0 60px rgba(212,175,55,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              <KeyRound size={18} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight font-['Outfit']">
                Forgot Password?
              </h2>
              <p className="text-gray-500 text-xs">We'll send a reset link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              Enter the email address associated with your admin account and we'll
              send you a password reset link.
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#d4af37] transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder:text-gray-600 text-sm"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] text-sm font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                  color: '#050505',
                  boxShadow: sending ? 'none' : '0 0 20px rgba(212,175,55,0.25)',
                }}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {sending ? 'Sending…' : 'Send Link'}
              </button>
            </div>
          </form>
        ) : (
          /* Success state */
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              <Mail size={28} style={{ color: '#d4af37' }} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Check your inbox!</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                A password reset link has been sent to{' '}
                <span style={{ color: '#d4af37' }}>{email}</span>.
                <br />
                It may take a few minutes to arrive.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                color: '#050505',
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);     }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────── */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { user, isAdmin, login, resetPassword, loading: authLoading } = useAuth();
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
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-admin-accent/10 via-[#050505] to-[#050505]">
        <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-admin-accent/5 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full border border-admin-accent/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-4 overflow-hidden bg-[#0a0a0a] flex items-center justify-center p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit'] mb-2 tracking-wide text-center">Asmita Gruh Udhyog</h1>
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
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-medium transition-all duration-200 hover:underline underline-offset-2"
                  style={{ color: '#d4af37' }}
                >
                  Forgot password?
                </button>
              </div>
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

      {showForgot && (
        <ForgotPasswordModal
          onClose={() => setShowForgot(false)}
          resetPassword={resetPassword}
        />
      )}
    </>
  );
};

export default Login;

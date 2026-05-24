import { useState } from 'react';
import { motion } from 'framer-motion';

import { Mail, Lock, ChevronRight, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to login');
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-deep">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="neon-blob neon-blob-primary -top-20 -left-20"></div>
        <div className="neon-blob neon-blob-secondary -bottom-20 -right-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="h3 font-display fw-bold text-primary mb-2">SecureVote</div>
          <h1 className="h2 font-heading fw-bold">{isAdminMode ? 'Super Admin Access' : 'Welcome Back'}</h1>
          <p className="text-muted">{isAdminMode ? 'Sign in with your administrative credentials' : 'Sign in to your secure account'}</p>
        </div>

        {message && (
          <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl mb-6 d-flex align-items-center gap-2">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl mb-6 d-flex align-items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="d-flex flex-column gap-6">
          <div>
            <label className="text-muted small mb-2 d-block">Email Address</label>
            <div className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all">
              <Mail size={18} className="text-dim" />
              <input 
                type="email" 
                placeholder="Enter your email" 
                required
                className="bg-transparent border-none text-main outline-none w-full"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="text-muted small m-0">Password</label>
              <Link to="/forgot-password" className="text-primary text-xs">Forgot Password?</Link>
            </div>
            <div className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all">
              <Lock size={18} className="text-dim" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="bg-transparent border-none text-main outline-none w-full"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 justify-content-center h5 mt-4"
          >
            {loading ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : 'Sign In'} <ChevronRight size={20} />
          </button>
        </form>

        <p className="text-center text-muted mt-8 mb-0">
          Don't have an account? <Link to="/signup" className="text-primary fw-bold">Sign Up</Link>
        </p>

        <div className="mt-6 pt-6 border-top border-white/5 text-center">
          <button
            type="button"
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="text-muted small hover:text-primary transition-all d-inline-flex align-items-center gap-2"
          >
            <Shield size={16} />
            {isAdminMode ? 'Return to User Login' : 'Super Admin Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

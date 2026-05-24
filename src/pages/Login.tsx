import { useState } from 'react';
import { motion } from 'framer-motion';

import { Mail, Lock, ChevronRight, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';
import { fadeUp, bounceIn, staggerContainer } from '../lib/animations';

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
        <motion.div 
          className="neon-blob neon-blob-primary -top-20 -left-20"
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="neon-blob neon-blob-secondary -bottom-20 -right-20"
          animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="glass-card max-w-md w-full relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl -z-10"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="text-center mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={bounceIn}>
            <div className="h3 font-display fw-bold text-primary mb-2">SecureVote</div>
          </motion.div>
          <motion.h1 
            className="h2 font-heading fw-bold"
            variants={fadeUp}
          >
            {isAdminMode ? 'Super Admin Access' : 'Welcome Back'}
          </motion.h1>
          <motion.p 
            className="text-muted"
            variants={fadeUp}
          >
            {isAdminMode ? 'Sign in with your administrative credentials' : 'Sign in to your secure account'}
          </motion.p>
        </motion.div>

        {message && (
          <motion.div 
            className="bg-success/10 border border-success/20 text-success p-4 rounded-xl mb-6 d-flex align-items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            variants={bounceIn}
          >
            <CheckCircle2 size={18} /> {message}
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="bg-error/10 border border-error/20 text-error p-4 rounded-xl mb-6 d-flex align-items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleLogin} 
          className="d-flex flex-column gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <label className="text-muted small mb-2 d-block">Email Address</label>
            <motion.div 
              className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Mail size={18} className="text-dim" />
              </motion.div>
              <input 
                type="email" 
                placeholder="Enter your email" 
                required
                className="bg-transparent border-none text-main outline-none w-full"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="text-muted small m-0">Password</label>
              <Link to="/forgot-password" className="text-primary text-xs">Forgot Password?</Link>
            </div>
            <motion.div 
              className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Lock size={18} className="text-dim" />
              </motion.div>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="bg-transparent border-none text-main outline-none w-full"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={bounceIn} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3 }}>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 justify-content-center h5 mt-4"
            >
              {loading ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : 'Sign In'} <ChevronRight size={20} />
            </button>
          </motion.div>
        </motion.form>

        <motion.p 
          className="text-center text-muted mt-8 mb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Don't have an account? <Link to="/signup" className="text-primary fw-bold">Sign Up</Link>
        </motion.p>

        <motion.div 
          className="mt-6 pt-6 border-top border-white/5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            type="button"
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="text-muted small hover:text-primary transition-all d-inline-flex align-items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: isAdminMode ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Shield size={16} />
            </motion.div>
            {isAdminMode ? 'Return to User Login' : 'Super Admin Login'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

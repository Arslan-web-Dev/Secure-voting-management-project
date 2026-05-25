import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ChevronRight, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';
import { fadeUp, bounceIn, staggerContainer } from '../lib/animations';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Supabase sets session from URL hash automatically on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Listen for the PASSWORD_RECOVERY event from the URL hash
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setSessionReady(true);
          }
        });
        // If no session after 3s, show error
        const timer = setTimeout(() => {
          if (!sessionReady) setSessionError(true);
        }, 3000);
        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update password'));
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Too short', color: 'var(--error)', width: '25%' };
    if (password.length < 8) return { label: 'Weak', color: 'var(--warning)', width: '50%' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'Strong', color: 'var(--success)', width: '100%' };
    return { label: 'Fair', color: 'var(--warning)', width: '75%' };
  };

  const strength = passwordStrength();

  if (sessionError) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-deep">
        <div className="glass-card text-center" style={{ maxWidth: 420 }}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-full mb-4"
            style={{ width: 72, height: 72, background: 'rgba(255,51,102,0.12)', border: '1px solid rgba(255,51,102,0.3)' }}>
            <AlertCircle size={36} style={{ color: 'var(--error)' }} />
          </div>
          <h2 className="h4 font-heading mb-3">Link Expired or Invalid</h2>
          <p className="text-muted small mb-6">This password reset link has expired or already been used. Please request a new one.</p>
          <button onClick={() => navigate('/forgot-password')} className="btn-primary px-6 py-3 rounded-xl small fw-bold">
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-deep">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div
          className="neon-blob neon-blob-primary -top-20 -left-20"
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div className="container" style={{ maxWidth: 420 }}
        variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={bounceIn} className="text-center mb-8">
          <div className="d-inline-flex align-items-center justify-content-center rounded-2xl mb-4"
            style={{ width: 64, height: 64, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="h3 font-heading">Set New Password</h1>
          <p className="text-muted small mt-2">Choose a strong password for your account.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card">
          {success ? (
            <motion.div className="text-center py-4"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="d-inline-flex align-items-center justify-content-center rounded-full mb-4"
                style={{ width: 72, height: 72, background: 'rgba(0,245,160,0.12)', border: '1px solid rgba(0,245,160,0.3)' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
              </div>
              <h2 className="h4 font-heading mb-3">Password Updated!</h2>
              <p className="text-muted small">Redirecting you to login...</p>
              <div className="spinner mx-auto mt-4" />
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="small fw-bold text-muted mb-2 d-block">New Password</label>
                <div className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl">
                  <Lock size={18} className="text-muted flex-shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="bg-transparent border-none text-main outline-none w-100 small"
                    required
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-main">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <div style={{ width: strength.width, height: '100%', background: strength.color,
                        borderRadius: 2, transition: 'all 0.3s ease' }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="small fw-bold text-muted mb-2 d-block">Confirm Password</label>
                <div className={`glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl ${
                  confirmPassword && password !== confirmPassword ? 'border-error' : ''}`}>
                  <Lock size={18} className="text-muted flex-shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="bg-transparent border-none text-main outline-none w-100 small"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading || !sessionReady}
                className="btn-primary w-100 py-3 rounded-xl fw-bold small d-flex align-items-center justify-content-center gap-2">
                {loading ? (
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                ) : (
                  <> Update Password <ChevronRight size={16} /> </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

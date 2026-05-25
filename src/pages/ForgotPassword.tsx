import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ChevronRight, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';
import { fadeUp, bounceIn, staggerContainer } from '../lib/animations';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to send reset email'));
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
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="neon-blob neon-blob-secondary -bottom-20 -right-20"
          animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="container"
        style={{ maxWidth: 420 }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={bounceIn} className="text-center mb-8">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-2xl mb-4"
            style={{
              width: 64,
              height: 64,
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="h3 font-heading">Forgot Password?</h1>
          <p className="text-muted small mt-2">
            Enter your email and we'll send you a secure reset link.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card">
          {sent ? (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-full mb-4"
                style={{
                  width: 72,
                  height: 72,
                  background: 'rgba(0,245,160,0.12)',
                  border: '1px solid rgba(0,245,160,0.3)',
                }}
              >
                <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
              </div>
              <h2 className="h4 font-heading mb-3">Check Your Email</h2>
              <p className="text-muted small mb-6">
                We've sent a password reset link to{' '}
                <strong className="text-primary">{email}</strong>. Check your
                inbox (and spam folder).
              </p>
              <Link
                to="/login"
                className="btn-primary px-6 py-3 rounded-xl small fw-bold d-inline-flex align-items-center gap-2"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="small fw-bold text-muted mb-2 d-block">
                  Email Address
                </label>
                <div className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl">
                  <Mail size={18} className="text-muted flex-shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-transparent border-none text-main outline-none w-100 small"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-100 py-3 rounded-xl fw-bold small d-flex align-items-center justify-content-center gap-2"
              >
                {loading ? (
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                ) : (
                  <>
                    Send Reset Link <ChevronRight size={16} />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="d-flex align-items-center justify-content-center gap-2 text-muted small mt-5 hover:text-main transition-all"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

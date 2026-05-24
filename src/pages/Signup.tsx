import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';

import { Mail, Lock, User, Phone, Building2, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { logActivity } from '../lib/audit';
import { getErrorMessage } from '../lib/errors';
import { fadeUp, scaleUp, bounceIn, staggerContainer } from '../lib/animations';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
    electionPurpose: '',
    role: 'voter', // 'voter' | 'election_creator'
  });

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate fields for creator
    if (formData.role === 'election_creator') {
      if (!formData.phone) {
        toast.error('Phone number is required for Election Creators');
        setLoading(false);
        return;
      }
      if (!formData.organization) {
        toast.error('Organization name is required for Election Creators');
        setLoading(false);
        return;
      }
      if (!formData.electionPurpose) {
        toast.error('Election purpose is required for Election Creators');
        setLoading(false);
        return;
      }
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
            phone: formData.phone || null,
            organization: formData.organization || null,
            election_purpose: formData.electionPurpose || null,
          },
        },
      });

      if (signupError) throw signupError;
      
      if (data.user) {
        await logActivity({
          action: 'User Registered',
          userId: data.user.id,
          metadata: { role: formData.role, email: formData.email }
        });
      }

      toast.success('Account created! Please verify your email.');
      navigate('/login?message=Check your email to verify your account');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Signup failed');
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-deep py-20">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          className="neon-blob neon-blob-secondary -top-20 -left-20"
          animate={{ scale: [1, 1.4, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="neon-blob neon-blob-success -bottom-20 -right-20"
          animate={{ scale: [1, 1.3, 1], x: [0, -35, 0], y: [0, 35, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={scaleUp}
        className="glass-card max-w-2xl w-full relative overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-2xl -z-10"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 120, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
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
            Create Account
          </motion.h1>
          <motion.p 
            className="text-muted"
            variants={fadeUp}
          >
            Join the most secure voting platform
          </motion.p>
        </motion.div>

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
          onSubmit={handleSignup} 
          className="row g-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="col-12" variants={fadeUp}>
            <label className="text-muted small mb-2 d-block">Account Type</label>
            <div className="row g-3">
              <div className="col-6">
                <motion.div 
                  onClick={() => setFormData({ ...formData, role: 'voter' })}
                  className={`glass p-4 rounded-xl text-center cursor-pointer border transition-all ${
                    formData.role === 'voter' ? 'border-primary bg-primary/10 text-main' : 'border-white/5 text-dim hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="small fw-bold">Voter</span>
                </motion.div>
              </div>
              <div className="col-6">
                <motion.div 
                  onClick={() => setFormData({ ...formData, role: 'election_creator' })}
                  className={`glass p-4 rounded-xl text-center cursor-pointer border transition-all ${
                    formData.role === 'election_creator' ? 'border-primary bg-primary/10 text-main' : 'border-white/5 text-dim hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="small fw-bold">Election Creator</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div className="col-md-6" variants={fadeUp}>
            <label className="text-muted small mb-2 d-block">Full Name</label>
            <motion.div 
              className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <User size={18} className="text-dim" />
              </motion.div>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                required
                className="bg-transparent border-none text-main outline-none w-full"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </motion.div>
          </motion.div>

          <motion.div className="col-md-6" variants={fadeUp}>
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

          <motion.div className="col-12" variants={fadeUp}>
            <label className="text-muted small mb-2 d-block">Password</label>
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

          {formData.role === 'election_creator' && (
            <>
              <div className="col-md-6">
                <label className="text-muted small mb-2 d-block">Phone Number</label>
                <div className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all">
                  <Phone size={18} className="text-dim" />
                  <input 
                    type="tel" 
                    placeholder="Enter phone number" 
                    required={formData.role === 'election_creator'}
                    className="bg-transparent border-none text-main outline-none w-full"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="text-muted small mb-2 d-block">Organization Name</label>
                <div className="glass d-flex align-items-center gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all">
                  <Building2 size={18} className="text-dim" />
                  <input 
                    type="text" 
                    placeholder="e.g. University Student Council" 
                    required={formData.role === 'election_creator'}
                    className="bg-transparent border-none text-main outline-none w-full"
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="text-muted small mb-2 d-block">Election Purpose / Intention</label>
                <div className="glass d-flex align-items-start gap-3 px-4 py-3 rounded-xl border-white/5 focus-within:border-primary/50 transition-all">
                  <FileText size={18} className="text-dim mt-1" />
                  <textarea 
                    rows={3}
                    placeholder="Explain the purpose of the elections you intend to host (e.g. academic, student council representation, corporate board)..." 
                    required={formData.role === 'election_creator'}
                    className="bg-transparent border-none text-main outline-none w-full resize-none"
                    value={formData.electionPurpose}
                    onChange={(e) => setFormData({...formData, electionPurpose: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </>
          )}

          <motion.div className="col-12" variants={bounceIn} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3 }}>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 justify-content-center h5"
            >
              {loading ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : 'Create Account'} <ChevronRight size={20} />
            </button>
          </motion.div>
        </motion.form>

        <motion.p 
          className="text-center text-muted mt-8 mb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account? <Link to="/login" className="text-primary fw-bold">Sign In</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Signup;

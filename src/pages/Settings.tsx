import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { User, Phone, Building, Shield, Key, Eye, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getErrorMessage } from '../lib/errors';
import type { ProfileRecord } from '../types/models';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    organization: user?.user_metadata?.organization || '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, organization')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        const profile = data as Pick<
          ProfileRecord,
          'full_name' | 'phone' | 'organization'
        >;

        setFormData({
          fullName: profile.full_name,
          phone: profile.phone || '',
          organization: profile.organization || '',
        });
      }
    };

    void fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    setLoading(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone || null,
          organization: formData.organization || null,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          organization: formData.organization,
        }
      });

      if (error) throw error;
      toast.success('Profile settings updated successfully!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update profile settings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-8">
      <div className="row g-6">
        {/* Profile Settings Card */}
        <div className="col-lg-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card h-full"
          >
            <div className="d-flex align-items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-primary/20 text-primary">
                <User size={22} />
              </div>
              <h3 className="h4 m-0 font-heading">Profile Information</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="d-flex flex-column gap-6">
              <div className="d-flex flex-column gap-2">
                <label className="small fw-semibold text-muted">Full Name</label>
                <div className="input-group">
                  <span className="input-icon"><User size={18} /></span>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                <label className="small fw-semibold text-muted">Phone Number</label>
                <div className="input-group">
                  <span className="input-icon"><Phone size={18} /></span>
                  <input 
                    type="tel" 
                    className="form-control"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                <label className="small fw-semibold text-muted">Organization</label>
                <div className="input-group">
                  <span className="input-icon"><Building size={18} /></span>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Enter organization or school"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                <label className="small fw-semibold text-muted">Registered Email (Cannot be changed)</label>
                <input 
                  type="email" 
                  className="form-control bg-white/5 opacity-60 cursor-not-allowed" 
                  value={user?.email || ''} 
                  disabled 
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary mt-4" 
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Security & Cryptography Module */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-6 h-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card"
            >
              <div className="d-flex align-items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-success/20 text-success">
                  <Shield size={22} />
                </div>
                <h3 className="h4 m-0 font-heading">Cryptographic Identity</h3>
              </div>

              <p className="text-muted small mb-6">
                Your voting credentials are cryptographically protected using state-of-the-art zero-knowledge schemas to verify integrity while maintaining absolute anonymity.
              </p>

              <div className="d-flex flex-column gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small fw-bold">ZKP Schema Status</span>
                  <span className="px-3 py-1 rounded-full bg-success/20 text-success text-xs fw-bold">SECURE & DEPLOYED</span>
                </div>
                <hr className="border-white/10 m-0" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small fw-bold">Public Verification Hash</span>
                  <code className="text-xs text-primary text-truncate max-w-40">{user?.id || 'Generative token...'}</code>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card flex-grow"
            >
              <div className="d-flex align-items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-warning/20 text-warning">
                  <Key size={22} />
                </div>
                <h3 className="h4 m-0 font-heading">Active Session</h3>
              </div>

              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Eye size={18} className="text-muted" />
                  </div>
                  <div>
                    <h5 className="m-0 mb-1 small fw-bold">Current Device Token</h5>
                    <p className="text-xs text-muted m-0">Your session is authenticated via secured JSON Web Tokens (JWT) through Supabase.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/5">
                    <HelpCircle size={18} className="text-muted" />
                  </div>
                  <div>
                    <h5 className="m-0 mb-1 small fw-bold">Need Help?</h5>
                    <p className="text-xs text-muted m-0">Contact your regional coordinator or super administrator if your credentials ever get compromised.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

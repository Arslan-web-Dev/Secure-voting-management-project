import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Users, Clock, Plus, BarChart3, ShieldAlert, Check, X, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { hashString } from '../../lib/crypto';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { sendEmail } from '../../lib/emailService';
import { logActivity } from '../../lib/audit';
import { getErrorMessage } from '../../lib/errors';
import type {
  ElectionRecord,
  ProfileRecord,
  RegistrationStatus,
} from '../../types/models';

interface Election
  extends Pick<
    ElectionRecord,
    'id' | 'title' | 'status' | 'max_voters' | 'is_locked' | 'created_at'
  > {
  voter_count: number;
}

interface VoterRegistration {
  id: string;
  status: RegistrationStatus;
  registered_at: string;
  profiles: VoterProfileSummary;
}

interface CreatorElectionRow extends Omit<Election, 'voter_count'> {
  voter_count: Array<{ count: number | null }> | null;
}

interface VoterProfileSummary {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
}

interface VoterRegistrationRow
  extends Omit<VoterRegistration, 'profiles'> {
  profiles: VoterProfileSummary[];
}

type CreatorProfile = Pick<ProfileRecord, 'rejection_reason'>;

const fetchCreatorElections = async (userId: string): Promise<Election[]> => {
  const { data, error } = await supabase
    .from('elections')
    .select(`
      *,
      voter_count:voter_registrations(count)
    `)
    .eq('creator_id', userId);

  if (error || !data) {
    return [];
  }

  return (data as CreatorElectionRow[]).map((row) => ({
    ...row,
    voter_count: row.voter_count?.[0]?.count ?? 0,
  }));
};

const fetchCreatorProfile = async (
  userId: string
): Promise<CreatorProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('rejection_reason')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as CreatorProfile;
};

const CreatorDashboard = () => {
  const { user, isApproved, refreshProfile } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration management state
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [registrations, setRegistrations] = useState<VoterRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [profileData, setProfileData] = useState<CreatorProfile | null>(null);

  const refreshElections = async () => {
    if (!user) {
      return;
    }

    const nextElections = await fetchCreatorElections(user.id);
    setElections(nextElections);
  };

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const [nextElections, nextProfile] = await Promise.all([
        fetchCreatorElections(user.id),
        fetchCreatorProfile(user.id),
      ]);

      if (!isActive) {
        return;
      }

      setElections(nextElections);
      setProfileData(nextProfile);
      setLoading(false);
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [user]);

  const handleSelectElection = async (election: Election) => {
    setSelectedElection(election);
    setLoadingRegs(true);

    const { data, error } = await supabase
      .from('voter_registrations')
      .select(`
        id,
        status,
        registered_at,
        profiles!inner (
          id,
          full_name,
          email,
          phone,
          organization
        )
      `)
      .eq('election_id', election.id);

    if (!error && data) {
      const normalizedRegistrations = (data as unknown as VoterRegistrationRow[])
        .map((registration) => ({
          ...registration,
          profiles: registration.profiles[0],
        }))
        .filter(
          (
            registration
          ): registration is VoterRegistration => Boolean(registration.profiles)
        );

      setRegistrations(normalizedRegistrations);
    } else {
      toast.error('Failed to load voter registrations');
    }
    setLoadingRegs(false);
  };

  const handleUpdateRegStatus = async (regId: string, status: VoterRegistration['status']) => {
    const { error } = await supabase
      .from('voter_registrations')
      .update({ status })
      .eq('id', regId);

    if (!error) {
      toast.success(`Registration status updated to ${status}`);
      setRegistrations(registrations.map(r => r.id === regId ? { ...r, status } : r));
      if (selectedElection) {
        void refreshElections();
      }
    } else {
      toast.error(error.message);
    }
  };

  const handleFinalizeList = async () => {
    if (!selectedElection) return;

    const approvedVoters = registrations.filter(r => r.status === 'approved');
    if (approvedVoters.length === 0) {
      toast.error('Cannot finalize election with 0 approved voters.');
      return;
    }

    setLoadingRegs(true);

    try {
      // 1. Lock the voter list
      const { error: lockError } = await supabase
        .from('elections')
        .update({ is_locked: true, status: 'active' })
        .eq('id', selectedElection.id);

      if (lockError) throw lockError;

      // 2. Generate secret IDs for approved voters
      const prefix = selectedElection.title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'EL');
      
      for (let i = 0; i < approvedVoters.length; i++) {
        const reg = approvedVoters[i];
        const seqNumber = String(i + 1).padStart(4, '0');
        const secretId = `POLL-${prefix}-${seqNumber}`;
        const secretIdHash = await hashString(secretId); // SHA-256 hash for db
        const maskedSecretId = `****${secretId.slice(-4)}`;

        // Save secret ID hash to the registration
        const { error: updateRegError } = await supabase
          .from('voter_registrations')
          .update({ 
            secret_id_hash: secretIdHash,
            masked_secret_id: maskedSecretId
          })
          .eq('id', reg.id);

        if (updateRegError) throw updateRegError;

        // Send email
        await sendEmail({
          to: reg.profiles.email || 'voter@example.com',
          subject: `Secret Voter ID for ${selectedElection.title}`,
          bodyHtml: `
            <h3>Hello ${reg.profiles.full_name},</h3>
            <p>The voter list for <strong>${selectedElection.title}</strong> has been finalized and locked.</p>
            <p>Your unique Secret Voter ID for this election is: <strong style="font-size: 18px; color: #3b82f6;">${secretId}</strong></p>
            <p>Please keep this ID confidential. You must enter this ID to cast your vote once the voting phase begins.</p>
            <br/>
            <p>Best regards,<br/>SecureVote Team</p>
          `
        });
      }

      toast.success('Election finalized and voter list locked! Secret IDs emailed to voters.');
      
      await logActivity({
        action: 'Election Finalized & Locked',
        userId: user?.id,
        metadata: { election_id: selectedElection.id, election_title: selectedElection.title, voter_count: approvedVoters.length }
      });

      setSelectedElection({ ...selectedElection, is_locked: true, status: 'active' });
      await refreshElections();
    } catch (error: unknown) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Failed to finalize election'));
    } finally {
      setLoadingRegs(false);
    }
  };

  // If Creator is NOT approved yet
  if (isApproved === false) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="glass-card text-center p-8 d-flex flex-column align-items-center gap-6">
          <div className="p-4 bg-warning/10 text-warning rounded-2xl">
            <ShieldAlert size={48} />
          </div>
          <div>
            <h2 className="h3 font-heading mb-2">Creator Approval Pending</h2>
            <p className="text-muted leading-relaxed">
              Your registration as an Election Creator is currently being reviewed by the Super Admin. You will receive an email notification once your request has been approved.
            </p>
          </div>

          {profileData?.rejection_reason && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-left w-full">
              <span className="fw-bold d-block mb-1 text-sm">Previous rejection reason:</span>
              <span className="small text-muted">{profileData.rejection_reason}</span>
            </div>
          )}

          <div className="d-flex align-items-center gap-4 mt-2">
            <button 
              onClick={refreshProfile}
              className="glass px-6 py-2.5 rounded-xl d-flex align-items-center gap-2 hover:bg-white/5 small"
            >
              <RefreshCw size={16} /> Refresh Status
            </button>
            <Link to="/dashboard/settings" className="btn-primary py-2.5 px-6 rounded-xl small">
              Edit Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-8">
      {/* Stats Cards */}
      <div className="row g-4">
        <div className="col-md-3">
          <div className="glass-card p-6">
            <div className="p-3 rounded-xl bg-primary/20 text-primary mb-4 w-fit">
              <Vote size={24} />
            </div>
            <h3 className="h2 m-0">{elections.length}</h3>
            <p className="text-muted small m-0">Total Elections</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-6">
            <div className="p-3 rounded-xl bg-success/20 text-success mb-4 w-fit">
              <Users size={24} />
            </div>
            <h3 className="h2 m-0">{elections.reduce((acc, curr) => acc + (curr.voter_count || 0), 0)}</h3>
            <p className="text-muted small m-0">Total Registered Voters</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-6">
            <div className="p-3 rounded-xl bg-warning/20 text-warning mb-4 w-fit">
              <Clock size={24} />
            </div>
            <h3 className="h2 m-0">{elections.filter(e => e.status === 'active').length}</h3>
            <p className="text-muted small m-0">Active Polls</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-6">
            <div className="p-3 rounded-xl bg-secondary/20 text-secondary mb-4 w-fit">
              <BarChart3 size={24} />
            </div>
            <h3 className="h2 m-0">98%</h3>
            <p className="text-muted small m-0">Average Turnout</p>
          </div>
        </div>
      </div>

      {/* Elections List */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-bottom border-white/5 d-flex justify-content-between align-items-center">
          <h2 className="h4 font-heading m-0">My Elections</h2>
          <Link to="/dashboard/elections/create" className="btn-primary py-2 small">
            <Plus size={18} /> Create New
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-bottom border-white/5 bg-white/5">
                <th className="p-6 small fw-bold text-muted">ELECTION NAME</th>
                <th className="p-6 small fw-bold text-muted">STATUS</th>
                <th className="p-6 small fw-bold text-muted">VOTERS</th>
                <th className="p-6 small fw-bold text-muted">LOCK STATE</th>
                <th className="p-6 small fw-bold text-muted text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="spinner mx-auto"></div>
                  </td>
                </tr>
              ) : elections.length > 0 ? (
                elections.map((election) => (
                  <tr key={election.id} className="border-bottom border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="d-flex align-items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 d-flex align-items-center justify-content-center text-primary">
                          <Vote size={20} />
                        </div>
                        <span className="fw-bold">{election.title}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs fw-bold ${
                        election.status === 'active' ? 'bg-success/20 text-success' : 
                        election.status === 'draft' ? 'bg-muted/20 text-muted' : 
                        'bg-primary/20 text-primary'
                      }`}>
                        {election.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="d-flex flex-column gap-1">
                        <span className="small fw-bold">{election.voter_count || 0} / {election.max_voters}</span>
                        <div className="w-24 h-1-5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, ((election.voter_count || 0) / election.max_voters) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`small ${election.is_locked ? 'text-warning fw-bold' : 'text-success'}`}>
                        {election.is_locked ? 'Locked' : 'Open'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleSelectElection(election)}
                        className="glass py-1.5 px-3 rounded-lg text-xs hover:bg-white/5 transition-all"
                      >
                        Manage Voters
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-muted">
                    No elections created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voter Management Modal */}
      {selectedElection && (
        <div className="fixed inset-0 z-[200] d-flex align-items-center justify-content-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="d-flex justify-content-between align-items-center border-bottom border-white/5 pb-4 mb-6">
              <div>
                <h3 className="h4 font-heading m-0">{selectedElection.title}</h3>
                <p className="text-xs text-muted m-0">Voter Registration & Lock Management</p>
              </div>
              <button 
                onClick={() => setSelectedElection(null)} 
                className="glass p-2 rounded-lg text-muted hover:text-main"
              >
                <X size={18} />
              </button>
            </div>

            <div className="row g-6 mb-6">
              <div className="col-md-8">
                <h4 className="h5 font-heading mb-4">Voter Registrations ({registrations.length})</h4>
                <div className="d-flex flex-column gap-3 overflow-y-auto max-h-[350px] pr-2">
                  {loadingRegs ? (
                    <div className="text-center py-6">
                      <div className="spinner mx-auto"></div>
                    </div>
                  ) : registrations.length > 0 ? (
                    registrations.map((reg) => (
                      <div key={reg.id} className="glass p-4 rounded-xl d-flex flex-column flex-md-row align-items-md-center justify-content-between border-white/5 gap-4">
                        <div>
                          <p className="small fw-bold m-0">{reg.profiles.full_name}</p>
                          <p className="text-xs text-muted m-0">{reg.profiles.email} | {reg.profiles.phone || 'No Phone'}</p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] fw-bold uppercase ${
                            reg.status === 'approved' ? 'bg-success/20 text-success' :
                            reg.status === 'waitlisted' ? 'bg-warning/20 text-warning' :
                            'bg-muted/20 text-muted'
                          }`}>
                            {reg.status}
                          </span>
                          {!selectedElection.is_locked && (
                            <div className="d-flex align-items-center gap-2">
                              {reg.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateRegStatus(reg.id, 'approved')}
                                  className="glass p-1.5 rounded-lg text-success hover:bg-success/10"
                                  title="Approve Voter"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              {reg.status !== 'waitlisted' && (
                                <button
                                  onClick={() => handleUpdateRegStatus(reg.id, 'waitlisted')}
                                  className="glass p-1.5 rounded-lg text-warning hover:bg-warning/10"
                                  title="Waitlist Voter"
                                >
                                  <Clock size={14} />
                                </button>
                              )}
                              {reg.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateRegStatus(reg.id, 'rejected')}
                                  className="glass p-1.5 rounded-lg text-error hover:bg-error/10"
                                  title="Reject Voter"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-6 small">No voters registered for this election yet.</p>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <div className="glass p-5 rounded-2xl d-flex flex-column gap-4 border-white/5 h-full justify-content-between">
                  <div>
                    <h5 className="small fw-bold text-primary mb-2">LOCK STATE CONTROL</h5>
                    <p className="text-xs text-muted leading-relaxed mb-4">
                      Finalizing the voter list will lock registrations. This will automatically assign a unique, hashed Secret Voter ID to each approved voter and email/notify them.
                    </p>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 d-flex align-items-center gap-3">
                      <Lock size={16} className={selectedElection.is_locked ? 'text-warning' : 'text-success'} />
                      <div>
                        <p className="small fw-bold m-0">{selectedElection.is_locked ? 'Voter List Locked' : 'Voter List Unlocked'}</p>
                        <p className="text-xs text-muted m-0">
                          {selectedElection.is_locked ? 'No further signups permitted' : 'Open for registrations'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!selectedElection.is_locked ? (
                    <button
                      onClick={handleFinalizeList}
                      disabled={loadingRegs}
                      className="btn-primary w-full justify-content-center py-3 small mt-4"
                    >
                      {loadingRegs ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Finalize List & Lock'}
                    </button>
                  ) : (
                    <div className="text-center p-3 text-xs text-muted border border-white/5 rounded-xl mt-4">
                      List finalized. Only Super Admin can override this lock.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;

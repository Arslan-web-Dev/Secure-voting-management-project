import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserCheck, UserX, Search, Mail, Phone, Building2, FileText, Unlock, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { sendEmail } from '../../lib/emailService';
import { logActivity } from '../../lib/audit';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../lib/errors';
import type { ElectionRecord, ProfileRecord } from '../../types/models';

type CreatorRequest = Pick<
  ProfileRecord,
  | 'id'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'organization'
  | 'election_purpose'
  | 'is_approved'
  | 'rejection_reason'
  | 'created_at'
>;

type Election = Pick<
  ElectionRecord,
  'id' | 'title' | 'status' | 'is_locked' | 'max_voters'
> & { profiles?: { full_name: string } | null, rejection_reason?: string | null };

type VoterProfile = Pick<ProfileRecord, 'id' | 'full_name' | 'email'>;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CreatorRequest[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [voters, setVoters] = useState<VoterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [electionRejectionId, setElectionRejectionId] = useState<string | null>(null);
  const [electionRejectionReason, setElectionRejectionReason] = useState('');
  
  // Override Form State
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedVoterId, setSelectedVoterId] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadDashboardData = async () => {
      const [creatorRequests, electionResults, voterProfiles] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'election_creator')
          .order('created_at', { ascending: false }),
        supabase
          .from('elections')
          .select('id, title, status, is_locked, max_voters, profiles(full_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'voter'),
      ]);

      if (!isActive) {
        return;
      }

      if (!creatorRequests.error && creatorRequests.data) {
        setRequests(creatorRequests.data as CreatorRequest[]);
      }

      if (!electionResults.error && electionResults.data) {
        setElections(electionResults.data as Election[]);
      }

      if (!voterProfiles.error && voterProfiles.data) {
        setVoters(voterProfiles.data as VoterProfile[]);
      }

      setLoading(false);
    };

    void loadDashboardData();

    return () => {
      isActive = false;
    };
  }, []);

  const handleApproval = async (id: string, approve: boolean) => {
    const target = requests.find(r => r.id === id);
    if (!target) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_approved: approve,
        rejection_reason: null 
      })
      .eq('id', id);
    
    if (!error) {
      toast.success('Creator approved!');
      
      // Log audit activity
      await logActivity({
        action: 'Election Creator Approved',
        userId: user?.id,
        metadata: { creator_id: id, creator_name: target.full_name, creator_email: target.email }
      });

      // Send approval email notification
      await sendEmail({
        to: target.email || 'user@example.com',
        subject: 'Your Election Creator Request is APPROVED',
        bodyHtml: `
          <h3>Hello ${target.full_name},</h3>
          <p>We are pleased to inform you that your request to become an Election Creator has been approved by the Admin.</p>
          <p>You can now log in to the SecureVote platform, access your dashboard, and start creating elections.</p>
          <br/>
          <p>Best regards,<br/>SecureVote Administration Team</p>
        `
      });

      setRequests(requests.map(r => r.id === id ? { ...r, is_approved: approve, rejection_reason: null } : r));
    } else {
      toast.error(error.message);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionId) return;

    const target = requests.find(r => r.id === rejectionId);
    if (!target) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_approved: false, 
        rejection_reason: rejectionReason 
      })
      .eq('id', rejectionId);

    if (!error) {
      toast.error('Request rejected');

      // Log audit activity
      await logActivity({
        action: 'Election Creator Rejected',
        userId: user?.id,
        metadata: { creator_id: rejectionId, creator_name: target.full_name, reason: rejectionReason }
      });

      // Send rejection email notification
      await sendEmail({
        to: target.email || 'user@example.com',
        subject: 'Election Creator Request Rejected',
        bodyHtml: `
          <h3>Hello ${target.full_name},</h3>
          <p>We regret to inform you that your request to become an Election Creator has been rejected by the Admin.</p>
          <p><strong>Reason for rejection:</strong> ${rejectionReason}</p>
          <p>If you believe this was an error or wish to re-apply with more information, please contact support.</p>
          <br/>
          <p>Best regards,<br/>SecureVote Administration Team</p>
        `
      });

      setRequests(requests.map(r => r.id === rejectionId ? { ...r, is_approved: false, rejection_reason: rejectionReason } : r));
      setRejectionId(null);
      setRejectionReason('');
    } else {
      toast.error(error.message);
    }
  };

  const handleElectionApproval = async (id: string, approve: boolean) => {
    const target = elections.find(e => e.id === id);
    if (!target) return;

    const newStatus = approve ? 'published' : 'rejected';

    const { error } = await supabase
      .from('elections')
      .update({ 
        status: newStatus,
        rejection_reason: null 
      })
      .eq('id', id);
    
    if (!error) {
      toast.success(approve ? 'Election approved and published!' : 'Election status updated.');
      
      await logActivity({
        action: `Election ${approve ? 'Approved' : 'Rejected'}`,
        userId: user?.id,
        metadata: { election_id: id, title: target.title }
      });

      setElections(elections.map(e => e.id === id ? { ...e, status: newStatus, rejection_reason: null } : e));
    } else {
      toast.error(error.message);
    }
  };

  const handleElectionRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electionRejectionId) return;

    const target = elections.find(el => el.id === electionRejectionId);
    if (!target) return;

    const { error } = await supabase
      .from('elections')
      .update({ 
        status: 'rejected', 
        rejection_reason: electionRejectionReason 
      })
      .eq('id', electionRejectionId);

    if (!error) {
      toast.error('Election rejected');

      await logActivity({
        action: 'Election Rejected',
        userId: user?.id,
        metadata: { election_id: electionRejectionId, title: target.title, reason: electionRejectionReason }
      });

      setElections(elections.map(el => el.id === electionRejectionId ? { ...el, status: 'rejected', rejection_reason: electionRejectionReason } : el));
      setElectionRejectionId(null);
      setElectionRejectionReason('');
    } else {
      toast.error(error.message);
    }
  };

  const handleUnlockOverride = async (electionId: string) => {
    const election = elections.find(e => e.id === electionId);
    if (!election) return;

    const { error } = await supabase
      .from('elections')
      .update({ is_locked: false })
      .eq('id', electionId);

    if (!error) {
      toast.success('Election voter list unlocked (Admin Override)');
      setElections(elections.map(e => e.id === electionId ? { ...e, is_locked: false } : e));
      
      await logActivity({
        action: 'Admin Override: Unlock Voter List',
        userId: user?.id,
        metadata: { election_id: electionId, election_title: election.title }
      });
    } else {
      toast.error(error.message);
    }
  };

  const handleForceRegisterVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId || !selectedVoterId) {
      toast.error('Please select both election and voter.');
      return;
    }

    setIsOverriding(true);
    const election = elections.find(el => el.id === selectedElectionId);
    const voter = voters.find(v => v.id === selectedVoterId);
    if (!election || !voter) {
      setIsOverriding(false);
      toast.error('Selected election or voter could not be found.');
      return;
    }

    try {
      // 1. Generate unique secret voter ID
      const prefix = election.title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'EL');
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const secretId = `POLL-${prefix}-${randomSeq}`;
      const secretIdHash = btoa(secretId); // Simple hash for db
      const maskedSecretId = `****${secretId.slice(-4)}`;

      // 2. Insert voter registration with status 'approved' (Admin bypasses checks)
      const { error: regError } = await supabase
        .from('voter_registrations')
        .insert({
          election_id: selectedElectionId,
          user_id: selectedVoterId,
          secret_id_hash: secretIdHash,
          masked_secret_id: maskedSecretId,
          status: 'approved'
        });

      if (regError) throw regError;

      toast.success(`Voter successfully force-registered! Secret ID: ${secretId}`);

      // 3. Log override to audit logs
      await logActivity({
        action: 'Admin Override: Force Registered Voter',
        userId: user?.id,
        metadata: { 
          election_id: selectedElectionId, 
          election_title: election.title, 
          voter_id: selectedVoterId,
          voter_name: voter.full_name,
          secret_id_masked: maskedSecretId
        }
      });

      // 4. Send email notification
      await sendEmail({
        to: voter.email || 'voter@example.com',
        subject: `[ADMIN OVERRIDE] Secret ID for ${election.title}`,
        bodyHtml: `
          <h3>Hello ${voter.full_name},</h3>
          <p>An administrator has manually added/unlocked your registration for the upcoming election: <strong>${election.title}</strong>.</p>
          <p>Your unique and confidential Secret Voter ID is: <strong style="font-size: 18px; color: #3b82f6;">${secretId}</strong></p>
          <p>Please keep this ID safe. You will need it to cast your anonymous ballot when voting begins.</p>
          <br/>
          <p>Best regards,<br/>SecureVote Administration Team</p>
        `
      });

      setSelectedVoterId('');
    } catch (error: unknown) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Failed to force-register voter.'));
    } finally {
      setIsOverriding(false);
    }
  };

  const pendingRequests = requests.filter(r => !r.is_approved && !r.rejection_reason);
  const pendingElections = elections.filter(e => e.status === 'pending_approval');

  return (
    <div className="d-flex flex-column gap-8">
      {/* Stats */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="glass-card p-6 border-primary/20 bg-primary/5">
            <h3 className="h1 m-0">{pendingRequests.length}</h3>
            <p className="text-muted small m-0">Pending Creator Requests</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-6">
            <h3 className="h1 m-0">{requests.filter(r => r.is_approved).length}</h3>
            <p className="text-muted small m-0">Total Approved Creators</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-6">
            <h3 className="h1 m-0">{voters.length}</h3>
            <p className="text-muted small m-0">Total Registered Voters</p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-bottom border-white/5 d-flex justify-content-between align-items-center">
          <h2 className="h4 font-heading m-0">Creator Approval Queue</h2>
          <div className="glass d-flex align-items-center gap-2 px-3 py-2 rounded-lg">
            <Search size={16} className="text-muted" />
            <input type="text" placeholder="Search creators..." className="bg-transparent border-none text-main outline-none small" />
          </div>
        </div>

        <div className="p-6 d-flex flex-column gap-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner mx-auto"></div>
            </div>
          ) : pendingRequests.length > 0 ? (
            pendingRequests.map((req) => (
              <motion.div 
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl border-white/5 d-flex flex-column gap-4"
              >
                <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-6">
                  <div className="d-flex align-items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 d-flex align-items-center justify-content-center text-primary fw-bold h4">
                      {req.full_name[0]}
                    </div>
                    <div>
                      <h4 className="m-0 mb-1">{req.full_name}</h4>
                      <div className="d-flex flex-wrap gap-x-4 gap-y-1">
                        <div className="d-flex align-items-center gap-1 text-xs text-muted">
                          <Mail size={12} /> {req.email || 'No email'}
                        </div>
                        <div className="d-flex align-items-center gap-1 text-xs text-muted">
                          <Phone size={12} /> {req.phone || 'No phone'}
                        </div>
                        <div className="d-flex align-items-center gap-1 text-xs text-muted">
                          <Building2 size={12} /> {req.organization || 'No organization'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <button 
                      onClick={() => setRejectionId(req.id)}
                      className="glass p-3 rounded-xl text-error hover:bg-error/10 border-error/20"
                      title="Reject Creator"
                    >
                      <UserX size={20} />
                    </button>
                    <button 
                      onClick={() => handleApproval(req.id, true)}
                      className="btn-primary py-3 px-6 rounded-xl"
                    >
                      <UserCheck size={20} /> Approve Creator
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="d-flex align-items-center gap-2 mb-2 text-xs text-primary fw-bold">
                    <FileText size={14} /> ELECTION PURPOSE / INTENTION:
                  </div>
                  <p className="small m-0 text-muted leading-relaxed">{req.election_purpose || 'Not provided'}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-muted">
              <Shield size={48} className="mx-auto mb-4 opacity-10" />
              <p>All clear! No pending creator requests.</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal/Form */}
      {rejectionId && (
        <div className="fixed inset-0 z-[200] d-flex align-items-center justify-content-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass-card max-w-md w-full p-6"
          >
            <h3 className="h4 font-heading mb-4">Rejection Reason</h3>
            <form onSubmit={handleRejectSubmit} className="d-flex flex-column gap-4">
              <div>
                <label className="text-muted small mb-2 d-block">Please specify why you are rejecting this request:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Incomplete details, invalid organization credentials..."
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-error/50 text-main small resize-none"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setRejectionId(null); setRejectionReason(''); }}
                  className="glass px-4 py-2 rounded-xl text-muted"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary bg-error hover:bg-error-hover text-white px-5 py-2 rounded-xl">
                  Reject Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Election Rejection Modal */}
      {electionRejectionId && (
        <div className="fixed inset-0 z-[200] d-flex align-items-center justify-content-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass-card max-w-md w-full p-6"
          >
            <h3 className="h4 font-heading mb-4">Reject Election</h3>
            <form onSubmit={handleElectionRejectSubmit} className="d-flex flex-column gap-4">
              <div>
                <label className="text-muted small mb-2 d-block">Please specify why you are rejecting this election:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Invalid dates, incomplete candidate profiles..."
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-error/50 text-main small resize-none"
                  value={electionRejectionReason}
                  onChange={(e) => setElectionRejectionReason(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setElectionRejectionId(null); setElectionRejectionReason(''); }}
                  className="glass px-4 py-2 rounded-xl text-muted"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary bg-error hover:bg-error-hover text-white px-5 py-2 rounded-xl">
                  Reject Election
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-bottom border-white/5 d-flex justify-content-between align-items-center">
          <h2 className="h4 font-heading m-0">Election Approval Queue</h2>
          <span className="text-muted small">{pendingElections.length} pending</span>
        </div>
        <div className="p-6 d-flex flex-column gap-4">
          {pendingElections.length > 0 ? (
            pendingElections.map((election) => (
              <motion.div 
                key={election.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl border-white/5 d-flex flex-column gap-4"
              >
                <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-6">
                  <div>
                    <h4 className="m-0 mb-1">{election.title}</h4>
                    <p className="text-muted small m-0">Requested by: {election.profiles?.full_name || 'Unknown'}</p>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <button 
                      onClick={() => setElectionRejectionId(election.id)}
                      className="glass p-3 rounded-xl text-error hover:bg-error/10 border-error/20"
                      title="Reject Election"
                    >
                      <UserX size={20} />
                    </button>
                    <button 
                      onClick={() => handleElectionApproval(election.id, true)}
                      className="btn-primary py-3 px-6 rounded-xl"
                    >
                      <UserCheck size={20} /> Approve Election
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-muted">
              <p className="small m-0">No pending election requests.</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Overrides Panel */}
      <div className="row g-6">
        <div className="col-lg-7">
          <div className="glass-card p-6 h-full d-flex flex-column gap-6">
            <div className="d-flex justify-content-between align-items-center border-bottom border-white/5 pb-4">
              <h3 className="h4 font-heading m-0 d-flex align-items-center gap-2">
                <Unlock size={22} className="text-warning" /> Locked Elections Control
              </h3>
              <span className="text-xs text-muted">Bypass and Lock Management</span>
            </div>

            <div className="d-flex flex-column gap-3 overflow-y-auto max-h-[300px] pr-2">
              {elections.length > 0 ? (
                elections.map((election) => (
                  <div key={election.id} className="glass p-4 rounded-xl d-flex align-items-center justify-content-between border-white/5 hover:border-white/10 transition-all">
                    <div>
                      <h5 className="small fw-bold m-0 text-truncate max-w-[250px]">{election.title}</h5>
                      <p className="text-xs text-muted m-0 capitalize">Status: {election.status}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      {election.is_locked ? (
                        <>
                          <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20 d-flex align-items-center gap-1">
                            <AlertTriangle size={12} /> Locked
                          </span>
                          <button
                            onClick={() => handleUnlockOverride(election.id)}
                            className="glass py-1.5 px-3 rounded-lg text-xs text-primary hover:bg-primary/10 transition-all"
                          >
                            Force Unlock
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-6 small">No elections available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="glass-card p-6 h-full d-flex flex-column gap-6">
            <div className="border-bottom border-white/5 pb-4">
              <h3 className="h4 font-heading m-0 d-flex align-items-center gap-2">
                <Users size={22} className="text-success" /> Manual Voter Override
              </h3>
              <span className="text-xs text-muted">Register voter bypassing limits & locks</span>
            </div>

            <form onSubmit={handleForceRegisterVoter} className="d-flex flex-column gap-4">
              <div>
                <label className="text-muted small mb-2 d-block">Select Election</label>
                <select
                  required
                  className="glass w-full px-4 py-2.5 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main bg-deep small"
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                >
                  <option value="">-- Choose Election --</option>
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.title} {el.is_locked ? '(LOCKED)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted small mb-2 d-block">Select Voter Profile</label>
                <select
                  required
                  className="glass w-full px-4 py-2.5 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main bg-deep small"
                  value={selectedVoterId}
                  onChange={(e) => setSelectedVoterId(e.target.value)}
                >
                  <option value="">-- Choose Voter --</option>
                  {voters.map((vt) => (
                    <option key={vt.id} value={vt.id}>
                      {vt.full_name} ({vt.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isOverriding || !selectedElectionId || !selectedVoterId}
                className="btn-primary w-full py-3 justify-content-center small mt-2"
              >
                {isOverriding ? (
                  <div className="spinner" style={{ width: 16, height: 16 }}></div>
                ) : (
                  'Force Register Voter & Email Secret ID'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

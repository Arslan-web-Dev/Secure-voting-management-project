import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ChevronRight, Vote, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { hashString } from '../lib/crypto';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/errors';
import type { CandidateRecord } from '../types/models';

type Candidate = Pick<
  CandidateRecord,
  'id' | 'name' | 'designation' | 'photo_url'
>;

interface ElectionSummary {
  id: string;
  title: string;
}

const VotingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState<ElectionSummary | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [secretId, setSecretId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: elect } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data: cand } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', id);
      
      setElection(elect as ElectionSummary | null);
      setCandidates((cand as Candidate[] | null) || []);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const verifySecretId = async () => {
    if (!secretId || secretId.length < 4) {
      toast.error('Please enter a valid Secret ID');
      return;
    }

    // 1. Hash the entered secret ID the same way it was stored
    const enteredHash = await hashString(secretId);

    // 2. Look up the voter_registration for this election with matching hash
    const { data: reg, error } = await supabase
      .from('voter_registrations')
      .select('id, user_id, status')
      .eq('election_id', id)
      .eq('secret_id_hash', enteredHash)
      .single();

    if (error || !reg) {
      toast.error('Invalid Secret ID. Please check and try again.');
      return;
    }

    if (reg.status !== 'approved') {
      toast.error('Your voter registration has not been approved for this election.');
      return;
    }

    // 3. Check if this voter already voted
    const voterHash = await hashString(`${reg.user_id}-${id}`);
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('election_id', id)
      .eq('voter_hash', voterHash)
      .single();

    if (existingVote) {
      toast.warning('You have already cast your vote in this election.');
      return;
    }

    // Store verified user_id for vote submission
    setVerifiedUserId(reg.user_id);
    toast.success('Identity verified successfully!');
    setIsVerified(true);
  };

  const handleVote = async () => {
    if (!selectedCandidate || !verifiedUserId) return;
    setSubmitting(true);

    try {
      const voterHash = await hashString(`${verifiedUserId}-${id}`);

      const { error } = await supabase
        .from('votes')
        .insert({
          election_id: id,
          candidate_id: selectedCandidate,
          voter_hash: voterHash
        });

      if (error) {
        if (error.code === '23505') {
          toast.warning('You have already voted in this election.');
        } else {
          throw error;
        }
      } else {
        toast.success('Vote cast successfully!');
        setVoted(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to cast vote'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner"></div></div>;

  return (
    <div className="bg-deep min-vh-100 py-20">
      <div className="container max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="glass py-2 px-5 rounded-full small fw-bold hover:bg-white/5 transition-all mb-8 d-inline-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} /> Cancel & Return
        </button>
        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.div 
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="glass-card p-10 text-center"
            >
              <div className="btn-primary p-4 rounded-2xl mb-6 inline-flex shadow-lg shadow-primary/20">
                <Lock size={32} />
              </div>
              <h1 className="h2 font-heading fw-bold mb-4">Identity Verification</h1>
              <p className="text-muted mb-8">Please enter the Secret ID sent to your registered email for <b>{election?.title}</b>.</p>
              
              <div className="glass d-flex align-items-center gap-4 px-6 py-4 rounded-2xl border-white/5 focus-within:border-primary/50 transition-all mb-8">
                <Shield size={24} className="text-primary" />
                <input 
                  type="password" 
                  placeholder="Enter Secret ID (e.g. POLL-A-0001)" 
                  className="bg-transparent border-none text-main h4 m-0 outline-none w-full text-center tracking-widest"
                  value={secretId}
                  onChange={(e) => setSecretId(e.target.value.toUpperCase())}
                />
              </div>

              <button 
                onClick={verifySecretId}
                disabled={!secretId}
                className="btn-primary w-full py-4 h5 justify-content-center"
              >
                Verify & Proceed <ChevronRight size={20} />
              </button>
              
              <p className="text-xs text-muted mt-6">
                Your Secret ID is unique to you and this specific poll. 
                Never share it with anyone.
              </p>
            </motion.div>
          ) : voted ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 text-center"
            >
              <div className="p-4 rounded-full bg-success/20 text-success mb-6 inline-flex">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="h2 font-heading fw-bold mb-2">Vote Cast Successfully!</h1>
              <p className="text-muted">Your vote has been recorded anonymously. Redirecting you to dashboard...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="vote"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="d-flex flex-column gap-8"
            >
              <div className="text-center">
                <h1 className="h2 font-heading fw-bold mb-2">Cast Your Vote</h1>
                <p className="text-muted">Select one candidate and confirm your choice.</p>
              </div>

              <div className="d-flex flex-column gap-4">
                {candidates.map((candidate) => (
                  <button 
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className={`glass-card p-6 text-left transition-all ${
                      selectedCandidate === candidate.id ? 'border-primary bg-primary/10 scale-[1.02]' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden">
                          {candidate.photo_url ? (
                            <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full d-flex align-items-center justify-content-center text-primary h3 m-0">
                              {candidate.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="m-0 mb-1">{candidate.name}</h4>
                          <p className="text-xs text-muted m-0">{candidate.designation || 'Independent Candidate'}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 d-flex align-items-center justify-content-center ${
                        selectedCandidate === candidate.id ? 'border-primary bg-primary' : 'border-white/10'
                      }`}>
                        {selectedCandidate === candidate.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="glass-card p-6 bg-error/5 border-error/10 d-flex align-items-center gap-4">
                <AlertCircle className="text-error" />
                <p className="small text-muted m-0">
                  This action is <b>permanent</b>. Once you cast your vote, it cannot be changed or revoked.
                </p>
              </div>

              <button 
                onClick={handleVote}
                disabled={!selectedCandidate || submitting}
                className="btn-primary w-full py-4 h5 justify-content-center"
              >
                {submitting ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : (
                  <>Cast Anonymous Vote <Vote size={20} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VotingPage;

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Shield, Calendar, ChevronRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import type { CandidateRecord, ElectionRecord } from '../types/models';

type Candidate = Pick<
  CandidateRecord,
  'id' | 'name' | 'designation' | 'manifesto' | 'photo_url'
>;

interface Election
  extends Pick<
    ElectionRecord,
    | 'id'
    | 'title'
    | 'description'
    | 'category'
    | 'start_date'
    | 'end_date'
    | 'registration_deadline'
    | 'max_voters'
    | 'is_locked'
    | 'status'
  > {
  candidates: Candidate[];
}

const ElectionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [voterCount, setVoterCount] = useState(0);

  useEffect(() => {
    const fetchElection = async () => {
      const { data, error } = await supabase
        .from('elections')
        .select(`
          *,
          candidates (*)
        `)
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setElection(data as Election);
      }

      if (user) {
        const { data: reg } = await supabase
          .from('voter_registrations')
          .select('id')
          .eq('election_id', id)
          .eq('user_id', user.id)
          .single();
        
        setIsRegistered(!!reg);
      }

      const { count } = await supabase
        .from('voter_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('election_id', id);
      
      setVoterCount(count || 0);
      setLoading(false);
    };

    fetchElection();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 1. Check if deadline has passed
    const deadlineMs = new Date(election?.registration_deadline || '').getTime();
    if (Date.now() > deadlineMs) {
      toast.error('Registration deadline has passed for this election.');
      return;
    }

    // 2. Check if voter list is locked
    if (election?.is_locked) {
      toast.error('The voter list for this election has been finalized and locked by the creator.');
      return;
    }

    // 3. Check voter limit — if full, auto-waitlist
    const isFull = voterCount >= (election?.max_voters || 0);
    const registrationStatus = isFull ? 'waitlisted' : 'pending';

    const { error } = await supabase
      .from('voter_registrations')
      .insert({
        election_id: id,
        user_id: user.id,
        status: registrationStatus
      });
    
    if (error) {
      if (error.code === '23505') {
        toast.warning('You are already registered for this election.');
      } else {
        toast.error(error.message || 'Failed to register.');
      }
      return;
    }

    setIsRegistered(true);
    setVoterCount(prev => prev + 1);

    if (registrationStatus === 'waitlisted') {
      toast.info('You have been added to the waitlist. You will be notified if a spot becomes available.');
    } else {
      toast.success('Registration submitted! The election creator will review your application.');
    }
  };

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner"></div></div>;
  if (!election) return <div className="container py-20 text-center"><h1>Election not found</h1></div>;

  const timeLeft = new Date(election.registration_deadline).getTime() - new Date().getTime();
  const isDeadlinePassed = timeLeft < 0;
  const isFull = voterCount >= election.max_voters;
  const registrationButtonLabel = isFull ? 'Join Waitlist' : 'I Want to Participate';

  return (
    <div className="bg-deep min-vh-100 py-20">
      <div className="container">
        <button 
          onClick={() => navigate(-1)} 
          className="glass py-2 px-5 rounded-full small fw-bold hover:bg-white/5 transition-all mb-8 d-inline-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Browse
        </button>
        <div className="row g-8">
          {/* Left Column - Details */}
          <div className="col-md-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10 mb-8"
            >
              <div className="d-flex align-items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs fw-bold">
                  {(election.category ?? 'General').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs fw-bold ${
                  election.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted/20 text-muted'
                }`}>
                  {election.status.toUpperCase()}
                </span>
              </div>

              <h1 className="display-4 font-heading fw-bold mb-4">{election.title}</h1>
              <p className="lead text-muted mb-8">{election.description || 'No election description provided yet.'}</p>

              <div className="row g-6 mb-10">
                <div className="col-md-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/5 text-primary">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-muted m-0">VOTING STARTS</p>
                      <p className="fw-bold m-0">{new Date(election.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/5 text-success">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-muted m-0">VOTING ENDS</p>
                      <p className="fw-bold m-0">{new Date(election.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/5 text-warning">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-muted m-0">VOTER LIMIT</p>
                      <p className="fw-bold m-0">{voterCount} / {election.max_voters}</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="h4 font-heading mb-6 border-bottom border-white/5 pb-4">Candidates</h2>
              <div className="row g-4">
                {election.candidates.map((candidate) => (
                  <div key={candidate.id} className="col-md-6">
                    <div className="glass p-6 rounded-2xl border-white/5 hover:border-primary/30 transition-all group">
                      <div className="d-flex align-items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0">
                          {candidate.photo_url ? (
                            <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full d-flex align-items-center justify-content-center text-primary h3 m-0">
                              {candidate.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="m-0 group-hover:text-primary transition-colors">{candidate.name}</h4>
                          <p className="text-xs text-muted m-0">{candidate.designation || 'Independent Candidate'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted mt-4 line-clamp-3">
                        {candidate.manifesto || 'No manifesto shared yet.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Registration */}
          <div className="col-md-4">
            <div className="sticky top-24">
              <div className="glass-card p-8 border-primary/20 bg-primary/5">
                <h3 className="h4 font-heading mb-4">Registration Window</h3>
                
                <div className="d-flex align-items-center gap-2 mb-6 text-warning">
                  <AlertCircle size={18} />
                  <span className="small fw-bold">Ends {new Date(election.registration_deadline).toLocaleString()}</span>
                </div>

                <div className="mb-8">
                  <div className="d-flex justify-content-between text-xs mb-2">
                    <span className="text-muted">Current Participants</span>
                    <span className="fw-bold">{voterCount} / {election.max_voters}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary shadow-lg shadow-primary/50" 
                      style={{ width: `${Math.min(100, (voterCount / election.max_voters) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {isRegistered ? (
                  <div className="bg-success/20 text-success p-4 rounded-xl d-flex align-items-center justify-content-center gap-2 mb-4">
                    <CheckCircle2 size={20} />
                    <span className="fw-bold">Already Registered</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleRegister}
                    disabled={isDeadlinePassed || election.is_locked}
                    className="btn-primary w-full py-4 h5 justify-content-center mb-4"
                  >
                    {registrationButtonLabel} <ChevronRight size={20} />
                  </button>
                )}

                <p className="text-[10px] text-muted text-center m-0">
                  By participating, you agree to the voting terms and privacy policy. 
                  Your identity remains anonymous during the actual vote.
                </p>
              </div>

              <div className="glass-card p-6 mt-6">
                <div className="d-flex align-items-center gap-3 text-muted">
                  <Shield size={20} className="text-primary" />
                  <span className="small">Blockchain-verified audit log enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetails;

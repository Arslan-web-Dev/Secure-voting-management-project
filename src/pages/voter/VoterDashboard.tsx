import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Clock, CheckCircle2, AlertCircle, ChevronRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import type { ElectionStatus, RegistrationStatus } from '../../types/models';

interface RegisteredElection {
  id: string;
  status: RegistrationStatus;
  election: {
    id: string;
    title: string;
    status: ElectionStatus;
    end_date: string;
  };
}

interface RegisteredElectionRow extends Omit<RegisteredElection, 'election'> {
  election: RegisteredElection['election'][];
}

const VoterDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegisteredElection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('voter_registrations')
        .select(`
          id,
          status,
          election:election_id (
            id,
            title,
            status,
            end_date
          )
        `)
        .eq('user_id', user.id);
      
      if (!error && data) {
        const normalizedRegistrations = (data as unknown as RegisteredElectionRow[])
          .map((registration) => ({
            ...registration,
            election: registration.election[0],
          }))
          .filter(
            (
              registration
            ): registration is RegisteredElection => Boolean(registration.election)
          );

        setRegistrations(normalizedRegistrations);
      }
      setLoading(false);
    };

    fetchRegistrations();
  }, [user]);

  const activePolls = registrations.filter(r => r.election.status === 'active');

  return (
    <div className="d-flex flex-column gap-8">
      {/* Stats Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="glass-card p-6">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="p-3 rounded-xl bg-primary/20 text-primary">
                <Vote size={24} />
              </div>
            </div>
            <h3 className="h1 m-0">{registrations.length}</h3>
            <p className="text-muted small m-0">Total Polls Joined</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-6">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="p-3 rounded-xl bg-success/20 text-success">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <h3 className="h1 m-0">{registrations.filter(r => r.election.status === 'completed').length}</h3>
            <p className="text-muted small m-0">Voted Successfully</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-6">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="p-3 rounded-xl bg-warning/20 text-warning">
                <Clock size={24} />
              </div>
            </div>
            <h3 className="h1 m-0">{activePolls.length}</h3>
            <p className="text-muted small m-0">Pending Votes</p>
          </div>
        </div>
      </div>

      <div className="row g-8">
        {/* Active Polls */}
        <div className="col-md-8">
          <div className="d-flex align-items-center justify-content-between mb-6">
            <h2 className="h4 font-heading m-0">Your Active Polls</h2>
            <button className="text-primary small fw-bold">View All</button>
          </div>

          <div className="d-flex flex-column gap-4">
            {loading ? (
              <div className="text-center py-10 glass-card">
                <div className="spinner mx-auto"></div>
              </div>
            ) : activePolls.length > 0 ? (
              activePolls.map((reg) => (
                <motion.div 
                  key={reg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 d-flex align-items-center justify-content-between border-primary/20 bg-primary/5"
                >
                  <div className="d-flex align-items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 d-flex align-items-center justify-content-center text-primary">
                      <Vote size={24} />
                    </div>
                    <div>
                      <h4 className="m-0 mb-1">{reg.election.title}</h4>
                      <p className="text-xs text-muted m-0">Ends {new Date(reg.election.end_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs fw-bold ${
                      reg.status === 'approved' ? 'bg-success/20 text-success' :
                      reg.status === 'waitlisted' ? 'bg-warning/20 text-warning' :
                      reg.status === 'pending' ? 'bg-primary/20 text-primary' :
                      'bg-error/20 text-error'
                    }`}>{reg.status.toUpperCase()}</span>
                    {reg.status === 'approved' && (
                      <Link to={`/election/${reg.election.id}/vote`} className="btn-primary py-2 px-4 small">
                        Vote Now <ChevronRight size={16} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-10 text-center text-muted">
                <AlertCircle size={32} className="mx-auto mb-4 opacity-20" />
                <p className="m-0">No active polls at the moment.</p>
                <button className="text-primary small fw-bold mt-2">Browse Elections</button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming/Recent Activity */}
        <div className="col-md-4">
          <h2 className="h4 font-heading mb-6">Recent Results</h2>
          <div className="glass-card p-6 d-flex flex-column gap-6">
            {registrations.filter(r => r.election.status === 'completed').slice(0, 3).map((reg) => (
              <div key={reg.id} className="d-flex align-items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 d-flex align-items-center justify-content-center text-muted">
                  <BarChart3 size={20} />
                </div>
                <div className="flex-grow">
                  <p className="small fw-bold m-0">{reg.election.title}</p>
                  <p className="text-xs text-muted m-0">Winner: Candidate A</p>
                </div>
                <ChevronRight size={16} className="text-dim" />
              </div>
            ))}
            <button className="glass py-3 rounded-xl small fw-bold text-muted hover:text-main transition-all">
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard;

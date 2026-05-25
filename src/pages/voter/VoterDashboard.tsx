import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Clock, CheckCircle2, AlertCircle, ChevronRight, BarChart3, ExternalLink } from 'lucide-react';
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
  const [showAllPolls, setShowAllPolls] = useState(false);

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
            (registration): registration is RegisteredElection => Boolean(registration.election)
          );
        setRegistrations(normalizedRegistrations);
      }
      setLoading(false);
    };

    fetchRegistrations();
  }, [user]);

  const activePolls = registrations.filter(r =>
    r.election.status === 'active' || r.election.status === 'published'
  );
  const completedPolls = registrations.filter(r => r.election.status === 'completed');
  const displayedPolls = showAllPolls ? activePolls : activePolls.slice(0, 3);

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
            <h3 className="h1 m-0">{completedPolls.length}</h3>
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
            {activePolls.length > 3 && (
              <button
                onClick={() => setShowAllPolls(!showAllPolls)}
                className="text-primary small fw-bold hover:opacity-80 transition-all"
              >
                {showAllPolls ? 'Show Less' : `View All (${activePolls.length})`}
              </button>
            )}
            {activePolls.length === 0 && (
              <Link to="/elections" className="text-primary small fw-bold hover:opacity-80 transition-all">
                Browse Elections
              </Link>
            )}
          </div>

          <div className="d-flex flex-column gap-4">
            {loading ? (
              <div className="text-center py-10 glass-card">
                <div className="spinner mx-auto"></div>
              </div>
            ) : activePolls.length > 0 ? (
              displayedPolls.map((reg) => (
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
                      <p className="text-xs text-muted m-0">
                        Ends {new Date(reg.election.end_date).toLocaleString()}
                      </p>
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
                      <Link
                        to={`/election/${reg.election.id}/vote`}
                        className="btn-primary py-2 px-4 small"
                      >
                        Vote Now <ChevronRight size={16} />
                      </Link>
                    )}
                    {reg.status === 'pending' && (
                      <Link
                        to={`/election/${reg.election.id}`}
                        className="glass py-2 px-4 small rounded-lg hover:bg-white/5 text-muted"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-10 text-center text-muted">
                <AlertCircle size={32} className="mx-auto mb-4 opacity-20" />
                <p className="m-0 mb-3">No active polls at the moment.</p>
                <Link
                  to="/elections"
                  className="btn-primary py-2 px-5 rounded-xl small fw-bold d-inline-flex align-items-center gap-2"
                >
                  Browse Elections <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="col-md-4">
          <div className="d-flex align-items-center justify-content-between mb-6">
            <h2 className="h4 font-heading m-0">Recent Results</h2>
          </div>
          <div className="glass-card p-6 d-flex flex-column gap-4">
            {completedPolls.length === 0 ? (
              <p className="text-muted small text-center py-4">
                No completed elections yet.
              </p>
            ) : (
              <>
                {completedPolls.slice(0, 4).map((reg) => (
                  <Link
                    key={reg.id}
                    to={`/election/${reg.election.id}/results`}
                    className="d-flex align-items-center gap-4 hover:opacity-80 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 d-flex align-items-center justify-content-center text-muted flex-shrink-0">
                      <BarChart3 size={20} />
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <p className="small fw-bold m-0 text-truncate">{reg.election.title}</p>
                      <p className="text-xs text-muted m-0">Click to view results</p>
                    </div>
                    <ExternalLink size={14} className="text-dim flex-shrink-0" />
                  </Link>
                ))}
                {completedPolls.length > 4 && (
                  <p className="text-muted text-xs text-center mt-2">
                    +{completedPolls.length - 4} more completed elections
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard;

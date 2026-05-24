import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Vote, Users, TrendingUp, Trophy, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { CandidateRecord } from '../types/models';

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

interface VoteRecord {
  candidate_id: string;
}

interface ResultItem {
  name: string;
  votes: number;
}

interface ResultsElection {
  candidates: Array<Pick<CandidateRecord, 'id' | 'name'>>;
}

const ResultsDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voterStats, setVoterStats] = useState({ total: 0, voted: 0 });

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // 1. Fetch Election & Candidates
      const { data: electionData } = await supabase
        .from('elections')
        .select(`
          *,
          candidates (*)
        `)
        .eq('id', id)
        .single();
      
      const election = electionData as ResultsElection | null;

      if (!election) {
        setResults([]);
        setLoading(false);
        return;
      }

      // 2. Fetch Votes & Aggregrate
      const { data: votesData } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', id);
      
      const { count: totalVoters } = await supabase
        .from('voter_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('election_id', id);

      const votes = (votesData ?? []) as VoteRecord[];
      const voteCounts = votes.reduce<Record<string, number>>((acc, curr) => {
        acc[curr.candidate_id] = (acc[curr.candidate_id] || 0) + 1;
        return acc;
      }, {});

      const chartData = election.candidates.map((candidate) => ({
        name: candidate.name,
        votes: voteCounts[candidate.id] || 0
      }));

      setResults(chartData);
      setVoterStats({ 
        total: totalVoters || 0, 
        voted: votes?.length || 0 
      });
      setLoading(false);
    };

    fetchResults();
  }, [id]);

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner"></div></div>;

  const winner = [...results].sort((a, b) => b.votes - a.votes)[0];
  const turnout = voterStats.total > 0 ? (voterStats.voted / voterStats.total) * 100 : 0;

  return (
    <div className="bg-deep min-vh-100 py-20">
      <div className="container">
        <button 
          onClick={() => navigate(-1)} 
          className="glass py-2 px-5 rounded-full small fw-bold hover:bg-white/5 transition-all mb-8 d-inline-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="d-flex flex-column gap-8">
          <div className="row g-4">
        <div className="col-md-3">
          <div className="glass-card p-6 border-primary/20 bg-primary/5">
            <Trophy className="text-primary mb-4" size={24} />
            <h3 className="h4 m-0">{winner?.votes > 0 ? winner.name : 'TBD'}</h3>
            <p className="text-muted small m-0">Leading Candidate</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-6">
            <Users className="text-secondary mb-4" size={24} />
            <h3 className="h2 m-0">{voterStats.voted}</h3>
            <p className="text-muted small m-0">Total Votes Cast</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-6">
            <TrendingUp className="text-success mb-4" size={24} />
            <h3 className="h2 m-0">{turnout.toFixed(1)}%</h3>
            <p className="text-muted small m-0">Voter Turnout</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-6">
            <Vote className="text-warning mb-4" size={24} />
            <h3 className="h2 m-0">{voterStats.total}</h3>
            <p className="text-muted small m-0">Eligible Voters</p>
          </div>
        </div>
      </div>

      <div className="row g-6">
        <div className="col-md-8">
          <div className="glass-card p-8 h-full">
            <h2 className="h4 font-heading mb-8">Vote Distribution</h2>
            <div className="h-300 w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                    {results.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-8 h-full">
            <h2 className="h4 font-heading mb-8">Turnout Ratio</h2>
            <div className="h-250 w-full">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Voted', value: voterStats.voted },
                      { name: 'Remaining', value: voterStats.total - voterStats.voted }
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="h3 m-0 fw-bold">{turnout.toFixed(0)}%</p>
              <p className="text-xs text-muted m-0">Participation Rate</p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;

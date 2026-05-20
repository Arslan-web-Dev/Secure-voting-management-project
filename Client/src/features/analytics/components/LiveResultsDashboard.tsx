import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'react-router-dom';
import { Loader2, Trophy, Users, BarChart3, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function LiveResultsDashboard() {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [voterCount, setVoterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
    
    // Subscribe to realtime votes
    const channel = supabase.channel('realtime-votes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'votes',
        filter: `election_id=eq.${id}`
      }, (payload) => {
        setVotes(current => [...current, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [electionRes, candidatesRes, votesRes, votersRes] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id),
        supabase.from('votes').select('candidate_id').eq('election_id', id),
        supabase.from('voter_registrations').select('id', { count: 'exact' }).eq('election_id', id)
      ]);

      if (electionRes.error) throw electionRes.error;
      
      setElection(electionRes.data);
      setCandidates(candidatesRes.data || []);
      setVotes(votesRes.data || []);
      setVoterCount(votersRes.count || 0);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    setIsExporting(true);
    try {
      // Temporarily add a class to fix Recharts rendering in canvas
      element.classList.add('pdf-exporting');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff'
      });
      
      element.classList.remove('pdf-exporting');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Election_Results_${election.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  if (!election) return <div className="p-8 text-center text-red-500">Election not found</div>;

  // Process data for charts
  const totalVotes = votes.length;
  const turnoutPercentage = voterCount > 0 ? Math.round((totalVotes / voterCount) * 100) : 0;

  const chartData = candidates.map(c => {
    const candidateVotes = votes.filter(v => v.candidate_id === c.id).length;
    return {
      name: c.name,
      votes: candidateVotes,
      percentage: totalVotes > 0 ? Math.round((candidateVotes / totalVotes) * 100) : 0
    };
  }).sort((a, b) => b.votes - a.votes); // Sort by highest votes

  const winner = totalVotes > 0 && election.status === 'completed' ? chartData[0] : null;

  const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Live Results: {election.title}</h1>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
              ${election.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
              {election.status === 'active' && <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>}
              {election.status}
            </span>
            <span className="mx-3">•</span>
            <span>Real-time updates enabled</span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isExporting ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      <div id="report-content" className="p-2 -m-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Votes Cast</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVotes}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center">
          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Voter Turnout</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{turnoutPercentage}%</p>
              <p className="ml-2 text-sm text-slate-500">({totalVotes} of {voterCount})</p>
            </div>
          </div>
        </div>

        {winner ? (
          <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 rounded-xl shadow-sm border border-amber-200 dark:border-amber-700/50 p-6 flex items-center">
            <div className="p-3 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 mr-4">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Declared Winner</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-300">{winner.name}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center">
            <div className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 mr-4">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Leader</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{chartData[0]?.name || 'No votes yet'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Vote Distribution</h3>
          <div className="h-80">
            {chartData.length > 0 && totalVotes > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Not enough data to display chart</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Leaderboard</h3>
          <ul className="space-y-4">
            {chartData.map((candidate, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{candidate.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{candidate.votes}</p>
                  <p className="text-xs text-slate-500">{candidate.percentage}%</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}

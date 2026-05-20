import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, Vote, KeyRound, CheckCircle } from 'lucide-react';

interface RegisteredPoll {
  id: string;
  election_id: string;
  created_at: string;
  elections: {
    id: string;
    title: string;
    status: string;
    start_date: string;
    end_date: string;
  };
}

export default function MyPolls() {
  const { user } = useAuthStore();
  const [polls, setPolls] = useState<RegisteredPoll[]>([]);
  const [secretIds, setSecretIds] = useState<Record<string, { code: string, used: boolean }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyPolls();
    }
  }, [user]);

  const fetchMyPolls = async () => {
    try {
      // 1. Fetch registrations with election details
      const { data: regData, error: regError } = await supabase
        .from('voter_registrations')
        .select(`
          id, election_id, created_at,
          elections (id, title, status, start_date, end_date)
        `)
        .eq('voter_id', user?.id)
        .order('created_at', { ascending: false });

      if (regError) throw regError;
      setPolls(regData as unknown as RegisteredPoll[]);

      // 2. Fetch secret IDs for these polls
      const { data: secretData, error: secretError } = await supabase
        .from('secret_voter_ids')
        .select('election_id, secret_code, is_used')
        .eq('voter_id', user?.id);

      if (secretError) throw secretError;

      const secretsMap: Record<string, { code: string, used: boolean }> = {};
      secretData?.forEach(s => {
        secretsMap[s.election_id] = { code: s.secret_code, used: s.is_used };
      });
      setSecretIds(secretsMap);

    } catch (err) {
      console.error('Error fetching my polls:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          My Polls
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Elections you are registered to vote in.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {polls.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center border border-slate-200 dark:border-slate-700">
            <Vote className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No registered polls</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">You haven't joined any elections yet.</p>
            <div className="mt-6">
              <Link to="/voter" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                Browse Active Elections
              </Link>
            </div>
          </div>
        ) : (
          polls.map((poll) => {
            const election = poll.elections;
            const secret = secretIds[election.id];

            return (
              <div key={poll.id} className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="px-4 py-5 sm:p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                      ${election.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        election.status === 'completed' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {election.status === 'active' && <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>}
                      {election.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{election.title}</h3>
                  
                  <div className="mt-4 flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Registered on {new Date(poll.created_at).toLocaleDateString()}</span>
                  </div>

                  {secret && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                          <KeyRound className="h-3 w-3 mr-1" /> Secret ID
                        </span>
                        {secret.used ? (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Voted
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Unused</span>
                        )}
                      </div>
                      <p className={`font-mono text-sm tracking-wider font-bold ${secret.used ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white select-all'}`}>
                        {secret.code}
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:px-6 grid grid-cols-2 gap-2 text-center text-sm font-medium">
                  <Link to={`/voter/polls/${election.id}`} className="flex justify-center items-center text-primary hover:bg-primary/10 py-2 rounded-md transition-colors">
                    {election.status === 'active' && !secret?.used ? 'Vote Now' : 'Details'}
                  </Link>
                  <Link to={`/voter/polls/${election.id}/results`} className="flex justify-center items-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-md transition-colors">
                    Live Results
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

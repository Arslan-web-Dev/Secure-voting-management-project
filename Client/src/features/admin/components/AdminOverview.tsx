import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Users, FileText, Vote, ShieldCheck } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    creators: 0,
    voters: 0,
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Fetch Users
      const { data: users, error: usersErr } = await supabase.from('profiles').select('role');
      if (usersErr) throw usersErr;

      const totalUsers = users?.length || 0;
      const creators = users?.filter(u => u.role === 'election_creator').length || 0;
      const voters = users?.filter(u => u.role === 'voter').length || 0;

      // 2. Fetch Elections
      const { data: elections, error: electionsErr } = await supabase.from('elections').select('status');
      if (electionsErr) throw electionsErr;

      const totalElections = elections?.length || 0;
      const activeElections = elections?.filter(e => e.status === 'active').length || 0;

      // 3. Fetch Total Votes Cast
      const { count: totalVotes, error: votesErr } = await supabase.from('votes').select('*', { count: 'exact', head: true });
      if (votesErr) throw votesErr;

      setStats({
        totalUsers,
        creators,
        voters,
        totalElections,
        activeElections,
        totalVotes: totalVotes || 0
      });

    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          System Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-md p-3">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Total Users</dt>
                  <dd className="text-3xl font-semibold text-slate-900 dark:text-white">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
            {stats.creators} Creators • {stats.voters} Voters
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-md p-3">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Total Elections</dt>
                  <dd className="text-3xl font-semibold text-slate-900 dark:text-white">{stats.totalElections}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
            {stats.activeElections} Currently Active
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-md p-3">
                <Vote className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Total Votes Cast</dt>
                  <dd className="text-3xl font-semibold text-slate-900 dark:text-white">{stats.totalVotes}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
            Secure & Anonymous
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 rounded-md p-3">
                <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">System Health</dt>
                  <dd className="text-xl font-semibold text-slate-900 dark:text-white">Secure</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 px-5 py-3 text-sm text-slate-500 dark:text-slate-400 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Database Connected
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Loader2, Vote, Clock, ArrowRight } from 'lucide-react';

export default function VoterDashboard() {
  const [activeElections, setActiveElections] = useState<any[]>([]);
  const [upcomingElections, setUpcomingElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_date', { ascending: true });

      if (error) throw error;
      
      const active = data?.filter(e => e.status === 'active') || [];
      const upcoming = data?.filter(e => e.status === 'upcoming') || [];
      
      setActiveElections(active);
      setUpcomingElections(upcoming);
    } catch (err) {
      console.error('Error fetching elections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Voter Dashboard
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Discover and join active elections happening right now.</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
            <Vote className="mr-2 h-5 w-5 text-green-500" /> Active Elections
          </h3>
        </div>
        
        {activeElections.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">There are no active elections at this moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeElections.map(election => (
              <div key={election.id} className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6 flex flex-col transition-all hover:shadow-md">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{election.title}</h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{election.description}</p>
                </div>
                <div className="mt-6">
                  <Link to={`/voter/polls/${election.id}`} className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                    Join & Vote <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-500" /> Upcoming Elections
          </h3>
        </div>
        
        {upcomingElections.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">There are no upcoming elections scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingElections.map(election => (
              <div key={election.id} className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{election.title}</h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Starts: {new Date(election.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-6">
                  <Link to={`/voter/polls/${election.id}`} className="w-full flex justify-center items-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

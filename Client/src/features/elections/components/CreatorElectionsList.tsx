import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Calendar, Users, Trash2, Edit, Eye } from 'lucide-react';

interface Election {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  max_voters: number;
  registration_deadline: string;
}

export default function CreatorElectionsList() {
  const { user } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchElections();
    }
  }, [user]);

  const fetchElections = async () => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setElections(data as Election[]);
    } catch (err) {
      console.error('Error fetching elections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this election? All associated candidates and votes will be permanently lost.")) return;
    try {
      const { error } = await supabase.from('elections').delete().eq('id', id);
      if (error) throw error;
      setElections(elections.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete election', err);
      alert('Failed to delete election. Make sure you have permission.');
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            My Elections
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your created polls and elections.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <Link
            to="/creator/elections/new"
            className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Election
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {elections.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No elections</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new election.</p>
          </div>
        ) : (
          elections.map((election) => (
            <div key={election.id} className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="px-4 py-5 sm:p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                    ${election.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      election.status === 'draft' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' : 
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {election.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white truncate">{election.title}</h3>
                
                <div className="mt-4 flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  <span>{new Date(election.start_date).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Users className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  <span>Max {election.max_voters} voters</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:px-6 grid grid-cols-2 gap-2 text-center text-sm font-medium">
                <Link to={`/creator/elections/${election.id}`} className="flex justify-center items-center text-primary hover:bg-primary/10 py-2 rounded-md">
                   Candidates
                </Link>
                <Link to={`/creator/elections/${election.id}/voters`} className="flex justify-center items-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-md">
                   Voters
                </Link>
                <Link to={`/creator/elections/${election.id}/edit`} className="flex justify-center items-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-md">
                   Edit
                </Link>
                <button onClick={() => handleDelete(election.id)} className="flex justify-center items-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-md">
                   Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

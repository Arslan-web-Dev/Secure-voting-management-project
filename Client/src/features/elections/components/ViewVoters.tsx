import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ViewVoters() {
  const { id } = useParams<{ id: string }>();
  const [voters, setVoters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVoters();
  }, [id]);

  const fetchVoters = async () => {
    try {
      const { data, error } = await supabase
        .from('voter_registrations')
        .select('*, profiles(name, email)')
        .eq('election_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoters(data || []);
    } catch (err) {
      console.error('Error fetching voters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="max-w-4xl bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Registered Voters</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered At</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {voters.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No voters registered yet.</td>
              </tr>
            ) : voters.map((voter) => (
              <tr key={voter.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                  {voter.profiles?.name || 'Anonymous User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {voter.profiles?.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {new Date(voter.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

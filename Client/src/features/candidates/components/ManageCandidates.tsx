import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'react-router-dom';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  designation: string;
  manifesto: string;
  photo_url: string;
}

export default function ManageCandidates() {
  const { id: electionId } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    manifesto: '',
  });

  useEffect(() => {
    fetchCandidates();
  }, [electionId]);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setCandidates(data as Candidate[]);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .insert([{ ...formData, election_id: electionId }]);

      if (error) throw error;
      
      setFormData({ name: '', designation: '', manifesto: '' });
      setIsAdding(false);
      await fetchCandidates();
    } catch (err) {
      console.error('Failed to add candidate', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (candidateId: string) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', candidateId);
      if (error) throw error;
      await fetchCandidates();
    } catch (err) {
      console.error('Failed to delete candidate', err);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Manage Candidates
          </h2>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {isAdding ? 'Cancel' : 'Add Candidate'}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 mb-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">New Candidate Details</h3>
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Designation / Party</label>
                <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Manifesto / Description</label>
                <textarea rows={3} required value={formData.manifesto} onChange={(e) => setFormData({...formData, manifesto: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isLoading} className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Save Candidate
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && !isAdding ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {candidates.length === 0 ? (
              <li className="p-6 text-center text-slate-500">No candidates added yet.</li>
            ) : candidates.map(candidate => (
              <li key={candidate.id} className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{candidate.name}</h4>
                  <p className="text-sm font-medium text-primary mb-2">{candidate.designation}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">{candidate.manifesto}</p>
                </div>
                <button onClick={() => handleDelete(candidate.id)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

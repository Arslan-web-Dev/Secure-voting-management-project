import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function CreateElectionForm() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_voters: 1000,
    status: 'draft' as 'draft' | 'upcoming',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent, isPublishing: boolean) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const statusToSet = isPublishing ? 'upcoming' : 'draft';
      
      const { error: insertError } = await supabase
        .from('elections')
        .insert([{
          ...formData,
          creator_id: user.id,
          status: statusToSet
        }]);

      if (insertError) throw insertError;

      navigate('/creator/elections');
    } catch (err: any) {
      setError(err.message || 'Failed to create election');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 max-w-3xl">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Create New Election</h2>
      
      <form className="space-y-6">
        {error && (
          <div className="bg-red-50 p-3 rounded text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <input type="text" name="category" placeholder="E.g., Student Council" value={formData.category} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Maximum Voters</label>
            <input type="number" name="max_voters" min="1" required value={formData.max_voters} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Registration Deadline</label>
            <input type="datetime-local" name="registration_deadline" required value={formData.registration_deadline} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
            <input type="datetime-local" name="start_date" required value={formData.start_date} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
            <input type="datetime-local" name="end_date" required value={formData.end_date} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-5 flex justify-end space-x-3">
          <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={isLoading}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
          >
            Save as Draft
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish Election
          </button>
        </div>
      </form>
    </div>
  );
}

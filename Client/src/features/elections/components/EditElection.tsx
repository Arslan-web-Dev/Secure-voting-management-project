import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function EditElection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_voters: 1000,
    status: 'draft',
  });

  useEffect(() => {
    fetchElection();
  }, [id]);

  const fetchElection = async () => {
    try {
      const { data, error } = await supabase.from('elections').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        // Format dates for datetime-local input
        const formatDateTime = (dateStr: string) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };

        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          start_date: formatDateTime(data.start_date),
          end_date: formatDateTime(data.end_date),
          registration_deadline: formatDateTime(data.registration_deadline),
          max_voters: data.max_voters,
          status: data.status,
        });
      }
    } catch (err) {
      console.error('Failed to fetch election', err);
      setError('Failed to load election data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('elections')
        .update(formData)
        .eq('id', id);

      if (updateError) throw updateError;
      navigate('/creator/elections');
    } catch (err: any) {
      setError(err.message || 'Failed to update election');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 max-w-3xl">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Edit Election</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="pt-5 flex justify-end">
          <button type="submit" disabled={isSaving}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

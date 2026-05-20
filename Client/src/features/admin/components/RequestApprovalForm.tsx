import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function RequestApprovalForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuthStore();
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { error: reqError } = await supabase
        .from('election_requests')
        .insert([{ creator_id: user.id, purpose }]);

      if (reqError) throw reqError;
      
      setSuccess(true);
      setPurpose('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-800 text-center">
        <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Request Submitted!</h3>
        <p className="text-green-600 dark:text-green-400">Your request for hosting an election is pending admin approval. You will be notified once reviewed.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm font-medium text-green-700 hover:text-green-800 underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Request Election Approval</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        As a new Election Creator, you must provide a reason for hosting elections. 
        Once the admin approves, you can start creating polls.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 p-3 rounded text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Purpose of Election
          </label>
          <textarea
            required
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="E.g., University Student Council Elections 2026..."
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !purpose.trim()}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Request
        </button>
      </form>
    </div>
  );
}

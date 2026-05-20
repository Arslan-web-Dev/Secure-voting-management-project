import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Request {
  id: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    name: string;
    email?: string;
    organization?: string;
  };
}

export default function ApprovalDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('election_requests')
        .select('*, profiles(name, organization)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data as any);
    } catch (err) {
      console.error('Error fetching requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('election_requests')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      
      // Log action
      await supabase.from('audit_logs').insert([{ action: `request_${status}`, details: { request_id: id } }]);
      
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">
          Election Creator Approvals
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review and approve requests from users wanting to host elections.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Creator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No requests found.</td>
              </tr>
            ) : requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{req.profiles?.name}</div>
                  <div className="text-sm text-slate-500">{req.profiles?.organization || 'No Org'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 dark:text-slate-300 max-w-xs truncate" title={req.purpose}>{req.purpose}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${req.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      req.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {req.status === 'pending' && (
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from 'react-router-dom';
import RequestApprovalForm from '@/features/admin/components/RequestApprovalForm';
import { 
  Loader2, Plus, List, Vote, CheckCircle2, 
  Clock, AlertCircle, HelpCircle, Users, BarChart3, ShieldAlert 
} from 'lucide-react';

interface Request {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  purpose: string;
  rejection_reason: string | null;
  created_at: string;
}

interface Election {
  id: string;
  title: string;
  status: 'draft' | 'upcoming' | 'active' | 'registration_closed' | 'completed';
  max_voters: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function CreatorOverview() {
  const { user, profile } = useAuthStore();
  const [request, setRequest] = useState<Request | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });

  useEffect(() => {
    if (user) {
      checkApprovalAndFetchData();
    }
  }, [user]);

  const checkApprovalAndFetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch latest approval request
      const { data: requestData, error: requestError } = await supabase
        .from('election_requests')
        .select('*')
        .eq('creator_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (requestError) throw requestError;
      
      const latestRequest = requestData && requestData.length > 0 ? requestData[0] as Request : null;
      setRequest(latestRequest);

      // If approved or if super_admin (super admin bypassed approval), fetch dashboard stats and elections
      if (latestRequest?.status === 'approved' || profile?.role === 'super_admin') {
        const { data: electionsData, error: electionsError } = await supabase
          .from('elections')
          .select('*')
          .eq('creator_id', user!.id)
          .order('created_at', { ascending: false });

        if (electionsError) throw electionsError;

        const creatorElections = (electionsData || []) as Election[];
        setElections(creatorElections);

        // Compute stats
        const active = creatorElections.filter(e => e.status === 'active').length;
        const upcoming = creatorElections.filter(e => e.status === 'upcoming').length;
        const completed = creatorElections.filter(e => e.status === 'completed').length;

        setStats({
          total: creatorElections.length,
          active,
          upcoming,
          completed
        });
      }
    } catch (err) {
      console.error('Error fetching creator dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  // Handle case: User is election creator but hasn't submitted a request or was rejected
  const isSuperAdmin = profile?.role === 'super_admin';
  const isApproved = request?.status === 'approved' || isSuperAdmin;

  if (!isApproved) {
    // 1. No request submitted yet
    if (!request) {
      return (
        <div className="max-w-3xl space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl p-6 flex items-start gap-4">
            <ShieldAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Approval Required</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                To prevent spam and secure platform integrity, election creators must request admin approval prior to publishing polls.
              </p>
            </div>
          </div>
          <RequestApprovalForm onSuccess={checkApprovalAndFetchData} />
        </div>
      );
    }

    // 2. Request is pending
    if (request.status === 'pending') {
      return (
        <div className="max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center border border-amber-200">
            <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Approval Pending</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your request is currently being reviewed by the platform administrator. You will gain access to election creation features once approved.
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase">Your Submitted Purpose:</span>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium italic">"{request.purpose}"</p>
          </div>
        </div>
      );
    }

    // 3. Request was rejected
    if (request.status === 'rejected') {
      return (
        <div className="max-w-3xl space-y-6">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">Approval Request Rejected</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Your previous request was rejected. Rejection reason:
                <strong className="block mt-1 font-bold text-red-900 dark:text-white">
                  {request.rejection_reason || 'No reason provided.'}
                </strong>
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 shadow rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Submit New Request</h3>
            <RequestApprovalForm onSuccess={checkApprovalAndFetchData} />
          </div>
        </div>
      );
    }
  }

  // Dashboard UI for approved creators
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl">
            Welcome back, {profile?.name || 'Creator'}!
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isSuperAdmin ? 'Platform Super Admin Access Enabled' : 'Approved Election Creator Panel'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/creator/elections/new"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/20 hover:shadow-primary/45"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create Election
          </Link>
          <Link
            to="/creator/elections"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600"
          >
            <List className="mr-1.5 h-4 w-4" /> View Elections
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Elections', value: stats.total, icon: Vote, color: 'text-primary bg-primary/10' },
          { label: 'Active Polls', value: stats.active, icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
          { label: 'Upcoming Polls', value: stats.upcoming, icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Completed Polls', value: stats.completed, icon: BarChart3, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{s.value}</h4>
            </div>
            <div className={`p-4 rounded-2xl ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Elections List */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Elections</h3>
            <p className="text-xs text-slate-500">Overview of your recently created polls</p>
          </div>
          <Link to="/creator/elections" className="text-xs font-bold text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Capacity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {elections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No elections created yet. Get started by creating your first poll!
                  </td>
                </tr>
              ) : (
                elections.slice(0, 5).map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">{e.title}</div>
                      <div className="text-xs text-slate-400">Created: {new Date(e.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-bold leading-5 rounded-full uppercase tracking-wider
                        ${e.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 
                          e.status === 'completed' ? 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300' : 
                          e.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(e.start_date).toLocaleDateString()} - {new Date(e.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {e.max_voters} voters
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                      <Link to={`/creator/elections/${e.id}`} className="text-primary hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

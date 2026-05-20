import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, FileText, Download, Filter, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  created_at: string;
  details: any;
  user_id: string | null;
  profiles: {
    name: string;
    role: string;
  } | null;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [actionTypes, setActionTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Fetch audit logs and join profiles
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(name, role)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const fetchedLogs = data as AuditLog[];
      setLogs(fetchedLogs);

      // Extract unique action types for filter
      const types = Array.from(new Set(fetchedLogs.map(l => l.action)));
      setActionTypes(types);
    } catch (err) {
      console.error('Error fetching audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Timestamp', 'Action', 'Performed By', 'Role', 'Details'];
    const rows = logs.map(log => [
      new Date(log.created_at).toISOString(),
      log.action,
      log.profiles?.name || 'System / Anonymous',
      log.profiles?.role || 'N/A',
      JSON.stringify(log.details)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = filterAction === 'all' 
    ? logs 
    : logs.filter(log => log.action === filterAction);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Audit Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track and monitor platform actions for security compliance.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchLogs}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl bg-primary hover:bg-primary/95 text-sm font-medium text-white shadow-sm transition disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <Filter className="h-5 w-5 text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter Action:</span>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Actions</option>
          {actionTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No logs found.</td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {log.profiles?.name || 'System / Anonymous'}
                    </div>
                    {log.profiles?.role && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {log.profiles.role.replace('_', ' ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono text-xs max-w-md truncate" title={JSON.stringify(log.details)}>
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

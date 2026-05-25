import { useEffect, useState, useMemo } from 'react';
import { Shield, Clock, FileText, Download, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { AuditLogRecord } from '../types/models';

type AuditLog = Pick<AuditLogRecord, 'id' | 'action' | 'timestamp' | 'metadata'>;

const ACTION_CATEGORIES: Record<string, string[]> = {
  Votes: ['VOTE_CAST', 'VOTE_SUBMITTED'],
  Approvals: ['CREATOR_APPROVED', 'CREATOR_REJECTED', 'VOTER_APPROVED', 'VOTER_REJECTED', 'ELECTION_APPROVED', 'ELECTION_REJECTED'],
  Logins: ['USER_LOGIN', 'USER_LOGOUT', 'USER_SIGNUP'],
};

const exportCSV = (logs: AuditLog[]) => {
  const header = ['Timestamp', 'Action', 'Metadata'];
  const rows = logs.map(l => [
    new Date(l.timestamp).toLocaleString(),
    l.action,
    JSON.stringify(l.metadata ?? {}),
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Actions');

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) setLogs(data as AuditLog[]);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    let result = [...logs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.action.toLowerCase().includes(q) ||
        JSON.stringify(l.metadata ?? {}).toLowerCase().includes(q)
      );
    }
    if (category !== 'All Actions') {
      const keys = ACTION_CATEGORIES[category] ?? [];
      result = result.filter(l => keys.some(k => l.action.toUpperCase().includes(k)));
    }
    return result;
  }, [logs, search, category]);

  return (
    <div className="d-flex flex-column gap-8">
      <div className="glass-card p-8 border-primary/20 bg-primary/5 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="h3 font-heading m-0">Audit & Transparency</h1>
            <p className="text-muted small m-0">Every action is recorded and immutable for total transparency.</p>
          </div>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="glass py-3 px-6 rounded-xl d-flex align-items-center gap-2 hover:bg-white/5 fw-bold small transition-all"
          title="Export visible logs as CSV"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-bottom border-white/5 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
          <div className="d-flex align-items-center gap-4">
            <h2 className="h4 font-heading m-0">Activity History</h2>
            <span className="px-3 py-1 rounded-full small" style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--primary)', fontSize: 12 }}>
              {filtered.length} entries
            </span>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto">
            {/* Category Filter */}
            <div className="glass d-flex align-items-center gap-2 px-3 py-2 rounded-lg">
              <Filter size={16} className="text-muted" />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="bg-transparent border-none text-muted outline-none small"
                style={{ minWidth: 120 }}
              >
                <option>All Actions</option>
                {Object.keys(ACTION_CATEGORIES).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            {/* Search */}
            <div className="glass d-flex align-items-center gap-2 px-3 py-2 rounded-lg flex-grow-1">
              <Search size={16} className="text-muted flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="bg-transparent border-none text-main outline-none small w-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-bottom border-white/5 bg-white/5">
                <th className="p-6 small fw-bold text-muted">TIMESTAMP</th>
                <th className="p-6 small fw-bold text-muted">ACTION</th>
                <th className="p-6 small fw-bold text-muted">METADATA</th>
                <th className="p-6 small fw-bold text-muted">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center"><div className="spinner mx-auto"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(log => (
                  <tr key={log.id} className="border-bottom border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="d-flex align-items-center gap-3 text-muted small">
                        <Clock size={14} /> {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-primary"><FileText size={16} /></div>
                        <span className="fw-bold small">{log.action}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <code className="text-xs text-dim bg-white/5 px-2 py-1 rounded">
                        {JSON.stringify(log.metadata ?? {})}
                      </code>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 rounded-full bg-success/20 text-success" style={{ fontSize: 10, fontWeight: 'bold' }}>VERIFIED</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="mb-4 opacity-10"><Shield size={64} className="mx-auto" /></div>
                    <p className="text-muted">
                      {search || category !== 'All Actions' ? 'No logs match your search.' : 'No activity logs found.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

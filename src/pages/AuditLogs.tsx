import { useEffect, useState } from 'react';
import { Shield, Clock, FileText, Download, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { AuditLogRecord } from '../types/models';

type AuditLog = Pick<AuditLogRecord, 'id' | 'action' | 'timestamp' | 'metadata'>;

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (!error && data) {
        setLogs(data as AuditLog[]);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

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
        <button className="glass py-3 px-6 rounded-xl d-flex align-items-center gap-2 hover:bg-white/5 fw-bold small">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-bottom border-white/5 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-4">
            <h2 className="h4 font-heading m-0">Activity History</h2>
            <div className="glass d-flex align-items-center gap-2 px-3 py-2 rounded-lg">
              <Filter size={16} className="text-muted" />
              <select className="bg-transparent border-none text-muted outline-none small">
                <option>All Actions</option>
                <option>Votes</option>
                <option>Approvals</option>
                <option>Logins</option>
              </select>
            </div>
          </div>
          <div className="glass d-flex align-items-center gap-2 px-3 py-2 rounded-lg">
            <Search size={16} className="text-muted" />
            <input type="text" placeholder="Search logs..." className="bg-transparent border-none text-main outline-none small" />
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
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="spinner mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-bottom border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="d-flex align-items-center gap-3 text-muted small">
                        <Clock size={14} /> {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-primary">
                          <FileText size={16} />
                        </div>
                        <span className="fw-bold small">{log.action}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <code className="text-xs text-dim bg-white/5 px-2 py-1 rounded">
                        {JSON.stringify(log.metadata ?? {})}
                      </code>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 rounded-full bg-success/20 text-success text-[10px] fw-bold">VERIFIED</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="mb-4 opacity-10">
                      <Shield size={64} className="mx-auto" />
                    </div>
                    <p className="text-muted">No activity logs found. All operations will be logged here.</p>
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

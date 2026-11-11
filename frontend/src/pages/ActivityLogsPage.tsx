import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { apiRequest } from '../services/api';
import type { ActivityLog } from '../types';
import { History, ShieldCheck, Search, RefreshCw, Clock } from 'lucide-react';

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<ActivityLog[]>('/activity-logs?limit=150');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.user_name && l.user_name.toLowerCase().includes(q)) ||
      (l.user_role && l.user_role.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <Header
        title="Immutable Operational & Security Audit Trail"
        subtitle="Chronological record of authentication events, capacity adjustments, and referral lifecycle transactions"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="card-healthcare p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit events by keyword, actor, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Audit Log</span>
          </button>
        </div>

        <div className="card-healthcare overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header border-b border-slate-200">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Operational Action Performed</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Querying activity logs...
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((l) => (
                    <tr key={l.log_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{l.log_id}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {l.created_at.replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {l.user_name || 'System / Batch'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {l.user_role || 'System'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium max-w-md">
                        {l.action}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {l.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

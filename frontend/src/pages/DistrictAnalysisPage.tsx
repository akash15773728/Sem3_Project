import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { LevelDashboardResponse, District } from '../types';
import {
  MapPin,
  Building2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Filter,
  Calendar,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const DistrictAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [levelData, setLevelData] = useState<LevelDashboardResponse | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(90);
  const [selectedState, setSelectedState] = useState<string>(
    user?.role === 'State Officer' && user.state_name ? user.state_name : 'Delhi NCR'
  );

  const fetchDistrictData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('level', 'State');
      params.set('state_name', selectedState);
      params.set('days', String(days));

      const [dash, dists] = await Promise.all([
        apiRequest<LevelDashboardResponse>(`/analytics/dashboard-level?${params.toString()}`),
        apiRequest<District[]>('/districts')
      ]);

      setLevelData(dash);
      setDistricts(dists);
    } catch (err) {
      console.error('Failed to load district analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictData();
  }, [days, selectedState]);

  const regionalBreakdown = levelData?.regional_breakdown || [];

  return (
    <div>
      <Header
        title="District-Level Referral Outflow & Comparison"
        subtitle="Comparing administrative districts to detect regional healthcare service gaps and referral concentrations"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Jurisdiction Filter Banner */}
        <div className="card-healthcare p-5 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
                Multi-District Comparison
              </span>
              <span className="text-xs text-slate-500">
                State: <strong>{selectedState}</strong>
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Statewide District Referral Outflow Analysis
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Identify which districts generate excess patient referrals due to missing localized secondary care infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role !== 'State Officer' && (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
              >
                <option value="Delhi NCR">Delhi NCR State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            )}

            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-700 focus:outline-none"
              >
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
                <option value={180}>Last 180 Days</option>
                <option value={365}>Last 365 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* District Referral Bar Chart */}
        <div className="card-healthcare p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                District Referral Outflow & Identified Gaps
              </h3>
              <p className="text-xs text-slate-500">Comparative volume of patient transfers dispatched by each district</p>
            </div>
          </div>

          <div className="h-72">
            {regionalBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="referral_count" name="Referral Outflow" fill="#0F766E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gap_count" name="Identified Service Gaps" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading district breakdown...
              </div>
            )}
          </div>
        </div>

        {/* District Detail Cards Table */}
        <div className="card-healthcare p-6 bg-white space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Districts Directory & Drill-Down ({regionalBreakdown.length})
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">District Name</th>
                  <th className="py-3 px-4 text-center">Referral Volume</th>
                  <th className="py-3 px-4 text-center">Identified Service Gaps</th>
                  <th className="py-3 px-4">Dominant Missing Resource</th>
                  <th className="py-3 px-4">Deficit Status</th>
                  <th className="py-3 px-4 text-right">Drill-Down Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {regionalBreakdown.map((dist, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-teal-700" />
                      <span>{dist.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {dist.referral_count}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-600">
                      {dist.gap_count}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {dist.primary_shortage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dist.status === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : dist.status === 'Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {dist.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/hospital-analysis')}
                        className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-bold"
                      >
                        <span>Inspect Hospitals</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

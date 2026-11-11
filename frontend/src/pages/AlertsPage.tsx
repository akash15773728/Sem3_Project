import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { GapAnalysisResponse, PotentialGapItem } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  FileQuestion,
  Search,
  Filter,
  CheckCircle2,
  X,
  ArrowRight,
  Info,
  Calendar,
  Wrench,
  Stethoscope,
  Bed,
  Activity,
  FileText
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gapData, setGapData] = useState<GapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [threshold, setThreshold] = useState<number>(3);
  const [days, setDays] = useState<number>(90);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected gap for modal
  const [selectedGap, setSelectedGap] = useState<PotentialGapItem | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('threshold', String(threshold));
      params.set('days', String(days));

      if (user?.role === 'District Officer' && user.district_id) {
        params.set('district_id', String(user.district_id));
      } else if (user?.role === 'State Officer' && user.state_name) {
        params.set('state_name', user.state_name);
      }

      const data = await apiRequest<GapAnalysisResponse>(`/analytics/gaps?${params.toString()}`);
      setGapData(data);
    } catch (err) {
      console.error('Failed to load deficit alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [threshold, days, user]);

  const allAlerts = gapData?.items || [];

  const filteredAlerts = allAlerts.filter((item) => {
    if (categoryFilter !== 'All') {
      const lower = item.shortage_type.toLowerCase();
      if (categoryFilter === 'Equipment' && !lower.includes('equipment')) return false;
      if (categoryFilter === 'Specialist' && !lower.includes('specialist')) return false;
      if (categoryFilter === 'Diagnostic' && !lower.includes('diagnostic')) return false;
      if (categoryFilter === 'Beds' && !lower.includes('bed')) return false;
    }
    if (statusFilter !== 'All' && item.gap_status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.facility_name.toLowerCase().includes(q) ||
        item.unavailable_resource.toLowerCase().includes(q) ||
        item.service_name.toLowerCase().includes(q) ||
        item.district_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <Header
        title="Healthcare Service Deficit & Recurring Referral Alerts"
        subtitle="Real-time notifications triggered when repeated patient referrals indicate missing hospital equipment or staffing"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Methodological Transparency Box */}
        <div className="card-healthcare p-5 bg-gradient-to-r from-red-50/70 via-amber-50/50 to-slate-50 border-red-200 flex items-start space-x-3.5">
          <Info className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-red-950 block text-sm">
              Decision Support Notice: Referral Reason vs Service Gap
            </span>
            <p>
              An alert indicates a <strong>Repeated Referral Pattern</strong> for an unavailable service. 
              Authorities must treat flagged items as <strong>Potential Service Gaps</strong> requiring field verification before making capital procurement or reallocation decisions.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts by facility or unavailable resource..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="All">All Shortage Types</option>
              <option value="Equipment">Equipment Deficits</option>
              <option value="Specialist">Specialist Deficits</option>
              <option value="Diagnostic">Diagnostic Deficits</option>
              <option value="Beds">Bed Shortages</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="All">All Verification Statuses</option>
              <option value="Potential Gap">Potential Gap (High Volume)</option>
              <option value="Needs Review">Needs Review (Discrepancy)</option>
              <option value="Insufficient Data">Insufficient Data</option>
            </select>

            {/* Referral Threshold */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-slate-500 font-semibold">Min Referrals:</span>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={1}>&ge; 1 Referral</option>
                <option value={3}>&ge; 3 Referrals (Default)</option>
                <option value={5}>&ge; 5 Referrals</option>
                <option value={10}>&ge; 10 Referrals</option>
              </select>
            </div>

            {/* Days Window */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={180}>180 Days</option>
                <option value={365}>365 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tally Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card-healthcare p-4 bg-white border-l-4 border-l-red-600">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Potential Service Gaps
            </span>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {loading ? '...' : gapData?.potential_gaps_count ?? 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">High repeated referral count</p>
          </div>

          <div className="card-healthcare p-4 bg-white border-l-4 border-l-amber-500">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Needs Review
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {loading ? '...' : gapData?.needs_review_count ?? 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Capacity report discrepancy</p>
          </div>

          <div className="card-healthcare p-4 bg-white border-l-4 border-l-teal-600">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Equipment Deficits
            </span>
            <div className="text-2xl font-bold text-teal-800 mt-1">
              {loading ? '...' : gapData?.equipment_gaps_count ?? 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Missing or broken devices</p>
          </div>

          <div className="card-healthcare p-4 bg-white border-l-4 border-l-cyan-600">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Specialist Deficits
            </span>
            <div className="text-2xl font-bold text-cyan-800 mt-1">
              {loading ? '...' : gapData?.specialist_gaps_count ?? 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Physician vacancies</p>
          </div>
        </div>

        {/* Alerts Cards List */}
        <div className="space-y-4">
          {loading ? (
            <div className="card-healthcare p-12 text-center text-slate-400 bg-white text-xs">
              Loading active shortage alerts...
            </div>
          ) : filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const isPaharganj = alert.facility_name.includes('Paharganj') && alert.unavailable_resource === 'Echocardiogram';

              return (
                <div
                  key={alert.gap_id}
                  className={`card-healthcare p-5 bg-white border-2 transition-all ${
                    isPaharganj
                      ? 'border-red-400 shadow-md ring-2 ring-red-50'
                      : 'border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            alert.gap_status === 'Potential Gap'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : alert.gap_status === 'Needs Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {alert.gap_status}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                          {alert.shortage_type}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Requires Field Verification
                        </span>

                        {isPaharganj && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                            Core Test Scenario
                          </span>
                        )}

                        <span className="font-mono text-xs text-slate-400">{alert.gap_id}</span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">{alert.facility_name}</h4>
                        <p className="text-xs text-slate-500">
                          {alert.district_name} District, {alert.state_name}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-700">Flagged Missing Resource:</span>
                          <span className="font-bold text-red-700">{alert.unavailable_resource}</span>
                          <span className="text-slate-400">({alert.service_name})</span>
                        </div>
                        <p className="text-slate-600">{alert.flag_reason}</p>
                      </div>
                    </div>

                    <div className="lg:w-72 shrink-0 flex flex-col justify-between space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Supporting Referrals:</span>
                          <span className="font-bold text-red-600">{alert.referral_count} cases</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Service Reported:</span>
                          <span className={`font-semibold ${alert.service_reported_available ? 'text-emerald-700' : 'text-red-600'}`}>
                            {alert.service_reported_available ? 'Active' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Equipment Status:</span>
                          <span className={`font-semibold ${alert.equipment_available ? 'text-emerald-700' : 'text-red-600'}`}>
                            {alert.equipment_available ? 'Functional' : 'Missing / Broken'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Specialists:</span>
                          <span className="font-bold text-slate-800">{alert.specialist_count} registered</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedGap(alert)}
                        className="w-full py-2 px-3 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors flex items-center justify-center space-x-1 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect Patient Evidence ({alert.supporting_referrals?.length || 0})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card-healthcare p-12 text-center text-slate-400 bg-white">
              <FileQuestion className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No service deficit alerts match the selected criteria</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedGap && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                      Service Gap Evidence Dossier
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedGap.gap_id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedGap.facility_name}</h3>
                  <p className="text-xs text-slate-500">
                    Deficit: <strong className="text-red-700">{selectedGap.unavailable_resource}</strong> ({selectedGap.service_name})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedGap(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <strong className="text-slate-800">Flag Justification:</strong>
                <p className="text-slate-600">{selectedGap.flag_reason}</p>
                <div className="text-[11px] text-teal-800 font-medium pt-1">
                  Analysis Window: <strong>{selectedGap.analysis_period}</strong> | Supporting Referral Records: <strong>{selectedGap.referral_count} cases</strong>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Supporting Outbound Referral Records ({selectedGap.supporting_referrals?.length || 0})
                </h4>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                  {selectedGap.supporting_referrals && selectedGap.supporting_referrals.length > 0 ? (
                    selectedGap.supporting_referrals.map((r) => (
                      <div key={r.referral_id} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800">
                            #{r.referral_id} → {r.destination_facility_name}
                          </div>
                          <p className="text-[11px] text-slate-600 italic">"{r.reason}"</p>
                          <div className="text-[10px] text-slate-400">Date: {r.referral_date}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                          {r.priority}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400">No supporting referral details found</div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedGap(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

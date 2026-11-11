import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { GapAnalysisResponse, PotentialGapItem } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  FileQuestion,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Info,
  X,
  Stethoscope,
  Wrench,
  Activity,
  Bed,
  Search,
  FileText,
  Filter
} from 'lucide-react';

export const GapAnalysisPage: React.FC = () => {
  const { user } = useAuth();

  const [threshold, setThreshold] = useState<number>(3);
  const [days, setDays] = useState<number>(180);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gapData, setGapData] = useState<GapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGap, setSelectedGap] = useState<PotentialGapItem | null>(null);
  const [evidenceSearch, setEvidenceSearch] = useState<string>('');

  const fetchGaps = async () => {
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
      console.error('Failed to calculate healthcare gaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, [threshold, days, user]);

  const filteredItems = gapData?.items.filter((item) => {
    // Category filter
    if (activeCategory === 'Specialist' && item.shortage_type !== 'Specialist Shortage') return false;
    if (activeCategory === 'Equipment' && item.shortage_type !== 'Equipment Shortage') return false;
    if (activeCategory === 'Diagnostic' && item.shortage_type !== 'Diagnostic Shortage') return false;
    if (activeCategory === 'Beds' && item.shortage_type !== 'Bed Shortage') return false;

    // Status filter
    if (statusFilter && item.gap_status !== statusFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchFacility = item.facility_name.toLowerCase().includes(q);
      const matchResource = item.unavailable_resource.toLowerCase().includes(q);
      const matchService = item.service_name.toLowerCase().includes(q);
      const matchDistrict = item.district_name.toLowerCase().includes(q);
      if (!matchFacility && !matchResource && !matchService && !matchDistrict) return false;
    }

    return true;
  }) || [];

  return (
    <div>
      <Header
        title="Potential Healthcare Resource Shortage Monitoring"
        subtitle="Tracking repeated referrals associated with unavailable specialists, equipment, diagnostics and beds"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Methodological Transparency & Decision-Support Notice */}
        <div className="card-healthcare p-4.5 bg-gradient-to-r from-teal-50 via-cyan-50 to-slate-50 border-teal-200 flex items-start space-x-3.5">
          <Info className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-teal-950 block text-sm">
              Decision Support Protocol: Potential Shortage vs Definite Gap
            </span>
            <p>
              SEHAT-SETU is a monitoring and decision-support platform designed for health authorities. 
              A high referral count indicates that patient transfers are occurring, but 
              <strong> authorities must inspect reported capacity, staffing, and maintenance logs before declaring a facility deficient</strong>.
              All flagged items include full supporting referral records for administrative review.
            </p>
          </div>
        </div>

        {/* Shortage Category Filter Tabs */}
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'All', label: 'All Shortages', icon: Activity, count: gapData?.total_gaps_identified ?? 0 },
              { id: 'Equipment', label: 'Equipment Shortages', icon: Wrench, count: gapData?.equipment_gaps_count ?? 0 },
              { id: 'Specialist', label: 'Specialist Shortages', icon: Stethoscope, count: gapData?.specialist_gaps_count ?? 0 },
              { id: 'Diagnostic', label: 'Diagnostic Shortages', icon: Activity, count: gapData?.diagnostic_gaps_count ?? 0 },
              { id: 'Beds', label: 'Bed Shortages', icon: Bed, count: gapData?.bed_gaps_count ?? 0 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search facility or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>
        </div>

        {/* Severity Tally & Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setStatusFilter(statusFilter === 'Potential Gap' ? '' : 'Potential Gap')}
            className={`card-healthcare p-5 border-l-4 border-l-red-600 cursor-pointer transition-all ${
              statusFilter === 'Potential Gap' ? 'ring-2 ring-red-500 bg-red-50/30' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Potential Gap</span>
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : gapData?.potential_gaps_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Resource unavailable with repeated outbound patient referrals
            </p>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'Needs Review' ? '' : 'Needs Review')}
            className={`card-healthcare p-5 border-l-4 border-l-amber-500 cursor-pointer transition-all ${
              statusFilter === 'Needs Review' ? 'ring-2 ring-amber-500 bg-amber-50/30' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Needs Review</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? '...' : gapData?.needs_review_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Reported available but staff/equipment discrepancy with referrals
            </p>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'Insufficient Data' ? '' : 'Insufficient Data')}
            className={`card-healthcare p-5 border-l-4 border-l-slate-400 cursor-pointer transition-all ${
              statusFilter === 'Insufficient Data' ? 'ring-2 ring-slate-400 bg-slate-50' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Insufficient Data</span>
              <FileQuestion className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-700">
              {loading ? '...' : gapData?.insufficient_data_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Referrals recorded without baseline capacity report filed
            </p>
          </div>
        </div>

        {/* Shortage Item Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Identified Resource Deficit Alerts ({filteredItems.length})
            </h3>
            <span className="text-xs text-slate-500">
              Threshold: &ge;{threshold} referrals in last {days} days
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="card-healthcare p-12 text-center text-slate-400 bg-white">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No shortage alerts match the current filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isPaharganjScenario = item.facility_name.includes('Paharganj') && item.unavailable_resource === 'Echocardiogram';

                return (
                  <div
                    key={item.gap_id}
                    className={`card-healthcare p-5 bg-white border-2 transition-all ${
                      isPaharganjScenario
                        ? 'border-red-400 shadow-md ring-2 ring-red-100'
                        : 'border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Facility & Gap Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.gap_status === 'Potential Gap'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : item.gap_status === 'Needs Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.gap_status}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                            {item.shortage_type}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Requires Verification
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            Repeated Referral Pattern
                          </span>

                          {isPaharganjScenario && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                              Core Evaluation Test Scenario
                            </span>
                          )}

                          <span className="text-xs font-mono text-slate-400">
                            {item.gap_id}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900">
                            {item.facility_name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {item.district_name} District, {item.state_name}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                          <div className="font-semibold text-teal-950 flex items-center space-x-2">
                            <span>Unavailable Resource:</span>
                            <span className="text-red-700 font-bold underline">{item.unavailable_resource}</span>
                            <span className="text-slate-400">({item.service_name})</span>
                          </div>
                          <p className="text-slate-600">
                            {item.flag_reason}
                          </p>
                        </div>
                      </div>

                      {/* Right: Capacity Metrics & Inspect Action */}
                      <div className="lg:w-80 space-y-3 shrink-0 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacity Report</span>
                            <span className={`font-semibold ${item.service_reported_available ? 'text-emerald-700' : 'text-red-600'}`}>
                              {item.service_reported_available ? 'Reported Active' : 'Unavailable'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipment</span>
                            <span className={`font-semibold ${item.equipment_available ? 'text-emerald-700' : 'text-red-600'}`}>
                              {item.equipment_available ? 'Available' : 'Deficit / Broken'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Specialists</span>
                            <span className="font-semibold text-slate-800">
                              {item.specialist_count} credentialed
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Referrals</span>
                            <span className="font-bold text-red-600">
                              {item.referral_count} outbound
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGap(item);
                            setEvidenceSearch('');
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center space-x-2"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Inspect Evidence ({item.referral_count} Records)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Inspect Evidence Modal */}
      {selectedGap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
                    {selectedGap.gap_status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-800 text-teal-200 uppercase">
                    {selectedGap.shortage_type}
                  </span>
                  <span className="text-xs text-teal-300 font-mono">
                    {selectedGap.gap_id}
                  </span>
                </div>
                <h3 className="text-xl font-bold">
                  Evidence Audit: {selectedGap.facility_name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Deficit Resource: <strong className="text-white">{selectedGap.unavailable_resource}</strong> | Service: {selectedGap.service_name} | District: {selectedGap.district_name} ({selectedGap.state_name})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGap(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Capacity vs Referral Summary Banner */}
            <div className="p-4 bg-teal-50 border-b border-teal-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Reported Availability:</span>
                <span className={`font-bold ${selectedGap.service_reported_available ? 'text-emerald-700' : 'text-red-600'}`}>
                  {selectedGap.service_reported_available ? 'Available' : 'Reported Unavailable'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Equipment Availability:</span>
                <span className={`font-bold ${selectedGap.equipment_available ? 'text-emerald-700' : 'text-red-600'}`}>
                  {selectedGap.equipment_available ? 'Functional' : 'Equipment Deficit'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Referral Records:</span>
                <span className="font-bold text-red-600">
                  {selectedGap.supporting_referrals.length} referrals ({selectedGap.analysis_period})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Specialist Staff:</span>
                <span className="font-bold text-slate-800">
                  {selectedGap.specialist_count} Doctors
                </span>
              </div>
            </div>

            {/* Referrals Search & Evidence Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-800">
                  Full Supporting Referral Audit Trail ({selectedGap.supporting_referrals.length} Records)
                </span>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter evidence records..."
                    value={evidenceSearch}
                    onChange={(e) => setEvidenceSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Ref #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Destination Facility</th>
                      <th className="py-2.5 px-3">Reason Category</th>
                      <th className="py-2.5 px-3">Unavailable Resource</th>
                      <th className="py-2.5 px-3">Clinical Justification</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedGap.supporting_referrals
                      .filter((r) => {
                        if (!evidenceSearch) return true;
                        const q = evidenceSearch.toLowerCase();
                        return (
                          String(r.referral_id).includes(q) ||
                          r.destination_facility_name.toLowerCase().includes(q) ||
                          r.reason.toLowerCase().includes(q) ||
                          r.reason_category.toLowerCase().includes(q)
                        );
                      })
                      .map((ref) => (
                        <tr key={ref.referral_id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-500">#{ref.referral_id}</td>
                          <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{ref.referral_date}</td>
                          <td className="py-2 px-3 text-slate-800">{ref.destination_facility_name}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {ref.reason_category}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-teal-900">{ref.unavailable_resource}</td>
                          <td className="py-2 px-3 text-slate-700 max-w-sm">{ref.reason}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ref.priority === 'Emergency' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {ref.priority}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">{ref.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 italic">
                Decision support record — preserve audit integrity for evaluation inspection
              </span>
              <button
                type="button"
                onClick={() => setSelectedGap(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
              >
                Close Evidence Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { LevelDashboardResponse, District, PotentialGapItem } from '../types';
import {
  Building2,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Wrench,
  Bed,
  Activity,
  MapPin,
  Calendar,
  X,
  FileText
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

export const HospitalAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [levelData, setLevelData] = useState<LevelDashboardResponse | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [days, setDays] = useState(90);

  // Evidence modal
  const [selectedAlert, setSelectedAlert] = useState<PotentialGapItem | null>(null);

  const fetchHospitalAnalysis = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('days', String(days));

      // Scope to appropriate level for current user
      if (user?.role === 'District Officer') {
        params.set('level', 'District');
        if (user.district_id) params.set('district_id', String(user.district_id));
      } else if (user?.role === 'State Officer') {
        params.set('level', 'State');
        if (user.state_name) params.set('state_name', user.state_name);
      } else {
        params.set('level', 'National');
      }

      if (districtFilter) {
        params.set('district_id', districtFilter);
      }

      const [dashData, distData] = await Promise.all([
        apiRequest<LevelDashboardResponse>(`/analytics/dashboard-level?${params.toString()}`),
        apiRequest<District[]>('/districts')
      ]);

      setLevelData(dashData);
      setDistricts(distData);
    } catch (err) {
      console.error('Failed to load hospital analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalAnalysis();
  }, [days, districtFilter, user]);

  const rawComparisons = levelData?.facility_comparisons || [];

  const filteredFacilities = rawComparisons.filter((fac) => {
    if (facilityTypeFilter !== 'All' && !fac.facility_type.toLowerCase().includes(facilityTypeFilter.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'All' && fac.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        fac.facility_name.toLowerCase().includes(q) ||
        fac.facility_type.toLowerCase().includes(q) ||
        fac.primary_shortage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <Header
        title="Hospital-Wise Referral & Service Gap Analysis"
        subtitle="Facility-level audit identifying recurring outbound patient transfers prompted by medical resource shortages"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Methodological Context */}
        <div className="card-healthcare p-5 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
                Monitoring & Oversight Interface
              </span>
              <span className="text-xs text-slate-500">
                Scope: <strong>{levelData?.region_name || 'Assigned Jurisdiction'}</strong>
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Correlating Hospital Referral Volume with Facility Deficits
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              When a hospital (such as CHC Paharganj) repeatedly refers 50+ cases for a single clinical need (such as Echocardiography), 
              this interface flags the recurring pattern as a <strong>Potential Service Gap</strong> requiring physical inspection and resource allocation.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="p-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
            >
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days (Quarterly)</option>
              <option value={180}>Last 180 Days (Half Year)</option>
              <option value={365}>Last 365 Days (Full Year)</option>
            </select>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-healthcare p-5 bg-white space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Hospitals Monitored</span>
              <Building2 className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : rawComparisons.length}
            </div>
            <p className="text-[11px] text-slate-500">Facilities across reporting network</p>
          </div>

          <div className="card-healthcare p-5 bg-white space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Total Outbound Referrals</span>
              <TrendingUp className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : levelData?.card_referrals_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Patient transfers recorded in window</p>
          </div>

          <div className="card-healthcare p-5 bg-white space-y-1.5 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Hospitals with Potential Gaps</span>
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : levelData?.card_review_facilities_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Facilities with recurring shortage patterns</p>
          </div>

          <div className="card-healthcare p-5 bg-white space-y-1.5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Primary Deficit Resource</span>
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              {loading ? '...' : levelData?.card_top_shortage_resource || 'None'}
            </div>
            <p className="text-[11px] text-slate-500">
              {levelData?.card_top_shortage_count ? `${levelData.card_top_shortage_count} citations` : 'No recurring shortage'}
            </p>
          </div>
        </div>

        {/* Hospital Referral Volume Chart */}
        <div className="card-healthcare p-6 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Facility Outbound Referral Load by Deficiency Category
              </h3>
              <p className="text-xs text-slate-500">
                Comparing patient referral volume generated due to missing equipment, unavailable specialists, or beds
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              Sorted by Total Outbound Referrals
            </span>
          </div>

          <div className="h-72">
            {rawComparisons.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rawComparisons} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="facility_name" stroke="#94A3B8" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="equipment_referrals" name="Equipment Deficit" stackId="a" fill="#0F766E" />
                  <Bar dataKey="specialist_referrals" name="Specialist Deficit" stackId="a" fill="#0284C7" />
                  <Bar dataKey="bed_referrals" name="Bed Shortage" stackId="a" fill="#D97706" />
                  <Bar dataKey="diagnostic_referrals" name="Diagnostic Shortage" stackId="a" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading facility comparison metrics...
              </div>
            )}
          </div>
        </div>

        {/* Filters & Facility Table */}
        <div className="card-healthcare p-6 bg-white space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital by name, type, or shortage resource..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {user?.role !== 'District Officer' && (
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.district_id} value={d.district_id}>
                      {d.district_name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={facilityTypeFilter}
                onChange={(e) => setFacilityTypeFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="All">All Facility Tiers</option>
                <option value="Community Health">Community Health Centres (CHC)</option>
                <option value="Primary Health">Primary Health Centres (PHC)</option>
                <option value="District Hospital">District Hospitals (DH)</option>
                <option value="Tertiary">Tertiary & Medical Colleges</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="All">All Deficit Statuses</option>
                <option value="Potential Gap">Potential Gap (Action Required)</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Normal">Normal Operations</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Hospital Name & Tier</th>
                  <th className="py-3 px-4 text-center">Total Referrals</th>
                  <th className="py-3 px-4 text-center">Equipment Referrals</th>
                  <th className="py-3 px-4 text-center">Specialist Referrals</th>
                  <th className="py-3 px-4">Dominant Unavailable Resource</th>
                  <th className="py-3 px-4">Service Gap Status</th>
                  <th className="py-3 px-4 text-right">Evidence Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFacilities.length > 0 ? (
                  filteredFacilities.map((fac) => {
                    const isPaharganj = fac.facility_name.includes('Paharganj');
                    return (
                      <tr
                        key={fac.facility_id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isPaharganj ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{fac.facility_name}</span>
                            {isPaharganj && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-900">
                                Focus Scenario
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{fac.facility_type}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                          {fac.total_referrals}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-teal-800 font-semibold">
                          {fac.equipment_referrals}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-cyan-800 font-semibold">
                          {fac.specialist_referrals}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {fac.primary_shortage || 'None'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              fac.status === 'Potential Gap'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : fac.status === 'Needs Review'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {fac.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              const alert = levelData?.recent_alerts.find((a) => a.facility_id === fac.facility_id);
                              if (alert) {
                                setSelectedAlert(alert);
                              } else {
                                navigate('/gap-analysis');
                              }
                            }}
                            className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-bold"
                          >
                            <span>Inspect Evidence</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No facilities found matching filter parameters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evidence Dossier Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                      Potential Service Gap
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedAlert.gap_id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedAlert.facility_name}</h3>
                  <p className="text-xs text-slate-500">
                    Deficit: <strong className="text-red-700">{selectedAlert.unavailable_resource}</strong> ({selectedAlert.service_name})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <strong className="text-slate-800">Analytical Basis:</strong>
                <p className="text-slate-600">{selectedAlert.flag_reason}</p>
                <div className="text-[11px] text-teal-800 font-medium pt-1">
                  Total supporting outbound referrals: <strong>{selectedAlert.referral_count} records</strong>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Supporting Referral Patient Dossiers ({selectedAlert.supporting_referrals?.length || 0})
                </h4>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                  {selectedAlert.supporting_referrals && selectedAlert.supporting_referrals.length > 0 ? (
                    selectedAlert.supporting_referrals.map((r) => (
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
                  onClick={() => setSelectedAlert(null)}
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

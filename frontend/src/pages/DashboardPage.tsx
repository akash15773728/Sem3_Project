import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/Header';
import { GeographicalHeatMap } from '../components/GeographicalHeatMap';
import { apiRequest } from '../services/api';
import type { LevelDashboardResponse, PotentialGapItem, Referral } from '../types';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  Wrench,
  Search,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  PlusCircle,
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const isHospitalStaff = user?.role === 'Facility Staff';
  const isDistrictOfficer = user?.role === 'District Officer';
  const isStateOfficer = user?.role === 'State Officer';
  const isNationalOfficer = user?.role === 'National Officer';
  const isAdmin = user?.role === 'Administrator';

  // Active level for authorities
  const defaultLevel = isNationalOfficer
    ? 'National'
    : isStateOfficer
    ? 'State'
    : 'District';

  const [activeLevel, setActiveLevel] = useState<'District' | 'State' | 'National'>(defaultLevel);
  const [days, setDays] = useState<number>(90);
  const [dashboardData, setDashboardData] = useState<LevelDashboardResponse | null>(null);
  const [referralsList, setReferralsList] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  // Shortage Alerts Table filters
  const [alertSearch, setAlertSearch] = useState('');
  const [alertCategoryFilter, setAlertCategoryFilter] = useState('All');
  const [alertStatusFilter, setAlertStatusFilter] = useState('All');
  const [alertPage, setAlertPage] = useState(1);
  const alertsPerPage = 5;

  // Selected Evidence Gap for Modal
  const [selectedEvidenceGap, setSelectedEvidenceGap] = useState<PotentialGapItem | null>(null);

  // Fetch Dashboard data
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        if (isHospitalStaff) {
          // Hospital user queries referrals scoped to their facility
          const refs = await apiRequest<Referral[]>(`/referrals?limit=100`);
          setReferralsList(refs);
        } else {
          // Authorities query hierarchical level dashboard
          const params = new URLSearchParams();
          params.set('level', activeLevel);
          params.set('days', String(days));

          if (activeLevel === 'District') {
            const distId = isDistrictOfficer && user?.district_id ? user.district_id : 1;
            params.set('district_id', String(distId));
          } else if (activeLevel === 'State') {
            const stName = isStateOfficer && user?.state_name ? user.state_name : 'Delhi NCR';
            params.set('state_name', stName);
          }

          const [dashResp, refResp] = await Promise.all([
            apiRequest<LevelDashboardResponse>(`/analytics/dashboard-level?${params.toString()}`),
            apiRequest<Referral[]>(`/referrals?limit=10`)
          ]);

          setDashboardData(dashResp);
          setReferralsList(refResp);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [activeLevel, days, user, isHospitalStaff, isDistrictOfficer, isStateOfficer]);

  // Filter alerts for the authority alerts table
  const allAlerts = dashboardData?.recent_alerts || [];
  const filteredAlerts = allAlerts.filter((item) => {
    if (alertCategoryFilter !== 'All') {
      const cat = item.shortage_type.toLowerCase();
      if (alertCategoryFilter === 'Equipment' && !cat.includes('equipment')) return false;
      if (alertCategoryFilter === 'Specialist' && !cat.includes('specialist')) return false;
      if (alertCategoryFilter === 'Diagnostic' && !cat.includes('diagnostic')) return false;
      if (alertCategoryFilter === 'Beds' && !cat.includes('bed')) return false;
    }
    if (alertStatusFilter !== 'All' && item.gap_status !== alertStatusFilter) {
      return false;
    }
    if (alertSearch.trim()) {
      const q = alertSearch.toLowerCase();
      return (
        item.facility_name.toLowerCase().includes(q) ||
        item.unavailable_resource.toLowerCase().includes(q) ||
        item.service_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage) || 1;
  const paginatedAlerts = filteredAlerts.slice(
    (alertPage - 1) * alertsPerPage,
    alertPage * alertsPerPage
  );

  // ==========================================
  // VIEW A: DEDICATED HOSPITAL DASHBOARD
  // ==========================================
  if (isHospitalStaff) {
    const facilityId = user?.facility_id;
    const outboundReferrals = referralsList.filter((r) => r.source_facility_id === facilityId);
    const inboundReferrals = referralsList.filter((r) => r.destination_facility_id === facilityId);

    const pendingCount = referralsList.filter((r) => r.status === 'Pending').length;
    const completedCount = referralsList.filter((r) => r.status === 'Completed').length;
    const emergencyCount = referralsList.filter((r) => r.priority === 'Emergency').length;

    // Tally top unavailable resources prompting outbound referrals
    const shortageTally: Record<string, number> = {};
    outboundReferrals.forEach((r) => {
      const res = r.unavailable_resource || r.service_name || 'Unspecified';
      shortageTally[res] = (shortageTally[res] || 0) + 1;
    });
    const topShortages = Object.entries(shortageTally)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return (
      <div className="bg-slate-50/70 dark:bg-slate-950 min-h-screen pb-12 transition-colors">
        <Header
          title={`${user?.facility_name || 'Hospital'} — Operational Referral Dashboard`}
          subtitle="Hospital-level referral dispatch, inbound patient intake, and capacity deficiency logging"
        />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Hospital Context Banner */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Operational Referral Facility
                  </span>
                  <span className="text-xs text-slate-400">
                    Staff: <strong>{user?.name}</strong> ({user?.role})
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {user?.facility_name || 'Primary Healthcare Facility'}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/referrals/new')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Referral</span>
              </button>

              <button
                onClick={() => navigate('/referrals/upload')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Upload Referral Records</span>
              </button>

              <button
                onClick={() => navigate('/capacity')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Update Capacity</span>
              </button>
            </div>
          </div>

          {/* Scenario Context Notice */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-start space-x-3.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
              <Info className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </div>
            <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Healthcare Service Gap Identification Workflow
              </span>
              <p>
                When your facility records repeated referrals citing missing medical equipment (such as <strong>2D Echocardiograms</strong>) or specialist vacancies, the platform automatically flags these recurring transfers as <strong>Potential Service Gaps</strong> for district and state healthcare directors.
              </p>
            </div>
          </div>

          {/* Hospital Statistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div
              onClick={() => navigate('/referrals')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Outgoing Referrals
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{outboundReferrals.length}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Transferred to higher care</p>
            </div>

            <div
              onClick={() => navigate('/referrals')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Incoming Referrals
                </span>
                <ArrowDownLeft className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{inboundReferrals.length}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Patients received</p>
            </div>

            <div
              onClick={() => navigate('/referrals')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pending Referrals
                </span>
                <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Awaiting acceptance/handover</p>
            </div>

            <div
              onClick={() => navigate('/referrals')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Completed Care
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{completedCount}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Successfully handled cases</p>
            </div>

            <div
              onClick={() => navigate('/referrals')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Emergency Triage
                </span>
                <AlertTriangle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{emergencyCount}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Urgent transfers</p>
            </div>
          </div>

          {/* Deficit Resources Bar Chart & Top Cited Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Top Reported Deficits Prompting Outbound Referrals
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Medical resources unavailable at {user?.facility_name}</p>
                </div>
              </div>

              <div className="h-64">
                {topShortages.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topShortages} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F1F5F9'} />
                      <XAxis type="number" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          borderRadius: '12px',
                          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                          fontSize: '11px',
                          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.4)'
                        }}
                        itemStyle={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
                        labelStyle={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}
                      />
                      <Bar dataKey="count" name="Referral Count" fill={isDark ? '#60A5FA' : '#2563EB'} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                    No outbound referrals recorded
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Recent Deficit Summary */}
            <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Facility Quick Actions</h3>
              <div className="space-y-2.5 text-xs">
                <button
                  onClick={() => navigate('/referrals/new')}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                      <PlusCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Record Outgoing Patient Referral</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Dispatch clinical transfer dossier</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/referrals/upload')}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Bulk Ingestion from Logbook</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Upload CSV spreadsheet of referrals</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/capacity')}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Update Facility Capacity Declaration</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Maintain specialist and equipment rosters</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Outbound Referrals Table */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Recent Outbound Referrals ({outboundReferrals.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Patient transfers dispatched from {user?.facility_name}</p>
              </div>
              <button
                onClick={() => navigate('/referrals')}
                className="text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 cursor-pointer"
              >
                <span>View Full Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    <th className="py-2.5 px-3">Ref ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Destination Hospital</th>
                    <th className="py-2.5 px-3">Unavailable Medical Resource</th>
                    <th className="py-2.5 px-3">Clinical Justification</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  {outboundReferrals.slice(0, 8).map((r) => (
                    <tr key={r.referral_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">#{r.referral_id}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{r.referral_date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{r.destination_facility_name}</td>
                      <td className="py-2.5 px-3 font-bold text-red-600">{r.unavailable_resource || r.service_name}</td>
                      <td className="py-2.5 px-3 max-w-xs truncate">{r.reason}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.priority === 'Emergency' ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          r.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => navigate(`/referrals/${r.referral_id}`)}
                          className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-bold hover:underline underline-offset-2 cursor-pointer"
                        >
                          Manage
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
  }

  // ==========================================
  // VIEW B: DISTRICT / STATE / NATIONAL AUTHORITY DASHBOARD
  // ==========================================
  const authorityScopeTitle = activeLevel === 'District'
    ? `District Referral Analytics — ${dashboardData?.region_name || 'Central Delhi District'}`
    : activeLevel === 'State'
    ? `State Healthcare Referral Analytics — ${dashboardData?.region_name || 'Delhi NCR State'}`
    : `National Healthcare Referral Analytics — India`;

  return (
    <div className="bg-slate-50/70 dark:bg-slate-950 min-h-screen pb-12 transition-colors">
      <Header
        title={authorityScopeTitle}
        subtitle="Decision-support analytics correlating outbound referrals with reported facility capacity to identify service gaps"
      />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Jurisdiction & Context Banner */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Assigned Authority Scope
                </span>
                <span className="text-xs text-slate-400">
                  Officer: <strong>{user?.name}</strong> ({user?.role})
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {dashboardData?.region_name || 'Assigned Region'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Level Selector - ONLY for Administrator */}
            {isAdmin && (
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                {(['District', 'State', 'National'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setActiveLevel(lvl);
                      setAlertPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeLevel === lvl
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {lvl} Level
                  </button>
                ))}
              </div>
            )}

            {/* Date Range Selector */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Period:</span>
              <select
                value={days}
                onChange={(e) => {
                  setDays(Number(e.target.value));
                  setAlertPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={30} className="dark:bg-slate-900">Last 30 Days (1 Month)</option>
                <option value={90} className="dark:bg-slate-900">Last 90 Days (Quarterly - Recommended)</option>
                <option value={180} className="dark:bg-slate-900">Last 180 Days (6 Months)</option>
                <option value={365} className="dark:bg-slate-900">Last 365 Days (1 Year)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 1: Five Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => navigate('/hospital-analysis')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monitored Facilities
              </span>
              <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : dashboardData?.card_facilities_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Facilities in {activeLevel.toLowerCase()} scope</p>
          </div>

          <div
            onClick={() => navigate('/analytics')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Referrals
              </span>
              <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : dashboardData?.card_referrals_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Outbound cases in period</p>
          </div>

          <div
            onClick={() => navigate('/gap-analysis')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-red-400 dark:hover:border-red-600 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Potential Service Gaps
              </span>
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {loading ? '...' : dashboardData?.card_potential_gaps_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Flagged for verification</p>
          </div>

          <div
            onClick={() => navigate('/hospital-analysis')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Recurring Pattern Hospitals
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {loading ? '...' : dashboardData?.card_review_facilities_count ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Hospitals with repeat referrals</p>
          </div>

          <div
            onClick={() => navigate('/gap-analysis')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Top Missing Resource
              </span>
              <Wrench className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {loading ? '...' : dashboardData?.card_top_shortage_resource ?? 'None'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {dashboardData?.card_top_shortage_count ? `${dashboardData.card_top_shortage_count} citations` : 'Normal capacity'}
            </p>
          </div>
        </div>

        {/* SECTION 2: Geographic Heat Map & Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <GeographicalHeatMap
              districtName={dashboardData?.region_name || 'Central Delhi'}
              nodes={dashboardData?.heat_map_nodes || []}
              onInspectEvidence={(facId, facName) => {
                const found = dashboardData?.recent_alerts.find(
                  (a) => a.facility_id === facId || a.facility_name.includes(facName)
                );
                if (found) setSelectedEvidenceGap(found);
                else navigate('/gap-analysis');
              }}
            />
          </div>

          {/* Temporal Trend Chart */}
          <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Monthly Referral Trajectory</h3>
                <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Temporal Trends
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Aggregated outbound patient transfers over time</p>
            </div>

            <div className="h-64">
              {dashboardData?.trends && dashboardData.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F1F5F9'} />
                    <XAxis dataKey="date" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} />
                    <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        borderRadius: '12px',
                        border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                        fontSize: '11px',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.4)'
                      }}
                      itemStyle={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
                      labelStyle={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="referral_count" name="Total Referrals" stroke={isDark ? '#60A5FA' : '#2563EB'} strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="equipment_referrals" name="Equipment Deficit" stroke="#DC2626" strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="specialist_referrals" name="Specialist Deficit" stroke="#0284C7" strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No trend data in window
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Repeated pattern analysis:</span>
              <strong className="text-slate-900 dark:text-white">Echocardiography (50+ referrals)</strong>
            </div>
          </div>
        </div>

        {/* SECTION 3: Deficit Alerts Table */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400">
                  Real-Time Alerts
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Flagged Potential Service Gaps ({filteredAlerts.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hospital transfers indicating potential unavailable medical equipment or specialists requiring verification
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/gap-analysis')}
                className="text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 cursor-pointer"
              >
                <span>Explore All Gaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inline Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={alertSearch}
                onChange={(e) => {
                  setAlertSearch(e.target.value);
                  setAlertPage(1);
                }}
                placeholder="Search alerts..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <select
                value={alertCategoryFilter}
                onChange={(e) => {
                  setAlertCategoryFilter(e.target.value);
                  setAlertPage(1);
                }}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Categories</option>
                <option value="Equipment" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Equipment Deficits</option>
                <option value="Specialist" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Specialist Deficits</option>
                <option value="Diagnostic" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Diagnostic Deficits</option>
                <option value="Beds" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Bed Shortages</option>
              </select>

              <select
                value={alertStatusFilter}
                onChange={(e) => {
                  setAlertStatusFilter(e.target.value);
                  setAlertPage(1);
                }}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="All" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Statuses</option>
                <option value="Potential Gap" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Potential Gap</option>
                <option value="Needs Review" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Needs Review</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Deficit Resource</th>
                  <th className="py-2.5 px-3 text-center">Referrals</th>
                  <th className="py-2.5 px-3">Shortage Type</th>
                  <th className="py-2.5 px-3">Verification Status</th>
                  <th className="py-2.5 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {paginatedAlerts.length > 0 ? (
                  paginatedAlerts.map((a) => (
                    <tr key={a.gap_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{a.facility_name}</td>
                      <td className="py-2.5 px-3 font-semibold text-red-600 dark:text-red-400">{a.unavailable_resource}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">{a.referral_count}</td>
                      <td className="py-2.5 px-3">{a.shortage_type}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.gap_status === 'Potential Gap' ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400'
                        }`}>
                          {a.gap_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedEvidenceGap(a)}
                          className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-bold hover:underline underline-offset-2 cursor-pointer"
                        >
                          Inspect Evidence
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-slate-500">
                      No active deficit alerts matching filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-500 dark:text-slate-400">
                Page {alertPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  disabled={alertPage <= 1}
                  onClick={() => setAlertPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={alertPage >= totalPages}
                  onClick={() => setAlertPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Supporting Dossier */}
        {selectedEvidenceGap && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400">
                      Potential Service Gap Evidence
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedEvidenceGap.gap_id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedEvidenceGap.facility_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Deficit: <strong className="text-red-600 dark:text-red-400">{selectedEvidenceGap.unavailable_resource}</strong> ({selectedEvidenceGap.service_name})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedEvidenceGap(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <strong className="text-slate-800 dark:text-slate-200">Audit Justification:</strong>
                <p className="text-slate-600 dark:text-slate-400">{selectedEvidenceGap.flag_reason}</p>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium pt-1">
                  Total supporting outbound referrals: <strong>{selectedEvidenceGap.referral_count} records</strong>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Supporting Outbound Referral Records ({selectedEvidenceGap.supporting_referrals?.length || 0})
                </h4>
                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {selectedEvidenceGap.supporting_referrals && selectedEvidenceGap.supporting_referrals.length > 0 ? (
                    selectedEvidenceGap.supporting_referrals.map((r) => (
                      <div key={r.referral_id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            #{r.referral_id} → {r.destination_facility_name}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">"{r.reason}"</p>
                          <div className="text-[10px] text-slate-400">Date: {r.referral_date}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
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
                  onClick={() => setSelectedEvidenceGap(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer"
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

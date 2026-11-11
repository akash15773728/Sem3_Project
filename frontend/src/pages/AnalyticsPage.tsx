import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { apiRequest } from '../services/api';
import type { District, Facility, Service } from '../types';
import {
  BarChart3,
  Calendar,
  Filter,
  PieChart as PieIcon,
  TrendingUp,
  MapPin,
  RefreshCw,
  FileSpreadsheet,
  Info,
  Wrench,
  Stethoscope,
  Activity,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [days, setDays] = useState<number>(180);
  const [districtId, setDistrictId] = useState<string>('');
  const [facilityId, setFacilityId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('days', String(days));
      if (districtId) params.append('district_id', districtId);
      if (facilityId) params.append('facility_id', facilityId);
      if (serviceId) params.append('service_id', serviceId);

      const [patData, distData, facData, srvData] = await Promise.all([
        apiRequest<any>(`/analytics/patterns?${params.toString()}`),
        apiRequest<District[]>('/districts'),
        apiRequest<Facility[]>('/facilities'),
        apiRequest<Service[]>('/services')
      ]);

      setPatterns(patData);
      setDistricts(distData);
      setFacilities(facData);
      setServices(srvData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, districtId, facilityId, serviceId]);

  const COLORS = ['#0F766E', '#164E63', '#0284C7', '#D97706', '#E11D48', '#8B5CF6'];

  return (
    <div>
      <Header
        title="Comprehensive Referral Analytics & Demand Modeling"
        subtitle="Healthcare intelligence correlating clinical specialty demand, temporal trends, and geographical movement"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Methodological Transparency Notice */}
        <div className="card-healthcare p-4.5 bg-gradient-to-r from-teal-50 via-cyan-50 to-slate-50 border-teal-200 flex items-start space-x-3.5">
          <Info className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-teal-950 block text-sm">
              Analytical Distinction: Clinical Referral Reason vs Service Gap Indicator
            </span>
            <p>
              A <strong>Clinical Referral Reason</strong> explains why the patient was transferred (e.g. 2D echocardiogram evaluation). 
              A <strong>Service Gap</strong> indicates that the medical service or equipment may be physically unavailable at the referring hospital. 
              The statistics below aggregate referral records to expose repeated transfer drivers across public healthcare facilities.
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card-healthcare p-5 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter Analytical Perspectives
            </span>
            <button
              onClick={fetchAnalytics}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Charts</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Horizon</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value={30}>Last 30 Days (1 Month)</option>
                <option value={90}>Last 90 Days (Quarter)</option>
                <option value={180}>Last 180 Days (Half Year)</option>
                <option value={365}>Last 365 Days (Full Year)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">District Focus</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Administrative Districts</option>
                {districts.map((d) => (
                  <option key={d.district_id} value={d.district_id}>
                    {d.district_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facility Focus</label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Health Facilities</option>
                {facilities.map((f) => (
                  <option key={f.facility_id} value={f.facility_id}>
                    {f.facility_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Specialty Domain</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Clinical Specialties</option>
                {services.map((s) => (
                  <option key={s.service_id} value={s.service_id}>
                    {s.service_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 1: Trends & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-8 card-healthcare p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Monthly Referral Trajectory</h3>
                <p className="text-xs text-slate-500">Aggregated patient transfers by triage classification</p>
              </div>
              <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                Pandas Aggregated
              </span>
            </div>

            <div className="h-72">
              {patterns?.trends && patterns.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patterns.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="referral_count" name="Total Volume" stroke="#0F766E" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="emergency_count" name="Emergency Triage" stroke="#DC2626" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed_count" name="Completed Care" stroke="#0284C7" strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No records match selected parameters
                </div>
              )}
            </div>
          </div>

          {/* Specialty Category Pie Chart */}
          <div className="lg:col-span-4 card-healthcare p-6 bg-white space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Service Category Demand</h3>
              <p className="text-xs text-slate-500">Distribution across clinical taxonomy</p>
            </div>

            <div className="h-72 flex items-center justify-center">
              {patterns?.category_distribution && patterns.category_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patterns.category_distribution}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {patterns.category_distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No category data</div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: District Comparison & Deficit Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* District Comparison */}
          <div className="lg:col-span-6 card-healthcare p-6 bg-white space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">District-Wise Referral Outflow</h3>
              <p className="text-xs text-slate-500">Volume originating from primary/secondary facilities by district</p>
            </div>

            <div className="h-64">
              {patterns?.district_comparison && patterns.district_comparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patterns.district_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="source_district" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" name="Outbound Referrals" fill="#164E63" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No district comparison available
                </div>
              )}
            </div>
          </div>

          {/* Deficit Reason Categories */}
          <div className="lg:col-span-6 card-healthcare p-6 bg-white space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Deficit Reason Category Distribution</h3>
              <p className="text-xs text-slate-500">Primary structural shortage classification recorded in referrals</p>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {patterns?.reason_category_distribution && patterns.reason_category_distribution.length > 0 ? (
                patterns.reason_category_distribution.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-800 font-semibold truncate max-w-sm">
                      {item.reason_category || 'Other'}
                    </span>
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                      {item.count} referrals
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No deficit categories recorded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Top Unavailable Resources (Deficit Drivers) & Service Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Unavailable Resources */}
          <div className="lg:col-span-6 card-healthcare p-6 bg-white space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Frequently Cited Unavailable Medical Resources</h3>
              <p className="text-xs text-slate-500">Specific equipment, tests, or specialists missing at referring facilities</p>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {patterns?.top_unavailable_resources && patterns.top_unavailable_resources.length > 0 ? (
                patterns.top_unavailable_resources.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-red-50/50 border border-red-200 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="text-red-950 font-bold truncate max-w-sm">
                        {item.unavailable_resource}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-red-300 shrink-0">
                      {item.count} cases
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No resource shortages identified
                </div>
              )}
            </div>
          </div>

          {/* Service Specialty Volume */}
          <div className="lg:col-span-6 card-healthcare p-6 bg-white space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Top Clinical Specialties Generating Transfers</h3>
              <p className="text-xs text-slate-500">Volume distribution across medical departments</p>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {patterns?.service_distribution && patterns.service_distribution.length > 0 ? (
                patterns.service_distribution.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                      <span className="text-slate-800 font-semibold truncate max-w-sm">
                        {item.service}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {item.count} cases
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No service volume recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

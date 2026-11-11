import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { Referral, District, Service } from '../types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Building2
} from 'lucide-react';

export const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isFacilityStaff = user?.role === 'Facility Staff';
  const isAdmin = user?.role === 'Administrator';

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Facility Staff Tabs: 'all' | 'outbound' | 'inbound' | 'history'
  const initialTab = searchParams.get('tab') || 'all';
  const [staffTab, setStaffTab] = useState<string>(initialTab);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [reasonCategoryFilter, setReasonCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (districtFilter) params.append('district_id', districtFilter);
      if (serviceFilter) params.append('service_id', serviceFilter);
      if (reasonCategoryFilter) params.append('reason_category', reasonCategoryFilter);

      const [refData, distData, srvData] = await Promise.all([
        apiRequest<Referral[]>(`/referrals?${params.toString()}`),
        apiRequest<District[]>('/districts'),
        apiRequest<Service[]>('/services')
      ]);

      setReferrals(refData);
      setDistricts(distData);
      setServices(srvData);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter, priorityFilter, districtFilter, serviceFilter, reasonCategoryFilter]);

  // Tab filtering for Facility Staff
  const tabFilteredReferrals = referrals.filter((r) => {
    if (!isFacilityStaff) return true;
    const facId = user?.facility_id;
    if (staffTab === 'outbound') {
      return r.source_facility_id === facId;
    }
    if (staffTab === 'inbound') {
      return r.destination_facility_id === facId;
    }
    if (staffTab === 'history') {
      return r.status === 'Completed' || r.status === 'Declined';
    }
    return true; // 'all'
  });

  const filteredReferrals = tabFilteredReferrals.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.source_facility_name?.toLowerCase().includes(query) ||
      r.destination_facility_name?.toLowerCase().includes(query) ||
      r.service_name?.toLowerCase().includes(query) ||
      r.reason_category?.toLowerCase().includes(query) ||
      r.unavailable_resource?.toLowerCase().includes(query) ||
      r.reason.toLowerCase().includes(query)
    );
  });

  // Calculate quick metrics for Facility Staff
  const facId = user?.facility_id;
  const outboundCount = referrals.filter((r) => r.source_facility_id === facId).length;
  const inboundCount = referrals.filter((r) => r.destination_facility_id === facId).length;
  const pendingCount = referrals.filter((r) => r.status === 'Pending').length;
  const completedCount = referrals.filter((r) => r.status === 'Completed').length;

  return (
    <div>
      <Header
        title={
          isFacilityStaff
            ? `Referral Management — ${user?.facility_name || 'Hospital'}`
            : 'Clinical Referral Registry & Case Dossiers'
        }
        subtitle={
          isFacilityStaff
            ? 'Dispatch, receive, and track patient transfers across the public healthcare network'
            : 'Auditable record of patient transfers between health facilities for gap identification'
        }
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Hospital User Operational Summary Banner */}
        {isFacilityStaff && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setStaffTab('outbound')}
              className={`card-healthcare p-4 cursor-pointer transition-all ${
                staffTab === 'outbound' ? 'ring-2 ring-teal-600 bg-teal-50/40' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Outgoing Referrals</span>
                <ArrowUpRight className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{outboundCount}</div>
              <p className="text-[10px] text-slate-500">Transfers dispatched</p>
            </div>

            <div
              onClick={() => setStaffTab('inbound')}
              className={`card-healthcare p-4 cursor-pointer transition-all ${
                staffTab === 'inbound' ? 'ring-2 ring-cyan-600 bg-cyan-50/40' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Incoming Referrals</span>
                <ArrowDownLeft className="w-4 h-4 text-cyan-700" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{inboundCount}</div>
              <p className="text-[10px] text-slate-500">Patients received</p>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'Pending' ? '' : 'Pending')}
              className={`card-healthcare p-4 cursor-pointer transition-all ${
                statusFilter === 'Pending' ? 'ring-2 ring-amber-500 bg-amber-50/40' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Handover</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-amber-600 mt-1">{pendingCount}</div>
              <p className="text-[10px] text-slate-500">Action required</p>
            </div>

            <div
              onClick={() => setStaffTab('history')}
              className={`card-healthcare p-4 cursor-pointer transition-all ${
                staffTab === 'history' ? 'ring-2 ring-emerald-600 bg-emerald-50/40' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Completed Referrals</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-700 mt-1">{completedCount}</div>
              <p className="text-[10px] text-slate-500">Historical archive</p>
            </div>
          </div>
        )}

        {/* Actions & Filters Bar */}
        <div className="card-healthcare p-5 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by hospital, specialty, or clinical deficit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchReferrals}
                className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs flex items-center space-x-1"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* ONLY Facility Staff and Admin can create or upload referrals */}
              {(isFacilityStaff || isAdmin) && (
                <>
                  <button
                    onClick={() => navigate('/referrals/upload')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-teal-700" />
                    <span>Upload Records</span>
                  </button>

                  <button
                    onClick={() => navigate('/referrals/new')}
                    className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Referral</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hospital User Sub-Tabs */}
          {isFacilityStaff && (
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs font-semibold">
              <button
                onClick={() => setStaffTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  staffTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Facility Referrals ({referrals.length})
              </button>
              <button
                onClick={() => setStaffTab('outbound')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  staffTab === 'outbound'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Outgoing (Sent: {outboundCount})
              </button>
              <button
                onClick={() => setStaffTab('inbound')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  staffTab === 'inbound'
                    ? 'bg-cyan-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Incoming (Received: {inboundCount})
              </button>
              <button
                onClick={() => setStaffTab('history')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  staffTab === 'history'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Referral History
              </button>
            </div>
          )}

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="In-Transit">In-Transit</option>
                <option value="Completed">Completed</option>
                <option value="Declined">Declined</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Priorities</option>
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">District</label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d.district_id} value={d.district_id}>
                    {d.district_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Service Specialty</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s.service_id} value={s.service_id}>
                    {s.service_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Deficit Category</label>
              <select
                value={reasonCategoryFilter}
                onChange={(e) => setReasonCategoryFilter(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All Categories</option>
                <option value="Specialist Unavailable">Specialist Unavailable</option>
                <option value="Equipment Unavailable">Equipment Unavailable</option>
                <option value="Diagnostic Service Unavailable">Diagnostic Unavailable</option>
                <option value="Insufficient Beds">Insufficient Beds</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Referrals Listing Table */}
        <div className="card-healthcare overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs">
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Source Facility</th>
                  <th className="py-3 px-4">Destination Facility</th>
                  <th className="py-3 px-4">Deficit Resource</th>
                  <th className="py-3 px-4">Clinical Justification</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Loading referral records...
                    </td>
                  </tr>
                ) : filteredReferrals.length > 0 ? (
                  filteredReferrals.map((r) => {
                    const isCurrentUserSource = isFacilityStaff && r.source_facility_id === user?.facility_id;
                    const isCurrentUserDest = isFacilityStaff && r.destination_facility_id === user?.facility_id;

                    return (
                      <tr
                        key={r.referral_id}
                        onClick={() => navigate(`/referrals/${r.referral_id}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{r.referral_id}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {r.referral_date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 flex items-center space-x-1">
                            <span>{r.source_facility_name}</span>
                            {isCurrentUserSource && (
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-teal-100 text-teal-800">
                                Out
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{r.source_district_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 flex items-center space-x-1">
                            <span>{r.destination_facility_name}</span>
                            {isCurrentUserDest && (
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800">
                                In
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{r.destination_district_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-red-700">{r.unavailable_resource || r.service_name}</div>
                          <div className="text-[10px] text-slate-500">{r.reason_category}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                          {r.reason}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.priority === 'Emergency'
                                ? 'bg-red-100 text-red-700'
                                : r.priority === 'Urgent'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              r.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'Accepted'
                                ? 'bg-cyan-100 text-cyan-800'
                                : r.status === 'In-Transit'
                                ? 'bg-blue-100 text-blue-800'
                                : r.status === 'Declined'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center space-x-1">
                            <span>{isFacilityStaff ? 'Manage' : 'Inspect'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No referrals found matching the selected filter criteria.
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

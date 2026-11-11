import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { FacilityCapacity, District, Facility, Service } from '../types';
import {
  Stethoscope,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  RefreshCw,
  AlertCircle,
  Save,
  X
} from 'lucide-react';

export const CapacityPage: React.FC = () => {
  const { user } = useAuth();

  const [capacities, setCapacities] = useState<FacilityCapacity[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [districtFilter, setDistrictFilter] = useState<string>(
    user?.role === 'District Officer' && user.district_id ? String(user.district_id) : ''
  );
  const [facilityFilter, setFacilityFilter] = useState<string>(
    user?.role === 'Facility Staff' && user.facility_id ? String(user.facility_id) : ''
  );
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [availFilter, setAvailFilter] = useState<string>('');

  // Editing state
  const [editingItem, setEditingItem] = useState<FacilityCapacity | null>(null);
  const [editServiceAvail, setEditServiceAvail] = useState<boolean>(true);
  const [editSpecialists, setEditSpecialists] = useState<number>(0);
  const [editEquipmentAvail, setEditEquipmentAvail] = useState<boolean>(true);
  const [editBeds, setEditBeds] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCapacityData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (facilityFilter) params.append('facility_id', facilityFilter);
      if (districtFilter) params.append('district_id', districtFilter);
      if (serviceFilter) params.append('service_id', serviceFilter);
      if (availFilter !== '') params.append('service_available', availFilter);

      const [capData, distData, facData, srvData] = await Promise.all([
        apiRequest<FacilityCapacity[]>(`/facility-capacity?${params.toString()}`),
        apiRequest<District[]>('/districts'),
        apiRequest<Facility[]>('/facilities'),
        apiRequest<Service[]>('/services')
      ]);

      setCapacities(capData);
      setDistricts(distData);
      setFacilities(facData);
      setServices(srvData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch capacity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacityData();
  }, [districtFilter, facilityFilter, serviceFilter, availFilter]);

  const handleStartEdit = (cap: FacilityCapacity) => {
    // Check permission
    if (user?.role === 'Facility Staff' && user.facility_id !== cap.facility_id) {
      alert('You are only authorized to modify capacity declarations for your assigned facility.');
      return;
    }
    setEditingItem(cap);
    setEditServiceAvail(cap.service_available);
    setEditSpecialists(cap.specialist_count);
    setEditEquipmentAvail(cap.equipment_available);
    setEditBeds(cap.beds_available);
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSaving(true);
    setFeedback(null);
    setErrorMsg(null);

    try {
      const updated = await apiRequest<FacilityCapacity>(`/facility-capacity/${editingItem.capacity_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          service_available: editServiceAvail,
          specialist_count: Number(editSpecialists),
          equipment_available: editEquipmentAvail,
          beds_available: Number(editBeds)
        })
      });

      setCapacities((prev) =>
        prev.map((c) => (c.capacity_id === updated.capacity_id ? updated : c))
      );
      setFeedback(`Successfully updated ${editingItem.service_name} capacity for ${editingItem.facility_name}.`);
      setEditingItem(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update capacity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Facility Capacity Declaration & Monitoring"
        subtitle="Maintain verified declarations of credentialed specialists, functioning equipment, and inpatient beds"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filters */}
        <div className="card-healthcare p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter Capacity Matrix
            </span>
            <button
              onClick={fetchCapacityData}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs"
              title="Refresh Matrix"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {user?.role !== 'Facility Staff' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facility</label>
                <select
                  value={facilityFilter}
                  onChange={(e) => setFacilityFilter(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">All Facilities</option>
                  {facilities.map((f) => (
                    <option key={f.facility_id} value={f.facility_id}>
                      {f.facility_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {user?.role !== 'Facility Staff' && user?.role !== 'District Officer' && (
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
            )}

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
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Operational State</label>
              <select
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">All States</option>
                <option value="true">Service Reported Available</option>
                <option value="false">Service Reported Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Capacity Matrix Table */}
        <div className="card-healthcare overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header border-b border-slate-200">
                  <th className="py-3 px-4">Facility Name</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Service Specialty</th>
                  <th className="py-3 px-4">Service Availability</th>
                  <th className="py-3 px-4">Specialists In-Position</th>
                  <th className="py-3 px-4">Equipment Operational</th>
                  <th className="py-3 px-4">Staffed Beds</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Loading capacity matrix...
                    </td>
                  </tr>
                ) : capacities.length > 0 ? (
                  capacities.map((cap) => (
                    <tr key={cap.capacity_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {cap.facility_name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{cap.district_name}</td>
                      <td className="py-3 px-4 font-medium text-teal-800">
                        {cap.service_name}
                      </td>
                      <td className="py-3 px-4">
                        {cap.service_available ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-600 font-semibold text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            <span>Unavailable</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={cap.specialist_count === 0 ? 'text-amber-600 font-bold' : 'text-slate-900'}>
                          {cap.specialist_count} Specialists
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {cap.equipment_available ? (
                          <span className="text-emerald-700 font-medium">Functional</span>
                        ) : (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Deficit / Maintenance
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {cap.beds_available} Beds
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[10px]">
                        {cap.last_updated ? cap.last_updated.split('T')[0] : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(user?.role === 'Administrator' ||
                          (user?.role === 'Facility Staff' && user.facility_id === cap.facility_id)) && (
                          <button
                            onClick={() => handleStartEdit(cap)}
                            className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
                            title="Edit Capacity Declaration"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No capacity records match criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Edit Capacity Declaration */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Update Capacity Declaration
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingItem.facility_name} — {editingItem.service_name}
                  </p>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Service Operational Availability
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editServiceAvail === true}
                        onChange={() => setEditServiceAvail(true)}
                        className="text-teal-700 focus:ring-teal-700"
                      />
                      <span>Available</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editServiceAvail === false}
                        onChange={() => setEditServiceAvail(false)}
                        className="text-red-600 focus:ring-red-600"
                      />
                      <span className="text-red-700 font-semibold">Unavailable (Triggers Gap Rule if Referrals Dispatched)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Specialist Doctors Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editSpecialists}
                      onChange={(e) => setEditSpecialists(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Staffed Inpatient Beds
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editBeds}
                      onChange={(e) => setEditBeds(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Equipment Operational Readiness
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={editEquipmentAvail}
                      onChange={(e) => setEditEquipmentAvail(e.target.checked)}
                      className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-700"
                    />
                    <span className="text-xs text-slate-700">
                      Specialized equipment is operational and calibrated
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Commit Capacity'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

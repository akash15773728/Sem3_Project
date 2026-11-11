import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { Facility, District } from '../types';
import { Building2, Plus, Search, MapPin, Phone, ShieldCheck, X } from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const { user } = useAuth();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Add facility modal
  const [modalOpen, setModalOpen] = useState(false);
  const [facName, setFacName] = useState('');
  const [facType, setFacType] = useState('Community Health Centre (CHC)');
  const [facDistrictId, setFacDistrictId] = useState<number>(1);
  const [facPhone, setFacPhone] = useState('');
  const [facAddress, setFacAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (districtFilter) params.append('district_id', districtFilter);
      if (search) params.append('search', search);

      const [facData, distData] = await Promise.all([
        apiRequest<Facility[]>(`/facilities?${params.toString()}`),
        apiRequest<District[]>('/districts')
      ]);
      setFacilities(facData);
      setDistricts(distData);
      if (distData.length > 0 && !facDistrictId) {
        setFacDistrictId(distData[0].district_id);
      }
    } catch (err: any) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [districtFilter, search]);

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const created = await apiRequest<Facility>('/facilities', {
        method: 'POST',
        body: JSON.stringify({
          facility_name: facName,
          facility_type: facType,
          district_id: Number(facDistrictId),
          contact_phone: facPhone,
          address: facAddress
        })
      });
      setFacilities((prev) => [...prev, created]);
      setModalOpen(false);
      setFacName('');
      setFacPhone('');
      setFacAddress('');
    } catch (err: any) {
      setError(err.message || 'Failed to add facility');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Healthcare Facilities Directory"
        subtitle="Manage participating primary health centres, community hospitals, district hospitals, and medical colleges"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Actions Bar */}
        <div className="card-healthcare p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search facilities by name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.district_id} value={d.district_id}>
                  {d.district_name}
                </option>
              ))}
            </select>
          </div>

          {user?.role === 'Administrator' && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </button>
          )}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div key={fac.facility_id} className="card-healthcare p-6 space-y-4 hover:border-teal-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {fac.facility_type}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{fac.facility_name}</h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{fac.address || 'Address not listed'}, {fac.district_name}</span>
                </div>
                {fac.contact_phone && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{fac.contact_phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Services</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{fac.active_services_count}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Referrals Sent</span>
                  <span className="font-mono font-bold text-teal-700 text-sm">{fac.total_referrals_sent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Facility */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Add Healthcare Facility</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateFacility} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility Name</label>
                  <input
                    type="text"
                    required
                    value={facName}
                    onChange={(e) => setFacName(e.target.value)}
                    placeholder="e.g. Sub-District Hospital Rohini"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility Type</label>
                  <select
                    value={facType}
                    onChange={(e) => setFacType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                    <option value="Community Health Centre (CHC)">Community Health Centre (CHC)</option>
                    <option value="Sub-District Hospital (SDH)">Sub-District Hospital (SDH)</option>
                    <option value="District Hospital (DH)">District Hospital (DH)</option>
                    <option value="Tertiary Care / Medical College">Tertiary Care / Medical College</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Governing District</label>
                  <select
                    value={facDistrictId}
                    onChange={(e) => setFacDistrictId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {districts.map((d) => (
                      <option key={d.district_id} value={d.district_id}>
                        {d.district_name} ({d.state_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={facPhone}
                    onChange={(e) => setFacPhone(e.target.value)}
                    placeholder="+91-11-..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={facAddress}
                    onChange={(e) => setFacAddress(e.target.value)}
                    placeholder="Street, locality, area..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800"
                  >
                    {saving ? 'Saving...' : 'Add Facility'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

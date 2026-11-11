import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { Service } from '../types';
import { Layers, Plus, Search, CheckCircle2, XCircle, X } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add Service Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [srvName, setSrvName] = useState('');
  const [srvCat, setSrvCat] = useState('Specialized Medicine');
  const [srvDesc, setSrvDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      const data = await apiRequest<Service[]>(`/services?${params.toString()}`);
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryFilter]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const created = await apiRequest<Service>('/services', {
        method: 'POST',
        body: JSON.stringify({
          service_name: srvName,
          category: srvCat,
          description: srvDesc,
          is_active: true
        })
      });
      setServices((prev) => [...prev, created]);
      setModalOpen(false);
      setSrvName('');
      setSrvDesc('');
    } catch (err: any) {
      setError(err.message || 'Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Medical Specialties & Diagnostic Directory"
        subtitle="Standardized clinical service taxonomy mapped to facility capacity declarations and referrals"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="card-healthcare p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="">All Categories</option>
              <option value="Specialized Medicine">Specialized Medicine</option>
              <option value="Surgical Specialties">Surgical Specialties</option>
              <option value="Diagnostic & Imaging">Diagnostic & Imaging</option>
              <option value="Maternal & Child Health">Maternal & Child Health</option>
              <option value="Emergency & Critical Care">Emergency & Critical Care</option>
              <option value="General Services">General Services</option>
            </select>
          </div>

          {user?.role === 'Administrator' && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service Specialty</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.service_id} className="card-healthcare p-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {s.category}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Specialty" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{s.service_name}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {s.description || 'Clinical specialty taxonomy definition and referral routing domain.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Facilities Offering:</span>
                <span className="font-mono font-bold text-slate-900">{s.facilities_offering} units</span>
              </div>
            </div>
          ))}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Add Medical Specialty</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    placeholder="e.g. Oncology & Chemotherapy"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Domain Category</label>
                  <select
                    value={srvCat}
                    onChange={(e) => setSrvCat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Specialized Medicine">Specialized Medicine</option>
                    <option value="Surgical Specialties">Surgical Specialties</option>
                    <option value="Diagnostic & Imaging">Diagnostic & Imaging</option>
                    <option value="Maternal & Child Health">Maternal & Child Health</option>
                    <option value="Emergency & Critical Care">Emergency & Critical Care</option>
                    <option value="General Services">General Services</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Scope Description</label>
                  <textarea
                    rows={3}
                    value={srvDesc}
                    onChange={(e) => setSrvDesc(e.target.value)}
                    placeholder="Scope of clinical interventions, diagnostics, and referral indicators..."
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
                    {saving ? 'Saving...' : 'Add Service'}
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

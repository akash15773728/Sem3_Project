import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { User, Facility, District } from '../types';
import { Users, Plus, ShieldCheck, Mail, Building2, MapPin, X } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Facility Staff' | 'District Officer' | 'State Officer' | 'Administrator'>('Facility Staff');
  const [facilityId, setFacilityId] = useState<number | ''>('');
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [uData, facData, distData] = await Promise.all([
        apiRequest<User[]>('/users'),
        apiRequest<Facility[]>('/facilities'),
        apiRequest<District[]>('/districts')
      ]);
      setUsers(uData);
      setFacilities(facData);
      setDistricts(distData);
      if (facData.length > 0) setFacilityId(facData[0].facility_id);
      if (distData.length > 0) setDistrictId(distData[0].district_id);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const created = await apiRequest<User>('/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          facility_id: role === 'Facility Staff' ? Number(facilityId) : null,
          district_id: role === 'District Officer' ? Number(districtId) : null,
          is_active: true
        })
      });
      setUsers((prev) => [...prev, created]);
      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Role-Based Access Control User Directory"
        subtitle="Manage credentials, facility assignments, and authorization privileges"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="card-healthcare p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">System User Directory</h3>
            <p className="text-xs text-slate-500">Personnel configured with secure bcrypt credentials</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add User Account</span>
          </button>
        </div>

        <div className="card-healthcare overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header border-b border-slate-200">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Facility</th>
                  <th className="py-3 px-4">Jurisdiction District</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{u.user_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'Administrator'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'State Officer'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'District Officer'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {u.facility_name || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {u.district_name || 'Statewide'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add User */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Create Authorized User</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@sehatsetu.gov.in"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RBAC Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Facility Staff">Facility Staff (Assigned Facility Only)</option>
                    <option value="District Officer">District Officer (Assigned District)</option>
                    <option value="State Officer">State Officer (Statewide Monitoring)</option>
                    <option value="Administrator">Administrator (System-wide)</option>
                  </select>
                </div>

                {role === 'Facility Staff' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assign to Facility</label>
                    <select
                      value={facilityId}
                      onChange={(e) => setFacilityId(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      {facilities.map((f) => (
                        <option key={f.facility_id} value={f.facility_id}>
                          {f.facility_name} ({f.district_name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {role === 'District Officer' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assign to District</label>
                    <select
                      value={districtId}
                      onChange={(e) => setDistrictId(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      {districts.map((d) => (
                        <option key={d.district_id} value={d.district_id}>
                          {d.district_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                    {saving ? 'Creating...' : 'Create Account'}
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

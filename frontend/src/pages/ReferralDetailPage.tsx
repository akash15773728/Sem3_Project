import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { Referral } from '../types';
import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  ShieldCheck,
  User,
  AlertCircle,
  Eye,
  Lock
} from 'lucide-react';

export const ReferralDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isFacilityStaff = user?.role === 'Facility Staff';
  const isAdmin = user?.role === 'Administrator';
  const canUpdateStatus = isFacilityStaff || isAdmin;

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Referral>(`/referrals/${id}`);
      setReferral(data);
      setNewStatus(data.status);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load referral record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!referral || !canUpdateStatus) return;
    setUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await apiRequest<Referral>(`/referrals/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setReferral(updated);
      setSuccessMsg(`Status successfully transitioned to '${newStatus}'. Operational activity logged.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update referral status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <Header
        title={`Referral Dossier #${id}`}
        subtitle="Auditable lifecycle state, clinical handover justification & destination routing"
      />

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/referrals')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Referrals Registry</span>
        </button>

        {loading ? (
          <div className="card-healthcare p-12 text-center text-slate-400 text-xs bg-white">
            Loading referral details...
          </div>
        ) : referral ? (
          <div className="space-y-6">
            {/* View-Only Authority Notice for Monitoring Roles */}
            {!canUpdateStatus && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Read-Only Authority Dossier:</strong> As a {user?.role}, your interface is configured for analytical monitoring and service gap inspection. Clinical handover controls are restricted to hospital staff.
                </span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Main Header Card */}
            <div className="card-healthcare p-6 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-bold text-slate-900">
                      Referral #{referral.referral_id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        referral.priority === 'Emergency'
                          ? 'bg-red-100 text-red-700'
                          : referral.priority === 'Urgent'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {referral.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dispatched on {referral.referral_date} by {referral.creator_name || 'Staff Clinician'}
                  </p>
                </div>

                {/* Status controls: Editable ONLY for Hospital Staff and Admin */}
                {canUpdateStatus ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="p-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In-Transit">In-Transit</option>
                      <option value="Completed">Completed</option>
                      <option value="Declined">Declined</option>
                    </select>

                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating || newStatus === referral.status}
                      className="px-3.5 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 disabled:opacity-40 transition-colors"
                    >
                      {updating ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-medium">Lifecycle Status:</span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        referral.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : referral.status === 'Accepted'
                          ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                          : referral.status === 'In-Transit'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : referral.status === 'Declined'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {referral.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Source vs Destination Transfer Visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Source Referring Hospital
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{referral.source_facility_name}</div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{referral.source_district_name}, {referral.source_state_name}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                    Receiving Destination Hospital
                  </span>
                  <div className="font-bold text-teal-950 text-sm">{referral.destination_facility_name}</div>
                  <div className="text-xs text-teal-800 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{referral.destination_district_name}, {referral.destination_state_name}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Specialty Box & Deficit Resource */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Required Clinical Service Specialty
                  </span>
                  <div className="text-sm font-bold text-teal-800">{referral.service_name}</div>
                  <div className="text-xs text-slate-500">{referral.service_category}</div>
                </div>

                <div className="p-4 rounded-xl bg-red-50/60 border border-red-200">
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block mb-1">
                    Unavailable Resource (Deficit Driver)
                  </span>
                  <div className="text-sm font-bold text-red-900">{referral.unavailable_resource || 'Unspecified'}</div>
                  <div className="text-xs text-red-700">{referral.reason_category}</div>
                </div>
              </div>

              {/* Clinical Justification */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Clinical Transfer Justification & Referral Reason
                </h4>
                <p className="text-xs text-slate-700 p-3.5 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed">
                  {referral.reason}
                </p>
              </div>

              {referral.notes && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Handover Observation Notes
                  </h4>
                  <p className="text-xs text-slate-600 p-3.5 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed">
                    {referral.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card-healthcare p-12 text-center text-slate-500 text-xs bg-white">
            Referral record not found.
          </div>
        )}
      </main>
    </div>
  );
};

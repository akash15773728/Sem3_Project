import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { Facility, Service } from '../types';
import { Activity, ArrowLeft, Send, AlertCircle, CheckCircle2, Wrench } from 'lucide-react';

export const NewReferralPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Authorities should not see or access referral creation
  useEffect(() => {
    if (user && user.role !== 'Facility Staff' && user.role !== 'Administrator') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Form State
  const [sourceFacilityId, setSourceFacilityId] = useState<number>(user?.facility_id || 0);
  const [destFacilityId, setDestFacilityId] = useState<number>(0);
  const [serviceId, setServiceId] = useState<number>(0);
  const [reasonCategory, setReasonCategory] = useState<string>('Equipment Unavailable');
  const [unavailableResource, setUnavailableResource] = useState<string>('Echocardiogram');
  const [referralDate, setReferralDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<string>('Routine');
  const [reason, setReason] = useState<string>('Patient requires 2D echocardiogram evaluation; local echo machine unavailable/under repair.');
  const [notes, setNotes] = useState<string>('');

  const resourceSuggestions: Record<string, string[]> = {
    'Equipment Unavailable': ['Echocardiogram', 'CT Scanner', 'MRI Machine', 'Dialysis Unit', 'Ventilator', 'Ultrasound Machine'],
    'Specialist Unavailable': ['Cardiologist', 'Neurologist', 'Orthopedic Surgeon', 'Pediatrician', 'Radiologist', 'Oncologist'],
    'Diagnostic Service Unavailable': ['Histopathology', 'Blood Culture', 'Biopsy Testing', 'Advanced Serology'],
    'Insufficient Beds': ['ICU Beds', 'NICU Incubator', 'Surgical Post-Op Beds', 'General Ward Beds'],
    'Other': ['Administrative Transfer', 'Patient Preference']
  };

  useEffect(() => {
    async function loadFormDropdowns() {
      try {
        setLoading(true);
        const [facData, srvData] = await Promise.all([
          apiRequest<Facility[]>('/facilities'),
          apiRequest<Service[]>('/services?is_active=true')
        ]);
        setFacilities(facData);
        setServices(srvData);

        if (user?.facility_id) {
          setSourceFacilityId(user.facility_id);
        } else if (facData.length > 0) {
          setSourceFacilityId(facData[0].facility_id);
        }

        // Default destination to a higher facility (e.g. DH or Tertiary)
        const higher = facData.find((f) => f.facility_type.includes('District Hospital') || f.facility_type.includes('Tertiary'));
        if (higher) {
          setDestFacilityId(higher.facility_id);
        } else if (facData.length > 1) {
          setDestFacilityId(facData[1].facility_id);
        }

        if (srvData.length > 0) {
          setServiceId(srvData[0].service_id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load options');
      } finally {
        setLoading(false);
      }
    }
    loadFormDropdowns();
  }, [user]);

  const handleCategoryChange = (cat: string) => {
    setReasonCategory(cat);
    const suggestions = resourceSuggestions[cat];
    if (suggestions && suggestions.length > 0) {
      setUnavailableResource(suggestions[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceFacilityId === destFacilityId) {
      setError('Source and Destination facility cannot be identical.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a clinical justification reason for this referral.');
      return;
    }

    if (!unavailableResource.trim()) {
      setError('Please specify the unavailable resource prompting this referral.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/referrals', {
        method: 'POST',
        body: JSON.stringify({
          source_facility_id: Number(sourceFacilityId),
          destination_facility_id: Number(destFacilityId),
          service_id: Number(serviceId),
          referral_date: referralDate,
          reason_category: reasonCategory,
          unavailable_resource: unavailableResource,
          reason,
          priority,
          notes
        })
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/referrals');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create referral record');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header
        title="Dispatch Healthcare Referral"
        subtitle="Record synthetic patient transfer triggered by medical resource, specialist, or equipment deficits"
      />

      <main className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/referrals')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Referrals Listing</span>
        </button>

        <div className="card-healthcare p-8 space-y-6 bg-white border border-slate-200/90 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Referral Dispatch Form</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Synthetic patient case transfer record with structured resource deficiency correlation.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Referral dispatched successfully! Correlating pattern with capacity engine...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Facility Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Originating Facility (Source)
                </label>
                {user?.role === 'Facility Staff' ? (
                  <input
                    type="text"
                    disabled
                    value={user.facility_name || `Facility #${sourceFacilityId}`}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold"
                  />
                ) : (
                  <select
                    value={sourceFacilityId}
                    onChange={(e) => setSourceFacilityId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {facilities.map((f) => (
                      <option key={f.facility_id} value={f.facility_id}>
                        {f.facility_name} ({f.facility_type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Receiving Facility (Destination)
                </label>
                <select
                  value={destFacilityId}
                  onChange={(e) => setDestFacilityId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {facilities
                    .filter((f) => f.facility_id !== sourceFacilityId)
                    .map((f) => (
                      <option key={f.facility_id} value={f.facility_id}>
                        {f.facility_name} ({f.facility_type})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Reason Category & Specific Unavailable Resource */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-teal-50/60 border border-teal-100">
              <div>
                <label className="block font-semibold text-teal-950 mb-1 uppercase tracking-wider">
                  Deficit Reason Category
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-teal-300 bg-white font-medium"
                >
                  <option value="Specialist Unavailable">Specialist Doctor Unavailable</option>
                  <option value="Equipment Unavailable">Medical Equipment Unavailable</option>
                  <option value="Diagnostic Service Unavailable">Diagnostic Service Unavailable</option>
                  <option value="Insufficient Beds">Insufficient Hospital Beds</option>
                  <option value="Other">Other Operational Reason</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-teal-950 mb-1 uppercase tracking-wider">
                  Specific Unavailable Resource
                </label>
                <input
                  type="text"
                  required
                  list="resource-suggestions"
                  value={unavailableResource}
                  onChange={(e) => setUnavailableResource(e.target.value)}
                  placeholder="e.g., Echocardiogram, Cardiologist..."
                  className="w-full p-2.5 rounded-xl border border-teal-300 bg-white font-bold text-teal-900"
                />
                <datalist id="resource-suggestions">
                  {(resourceSuggestions[reasonCategory] || []).map((s, idx) => (
                    <option key={idx} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Service & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Required Medical Specialty / Domain
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.service_id} value={s.service_id}>
                      {s.service_name} — {s.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                  Patient Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            {/* Referral Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Referral Date
              </label>
              <input
                type="date"
                value={referralDate}
                onChange={(e) => setReferralDate(e.target.value)}
                className="w-full sm:w-1/2 p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            {/* Clinical Reason */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Clinical Necessity & Detailed Justification
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State clinical reason for referral (e.g., patient requires 2D echocardiogram evaluation; local echo machine unavailable/under repair)..."
                className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            {/* Handover Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Clinical Handover Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Synthetic clinical parameters, patient stabilization notes before dispatch..."
                className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/referrals')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loading}
                className="px-6 py-2.5 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors flex items-center space-x-2 disabled:opacity-50 shadow-md shadow-teal-900/10"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Registering...' : 'Dispatch Referral'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

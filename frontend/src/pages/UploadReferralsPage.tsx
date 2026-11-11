import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { Facility, Service } from '../types';
import {
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';

interface BatchRow {
  destination_facility_id: number;
  service_id: number;
  reason_category: string;
  unavailable_resource: string;
  reason: string;
  priority: string;
  referral_date?: string;
  notes?: string;
}

export const UploadReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If not hospital staff or admin, redirect
  useEffect(() => {
    if (user && user.role !== 'Facility Staff' && user.role !== 'Administrator') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [_loading, setLoading] = useState(true);

  // Upload state
  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<BatchRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [resultSummary, setResultSummary] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  useEffect(() => {
    async function loadMetadata() {
      try {
        setLoading(true);
        const [facs, srvs] = await Promise.all([
          apiRequest<Facility[]>('/facilities'),
          apiRequest<Service[]>('/services?is_active=true')
        ]);
        setFacilities(facs);
        setServices(srvs);
      } catch (err: any) {
        console.error('Failed to load facilities/services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetadata();
  }, []);

  // Provide a sample template CSV
  const handleDownloadSample = () => {
    const header = 'destination_facility_name,service_name,reason_category,unavailable_resource,priority,reason,notes\n';
    const sample1 = '"District Hospital Central","Cardiology","Equipment Unavailable","Echocardiogram","Routine","Patient requires 2D echocardiogram evaluation; local echo machine unavailable.","Cardiology clinic review"\n';
    const sample2 = '"Apex Medical College Hospital New Delhi","Cardiology","Equipment Unavailable","Echocardiogram","Urgent","Suspected valve disease requiring echo; machine down.","Transfer under OPD"\n';
    const sample3 = '"District Hospital Central","Neurology & Neurosurgery","Specialist Unavailable","Neurologist","Routine","Persistent focal seizures needing neurologist consultation.","Routine neurology clinic"\n';
    const blob = new Blob([header + sample1 + sample2 + sample3], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sehat_setu_referral_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvText = (text: string) => {
    setParseError(null);
    setResultSummary(null);

    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setParseError('The CSV file must contain a header row and at least one data row.');
      setParsedRows([]);
      return;
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const header = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
    const destIdx = header.findIndex((h) => h.includes('dest'));
    const srvIdx = header.findIndex((h) => h.includes('service'));
    const catIdx = header.findIndex((h) => h.includes('category') || h.includes('reason_cat'));
    const resIdx = header.findIndex((h) => h.includes('resource') || h.includes('unavailable'));
    const prioIdx = header.findIndex((h) => h.includes('priority'));
    const reasonIdx = header.findIndex((h) => h.includes('reason') && !h.includes('category'));
    const notesIdx = header.findIndex((h) => h.includes('note'));

    if (destIdx === -1 || srvIdx === -1 || reasonIdx === -1) {
      setParseError('CSV missing required columns: destination_facility_name, service_name, reason.');
      return;
    }

    const rows: BatchRow[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = parseLine(lines[i]);
      if (parts.length < 3) continue;

      const destName = parts[destIdx] || '';
      const srvName = parts[srvIdx] || '';
      const reasonCat = catIdx !== -1 && parts[catIdx] ? parts[catIdx] : 'Equipment Unavailable';
      const unavailRes = resIdx !== -1 && parts[resIdx] ? parts[resIdx] : srvName;
      const prio = prioIdx !== -1 && parts[prioIdx] ? parts[prioIdx] : 'Routine';
      const reason = parts[reasonIdx] || '';
      const notes = notesIdx !== -1 ? parts[notesIdx] : '';

      // Match destination facility
      const destFac = facilities.find(
        (f) =>
          f.facility_name.toLowerCase().includes(destName.toLowerCase()) ||
          destName.toLowerCase().includes(f.facility_name.toLowerCase())
      );

      // Match service
      const srv = services.find(
        (s) =>
          s.service_name.toLowerCase().includes(srvName.toLowerCase()) ||
          srvName.toLowerCase().includes(s.service_name.toLowerCase())
      );

      if (!destFac) {
        errors.push(`Row ${i}: Could not find destination facility matching "${destName}".`);
        continue;
      }
      if (!srv) {
        errors.push(`Row ${i}: Could not find medical service matching "${srvName}".`);
        continue;
      }

      rows.push({
        destination_facility_id: destFac.facility_id,
        service_id: srv.service_id,
        reason_category: reasonCat,
        unavailable_resource: unavailRes,
        reason,
        priority: ['Routine', 'Urgent', 'Emergency'].includes(prio) ? prio : 'Routine',
        referral_date: new Date().toISOString().split('T')[0],
        notes
      });
    }

    if (errors.length > 0 && rows.length === 0) {
      setParseError(errors.join(' '));
    } else {
      setParsedRows(rows);
      if (errors.length > 0) {
        setParseError(`Parsed ${rows.length} rows with warnings: ${errors.slice(0, 3).join(' ')}`);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleSubmitBatch = async () => {
    if (parsedRows.length === 0) return;
    setSubmitting(true);
    setParseError(null);
    setResultSummary(null);

    const sourceFacilityId = user?.facility_id || (facilities.length > 0 ? facilities[0].facility_id : 1);
    let successCount = 0;
    const errors: string[] = [];

    setProgress({ current: 0, total: parsedRows.length });

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      try {
        await apiRequest('/referrals', {
          method: 'POST',
          body: JSON.stringify({
            source_facility_id: sourceFacilityId,
            destination_facility_id: row.destination_facility_id,
            service_id: row.service_id,
            referral_date: row.referral_date || new Date().toISOString().split('T')[0],
            reason_category: row.reason_category,
            unavailable_resource: row.unavailable_resource,
            reason: row.reason,
            priority: row.priority,
            notes: row.notes || 'Batch referral submission'
          })
        });
        successCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message || 'Submission failed'}`);
      }
      setProgress({ current: i + 1, total: parsedRows.length });
    }

    setSubmitting(false);
    setResultSummary({
      success: successCount,
      failed: parsedRows.length - successCount,
      errors
    });
  };

  return (
    <div>
      <Header
        title="Upload & Submit Referral Records"
        subtitle="Batch submit patient referral records from facility logbooks to register outgoing patient transfers"
      />

      <main className="p-6 space-y-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/referrals')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Referrals</span>
        </button>

        {/* Info Banner */}
        <div className="card-healthcare p-5 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
                Hospital Operational Workflow
              </span>
              <span className="text-xs text-slate-500">
                Originating Facility: <strong>{user?.facility_name || 'Assigned Facility'}</strong>
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Bulk Referral Submission & Ingestion Engine
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Upload daily or weekly referral registers to track outbound patient cases and link repeated unavailable medical service reasons to district service gap analysis.
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center space-x-2 shrink-0 shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Upload Drop Zone & Direct Paste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Upload Box */}
          <div className="card-healthcare p-6 bg-white border border-dashed border-teal-300 hover:border-teal-500 transition-colors space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Select CSV Referral Spreadsheet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload a structured file containing destination hospitals, services, and referral reasons.
              </p>
            </div>
            <label className="inline-block px-4 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 cursor-pointer transition-all shadow-xs">
              <span>Browse File (.csv)</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick Paste or Manual Ingestion Box */}
          <div className="card-healthcare p-6 bg-white border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Paste CSV Records</h3>
              <span className="text-[10px] text-slate-400">Direct tabular input</span>
            </div>
            <textarea
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                parseCsvText(e.target.value);
              }}
              rows={4}
              placeholder="destination_facility_name,service_name,reason_category,unavailable_resource,priority,reason&#10;&quot;District Hospital Central&quot;,&quot;Cardiology&quot;,&quot;Equipment Unavailable&quot;,&quot;Echocardiogram&quot;,&quot;Routine&quot;,&quot;Echo machine broken&quot;"
              className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            />
          </div>
        </div>

        {/* Error / Warning Alert */}
        {parseError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Result Summary */}
        {resultSummary && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">Submission Complete</h4>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                ✓ {resultSummary.success} Referrals Dispatched Successfully
              </span>
              {resultSummary.failed > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold">
                  ✕ {resultSummary.failed} Failed
                </span>
              )}
            </div>
            {resultSummary.errors.length > 0 && (
              <div className="text-xs text-rose-700 space-y-1 pt-2 border-t border-slate-100">
                {resultSummary.errors.slice(0, 5).map((e, idx) => (
                  <div key={idx}>• {e}</div>
                ))}
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={() => navigate('/referrals')}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors"
              >
                View Dispatched Referrals in Registry
              </button>
            </div>
          </div>
        )}

        {/* Preview Parsed Table */}
        {parsedRows.length > 0 && !resultSummary && (
          <div className="card-healthcare p-6 bg-white border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Ready to Submit ({parsedRows.length} Referral Records)
                </h3>
                <p className="text-xs text-slate-500">
                  Review the mapped records before submitting to the backend referral engine.
                </p>
              </div>

              <button
                onClick={handleSubmitBatch}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 disabled:opacity-50 transition-all shadow-sm flex items-center space-x-2 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>{submitting ? `Submitting (${progress?.current}/${progress?.total})...` : 'Submit All Referrals'}</span>
              </button>
            </div>

            {progress && (
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-700 h-2 transition-all duration-200"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Destination Hospital</th>
                    <th className="py-2.5 px-3">Required Service</th>
                    <th className="py-2.5 px-3">Deficit Category</th>
                    <th className="py-2.5 px-3">Unavailable Resource</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Clinical Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {parsedRows.slice(0, 10).map((r, i) => {
                    const destName = facilities.find((f) => f.facility_id === r.destination_facility_id)?.facility_name;
                    const srvName = services.find((s) => s.service_id === r.service_id)?.service_name;
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{destName || `ID #${r.destination_facility_id}`}</td>
                        <td className="py-2.5 px-3 text-teal-800 font-semibold">{srvName || `Service #${r.service_id}`}</td>
                        <td className="py-2.5 px-3">{r.reason_category}</td>
                        <td className="py-2.5 px-3 font-bold text-red-700">{r.unavailable_resource}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.priority === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate">{r.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedRows.length > 10 && (
                <div className="py-2 px-3 text-center text-[11px] text-slate-400 bg-slate-50 border-t border-slate-100">
                  Showing first 10 of {parsedRows.length} records to be submitted
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

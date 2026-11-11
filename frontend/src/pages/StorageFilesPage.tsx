import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { StorageFile } from '../types';
import {
  HardDrive,
  Download,
  Upload,
  FileCode,
  FileText,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const StorageFilesPage: React.FC = () => {
  const { user } = useAuth();

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<StorageFile[]>('/storage/files');
      setFiles(data);
    } catch (err) {
      console.error('Failed to load storage files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = (filename: string) => {
    const token = localStorage.getItem('sehatsetu_token');
    const url = `/api/storage/download/${filename}`;
    // Fetch and trigger download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch((err) => alert(`Download error: ${err}`));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setStatusMessage(null);
    const formData = new FormData();
    formData.append('file', fileList[0]);

    try {
      const res: any = await apiRequest('/storage/upload', {
        method: 'POST',
        body: formData
      });
      setStatusMessage(res.message || 'File uploaded successfully.');
      fetchFiles();
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Header
        title="Data Classification & Object Storage (Azure Blob)"
        subtitle="Demonstrating Structured (Azure SQL), Semi-Structured (JSON), and Unstructured (PDF/Docs) Data Separation"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Academic Data Classification Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-healthcare p-5 border-l-4 border-l-teal-700 space-y-2">
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>1. Structured Data</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">Microsoft Azure SQL Database</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              7 normalized relational tables in Third Normal Form (3NF): districts, facilities, services, users, capacity, referrals, activity logs.
            </p>
          </div>

          <div className="card-healthcare p-5 border-l-4 border-l-cyan-600 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-800 font-bold text-sm">
              <FileCode className="w-4 h-4" />
              <span>2. Semi-Structured Data</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">Azure Blob Storage (JSON Files)</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nested district demographic surveys, vulnerability indices, and facility telemetry configuration records stored as JSON.
            </p>
          </div>

          <div className="card-healthcare p-5 border-l-4 border-l-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>3. Unstructured Data</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">Azure Blob Storage (PDF / Audit Docs)</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Demonstration administrative facility audit memorandums, quarterly inspection evaluations, and clinical policies.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Storage Container Manager */}
        <div className="card-healthcare overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Azure Blob Storage Object Repository
              </h3>
              <p className="text-xs text-slate-500">
                Container: <code>sehatsetu-blobs</code> (Encrypted at rest with AES-256)
              </p>
            </div>

            {(user?.role === 'Administrator' || user?.role === 'State Officer') && (
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors inline-flex items-center space-x-2 shadow-sm">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Audit Document'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header border-b border-slate-200">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Last Modified</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Querying private blob storage container...
                    </td>
                  </tr>
                ) : files.length > 0 ? (
                  files.map((file) => (
                    <tr key={file.filename} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center space-x-2">
                        {file.filename.endsWith('.json') ? (
                          <FileCode className="w-4 h-4 text-cyan-600 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span>{file.filename}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            file.category.includes('Semi-Structured')
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {file.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">
                        {file.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {(file.size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {file.last_modified.split('T')[0]}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDownload(file.filename)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors inline-flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No files currently stored.
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

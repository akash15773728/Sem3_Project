import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Cookie, ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookiePolicyPage: React.FC = () => {
  const handleOpenPreferences = () => {
    window.dispatchEvent(new CustomEvent('openCookiePreferences'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
            <Cookie className="w-3.5 h-3.5 text-teal-700" />
            <span>Cookie & Storage Transparency</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: November 2026 | SEHAT-SETU Platform
          </p>
        </div>

        {/* Body */}
        <div className="card-healthcare p-8 bg-white space-y-6 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. What Are Cookies and Local Storage?
            </h2>
            <p>
              Cookies and local browser storage are small text files or key-value entries stored on your device when you browse websites. They are used to enable secure sign-in sessions, remember user interface preferences, and ensure responsive application loading.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. How SEHAT-SETU Uses Storage Mechanisms
            </h2>
            <p>
              Our platform uses storage mechanisms categorized into three distinct tiers:
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">1. Strictly Necessary Cookies (Essential)</strong>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">Always Active</span>
                </div>
                <p className="text-slate-600">
                  Required for user authentication (JWT session token), active jurisdiction routing, and application state security. The platform cannot function without these entries.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">2. Functional & Preference Cookies (Optional)</strong>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-slate-600">
                  Remembers your selected dashboard time window (e.g., 90 days vs 180 days), table filtering states, and UI settings between sessions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">3. Analytics & Performance Cookies (Optional)</strong>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-slate-600">
                  Used only with your consent to gather anonymous telemetry on dashboard chart render speed and user experience metrics. No third-party marketing or cross-site tracking cookies are used.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Managing and Changing Your Cookie Consent
            </h2>
            <p>
              You can modify or withdraw your cookie preferences at any time. Clicking the button below or using the "Cookie Preferences" link in the footer will reopen your preference controls.
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenPreferences}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Open Cookie Preferences Panel</span>
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Browser-Level Controls
            </h2>
            <p>
              Most web browsers permit you to clear stored cookies, reject cookies entirely, or alert you when a cookie is placed. Note that disabling strictly necessary storage will prevent you from signing in to the hospital or authority dashboards.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, ShieldCheck, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'sehatsetu_cookie_consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [preferencesConsent, setPreferencesConsent] = useState(false);

  useEffect(() => {
    // Check existing stored preferences
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Show banner after brief delay
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom event to reopen preferences from footer
  useEffect(() => {
    const handleOpen = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CookiePreferences;
          setAnalyticsConsent(parsed.analytics || false);
          setPreferencesConsent(parsed.preferences || false);
        } catch {
          // fallback
        }
      }
      setShowPreferences(true);
      setVisible(true);
    };

    window.addEventListener('openCookiePreferences', handleOpen);
    return () => window.removeEventListener('openCookiePreferences', handleOpen);
  }, []);

  const saveConsent = (analytics: boolean, prefs: boolean) => {
    const consentData: CookiePreferences = {
      essential: true, // Always required for platform session
      analytics,
      preferences: prefs,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    setVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectOptional = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(analyticsConsent, preferencesConsent);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-200 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto">
        {!showPreferences ? (
          // Main Banner View
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start space-x-3.5 max-w-3xl">
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Privacy & Cookie Preferences
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We use cookies and local session storage to ensure the platform functions securely, remember your display preferences, and understand how visitors interact with our decision-support dashboards. Optional cookies are only activated with your consent. For full details, review our{' '}
                  <Link to="/cookie-policy" className="text-teal-400 hover:text-teal-300 underline font-medium">
                    Cookie Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-teal-400 hover:text-teal-300 underline font-medium">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleRejectOptional}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Reject Optional
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Manage Preferences</span>
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 shadow-md shadow-teal-900/40 border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Preferences Customization Modal View
          <div className="space-y-5 py-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-teal-400" />
                <h4 className="text-sm font-bold text-white">Customize Cookie & Data Settings</h4>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Category 1: Essential */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Strictly Necessary</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                    Always Active
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Required for core platform security, user authentication sessions, and jurisdiction routing. Cannot be disabled.
                </p>
              </div>

              {/* Category 2: Performance / Analytics */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Analytical Metrics</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Helps us analyze anonymous platform usage patterns and referral dashboard responsiveness without storing personal data.
                </p>
              </div>

              {/* Category 3: Preferences */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Display Preferences</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesConsent}
                      onChange={(e) => setPreferencesConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Remembers dashboard filter states, date-range horizons, and table layout configurations across visits.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={handleRejectOptional}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                Reject All Optional
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

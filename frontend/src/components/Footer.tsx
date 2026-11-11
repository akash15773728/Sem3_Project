import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, ExternalLink, Settings, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleOpenCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('openCookiePreferences'));
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Col 1: Platform Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <img
                src="/sehat-setu-logo.png"
                alt="SEHAT-SETU Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-extrabold text-xl text-white tracking-tight">
                SEHAT<span className="text-blue-400">-SETU</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Healthcare Referral Analytics and Service Gap Identification Platform. Correlating routine hospital referral records with reported facility capacity to give healthcare authorities actionable visibility into localized infrastructure and service deficits.
            </p>

            <div className="flex items-center space-x-2 text-xs text-teal-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>De-Identified Data Architecture & Role-Based Security</span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors">About the Platform</Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-teal-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="/#methodology" className="hover:text-teal-400 transition-colors">Analytical Approach</a>
              </li>
              <li>
                <a href="/#capabilities" className="hover:text-teal-400 transition-colors">Platform Capabilities</a>
              </li>
              <li>
                <a href="/#preview" className="hover:text-teal-400 transition-colors">Live Dashboard Preview</a>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Privacy & Governance */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Privacy & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="hover:text-teal-400 transition-colors">Terms of Use</Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-teal-400 transition-colors">Cookie Policy</Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenCookiePreferences}
                  className="hover:text-teal-400 transition-colors text-left flex items-center space-x-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Cookie Preferences</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Support */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Contact & Inquiries
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For administrative inquiries, health authority onboarding, or referral data support:
            </p>
            <div className="text-xs text-slate-300 space-y-1.5 pt-1">
              <div className="flex items-center space-x-2 text-teal-400 font-medium">
                <Mail className="w-3.5 h-3.5" />
                <span>support@sehatsetu.gov.in</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Department of Health & Family Welfare Systems
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <p>
            &copy; {new Date().getFullYear()} SEHAT-SETU. Healthcare Referral Analytics & Service Gap Identification Platform.
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <Link to="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms-of-use" className="hover:text-slate-400 transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/cookie-policy" className="hover:text-slate-400 transition-colors">Cookies</Link>
            <span>•</span>
            <button
              onClick={handleOpenCookiePreferences}
              className="hover:text-slate-400 transition-colors"
            >
              Consent Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, CheckCircle2, Building2, MapPin, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Platform Background & Mission
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About SEHAT-SETU
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
            A healthcare referral analytics and service gap identification platform designed to help healthcare authorities, district officers, and hospital administrators uncover systemic infrastructure deficits through referral data.
          </p>
        </div>

        {/* 1. Problem Statement & Objective */}
        <div className="card-healthcare p-8 bg-white border border-slate-200/90 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">1. The Public Health Challenge</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Healthcare facilities routinely refer patients to higher-level facilities when certain medical specialties, diagnostic equipment, or beds are unavailable. However, when referral data is managed in fragmented silos, district and state health directors cannot easily identify repeated referral patterns or understand where healthcare capacity needs improvement.
          </p>
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-sm text-teal-900 leading-relaxed">
            <strong>Platform Objective:</strong> Provide an explainable, decision-support platform that correlates routine hospital referral patterns with reported facility capacity to identify potential service gaps for administrative planning and resource deployment.
          </div>
        </div>

        {/* 2. How Referral Data Informs Planning */}
        <div className="card-healthcare p-8 bg-white border border-slate-200/90 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">2. From Referral Patterns to Service Gaps</h2>
            <p className="text-xs text-slate-500">
              Transforming everyday referral reasons into actionable healthcare planning data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Example Scenario</span>
              <p className="text-slate-600 leading-relaxed">
                Hospital A repeatedly refers patients to Hospital B because echocardiography equipment is unavailable or broken.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Pattern Detection</span>
              <p className="text-slate-600 leading-relaxed">
                When 50 or more referrals cite the same unavailable diagnostic service, the platform detects a recurring referral pattern.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Actionable Gap Alert</span>
              <p className="text-slate-600 leading-relaxed">
                Authorities at district, state, and national levels receive a flagged Potential Service Gap alert to verify and allocate resources.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Decision Support Principles */}
        <div className="card-healthcare p-8 bg-white border border-slate-200/90 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">3. Decision-Support Principles</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SEHAT-SETU is designed as an explainable decision-support tool. It adheres to three transparent operational principles:
          </p>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <span><strong>Auditable Clinical Evidence:</strong> Every flagged potential gap links directly to supporting referral records, ensuring authorities can examine actual referral reasons rather than unverified statistical estimates.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <span><strong>Field Verification Notice:</strong> High referral frequency highlights a pattern of unavailable care that requires administrative inspection before committing capital expenditures.</span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <span><strong>Multi-Tier Coordination:</strong> Ensures seamless communication between front-line hospital dispatchers and district, state, and national health authorities.</span>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

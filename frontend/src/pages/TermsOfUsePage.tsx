import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfUsePage: React.FC = () => {
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
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            <span>Draft Terms Document — For Administrative Review</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: November 2026 | SEHAT-SETU Platform
          </p>
        </div>

        {/* Body */}
        <div className="card-healthcare p-8 bg-white space-y-6 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Platform Nature and Scope
            </h2>
            <p>
              SEHAT-SETU is a healthcare decision-support and referral analytics platform. It provides public health authorities and hospital administrators with tools to identify recurring patterns of patient transfer caused by unavailable medical facilities, diagnostic machinery, or specialist staffing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Decision-Support Disclaimer
            </h2>
            <p>
              The platform highlights <strong>Potential Service Gaps</strong> and <strong>Repeated Referral Patterns</strong> to support administrative resource planning. The identification of a potential gap does not constitute a definitive physical infrastructure failure or clinical diagnostic judgment. Healthcare authorities must conduct physical facility verification, review equipment maintenance logs, and audit staff rosters prior to allocating procurement funds or restructuring clinical service lines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Authorized User Responsibilities
            </h2>
            <p>
              Users granted access to SEHAT-SETU must:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Maintain the confidentiality of their credentials and not share account access.</li>
              <li>Only submit genuine, de-identified clinical referral reasons conforming to medical documentation standards.</li>
              <li>Refrain from attempting to circumvent territorial access restrictions or administrative scopes.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Role-Based Access Governance
            </h2>
            <p>
              Hospital personnel are strictly authorized for clinical dispatching and intake management. District, state, and national officers hold read-only analytical monitoring access within their designated territorial boundary.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Intellectual Property and Attribution
            </h2>
            <p>
              The platform design, visualization architectures, algorithmic gap correlation models, and interface components are proprietary works developed for healthcare system research and evaluation.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

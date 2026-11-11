import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, Lock, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
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
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Draft Policy Document — For Administrative Review</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: November 2026 | SEHAT-SETU Healthcare Referral Analytics Platform
          </p>
        </div>

        {/* Policy Body */}
        <div className="card-healthcare p-8 bg-white space-y-6 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Purpose and Data Protection Commitment
            </h2>
            <p>
              SEHAT-SETU is a specialized healthcare referral analytics and service gap identification platform. The platform is designed to provide healthcare authorities, hospital directors, and planners with aggregated visibility into clinical referral flows without handling or storing personally identifiable patient information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Absence of Personal Health Identifiers (PII/PHI)
            </h2>
            <p>
              The platform deliberately excludes patient names, government identification numbers (such as Aadhaar, ABHA, or social security numbers), direct phone numbers, home addresses, or identifiable patient dossiers from its core schema. All operational and test records represent de-identified or synthetic referral patterns structured strictly around facility, medical service, clinical indication reason, and status.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Information Collected from Authenticated Users
            </h2>
            <p>
              For authorized hospital staff, district officers, and health administrators, the platform processes minimal operational account details:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Officer/Staff Full Name and official institutional email address.</li>
              <li>Role classification (Facility Staff, District Officer, State Officer, National Officer, Administrator).</li>
              <li>Assigned facility, district, or state territorial jurisdiction.</li>
              <li>Audit logs of administrative actions (logins, referral submissions, status adjustments).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Use of Analytics and Referral Data
            </h2>
            <p>
              Aggregated referral records are used exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Identify recurring transfer patterns between public healthcare facilities.</li>
              <li>Highlight potential shortages in medical equipment, diagnostic services, or specialist staffing.</li>
              <li>Provide comparative analytics to district, state, and national health authorities for infrastructure planning.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Data Security and Access Control
            </h2>
            <p>
              Platform access is governed by strict Role-Based Access Control (RBAC). Hospital staff are limited to operational referral handling for their facility, while administrative authorities hold read-only monitoring and analytical rights within their jurisdiction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              6. Administrative Review Notice
            </h2>
            <p className="text-slate-500 italic">
              Notice: This document represents a working operational draft for academic and institutional evaluation. Formal legal policies should be ratified by the designated institutional data governance board before state-wide commercial deployment.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

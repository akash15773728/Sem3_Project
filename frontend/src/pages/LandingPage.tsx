import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CookieConsent } from '../components/CookieConsent';
import { ReferralNetworkGraph } from '../components/ReferralNetworkGraph';
import {
  Activity,
  ArrowRight,
  ShieldAlert,
  Building2,
  MapPin,
  Layers,
  FileText,
  LayoutDashboard,
  Users,
  LineChart,
  Lock
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-6 pb-16 lg:pt-8 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.14] transition-colors">
                Transforming Healthcare Referrals into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 dark:from-teal-400 dark:via-teal-300 dark:to-cyan-400">
                  Actionable Insights
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed transition-colors">
                A data-driven healthcare analytics platform that analyses hospital referral patterns, identifies potential service gaps, and empowers healthcare authorities with insights across district, state, and national levels.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById('about');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-secondary-hero group"
                >
                  <span>Explore the Platform</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary-hero group"
                >
                  <Activity className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
                  <span>Login to Dashboard</span>
                </button>
              </div>

              {/* User-Oriented Trust Badges */}
              <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium transition-colors">
                <div>
                  <strong className="block text-slate-900 dark:text-white text-sm font-bold">Multi-Level Visibility</strong>
                  District, State & National
                </div>
                <div>
                  <strong className="block text-slate-900 dark:text-white text-sm font-bold">Evidence-Grounded</strong>
                  Auditable Transfer Records
                </div>
                <div>
                  <strong className="block text-slate-900 dark:text-white text-sm font-bold">Privacy-Preserving</strong>
                  De-Identified Data Standard
                </div>
              </div>
            </div>

            {/* Right Illustration: Custom Interactive Referral Network Graph */}
            <div className="lg:col-span-6 w-full">
              <ReferralNetworkGraph />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. ABOUT THE PLATFORM SECTION                            */}
      {/* ======================================================== */}
      <section id="about" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              About the Platform
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              Making Healthcare Service Gaps Visible Through Referral Analytics
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed pt-2 transition-colors">
              Healthcare referrals contain valuable information about the availability of medical services and facilities. However, repeated referrals for similar reasons can indicate gaps in healthcare infrastructure that often remain unnoticed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-healthcare p-8 bg-[#F8FAFC] dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100/70 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg transition-colors">Routine Referral Intelligence</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Our platform analyses digital referral records to identify recurring patterns, highlight potential service gaps, and provide healthcare authorities with meaningful insights.
              </p>
            </div>

            <div className="card-healthcare p-8 bg-[#F8FAFC] dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100/70 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg transition-colors">Pinpointing Structural Deficits</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                When hospitals repeatedly refer patients because of unavailable diagnostic equipment or specialist vacancies, these patterns are surfaced as potential gaps requiring verification.
              </p>
            </div>

            <div className="card-healthcare p-8 bg-[#F8FAFC] dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100/70 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg transition-colors">Multi-Tier Decision Support</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                By connecting hospital-level referral information with district, state, and national-level analytics, the platform supports informed decision-making and helps authorities identify where healthcare services need attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. HOW IT WORKS (4 STEPS)                                */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              How It Works
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              Turning Everyday Hospital Referrals into Meaningful Healthcare Insights
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
              A transparent, sequence-driven workflow connecting primary hospital logging with high-level administrative health planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold border border-teal-200 dark:border-teal-800">
                    STEP 01
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base transition-colors">
                  Digital Referral Recording
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                  Hospitals record patient referrals digitally, including the reason for referral and the required medical service.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-xs font-mono font-bold border border-cyan-200 dark:border-cyan-800">
                    STEP 02
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base transition-colors">
                  Intelligent Data Analysis
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                  The platform analyses referral records to identify frequently occurring reasons, repeated referral patterns, and commonly unavailable services.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold border border-amber-200 dark:border-amber-800">
                    STEP 03
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base transition-colors">
                  Service Gap Identification
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                  Recurring patterns are highlighted to identify hospitals and geographical areas that may have gaps in medical facilities, diagnostic services, or specialist availability.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                    STEP 04
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base transition-colors">
                  Insights for Authorities
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                  Analytical dashboards provide district, state, and national authorities with visibility into healthcare service gaps, supporting informed planning and decision-making.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. METHODOLOGY / OUR ANALYTICAL APPROACH (5 STAGES)       */}
      {/* ======================================================== */}
      <section id="methodology" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              Our Analytical Approach
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              From Referral Data to Healthcare Insights
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
              The platform follows a structured analytical approach to convert routine referral records into meaningful healthcare insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                stage: '01',
                title: 'Data Collection',
                desc: 'Digital referral information is collected from participating hospitals.'
              },
              {
                stage: '02',
                title: 'Pattern Recognition',
                desc: 'Repeated referral reasons and commonly requested medical services are analysed.'
              },
              {
                stage: '03',
                title: 'Gap Identification',
                desc: 'Recurring patterns are used to highlight potential gaps in healthcare service availability.'
              },
              {
                stage: '04',
                title: 'Geographical Analysis',
                desc: 'Findings are organised across hospital, district, state, and national levels.'
              },
              {
                stage: '05',
                title: 'Decision Support',
                desc: 'Authorities can explore findings through analytical dashboards and identify areas requiring attention.'
              }
            ].map((st, i) => (
              <div
                key={i}
                className="card-healthcare p-6 bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-teal-400 dark:hover:border-teal-500 transition-all space-y-4"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold mb-3 border border-teal-200 dark:border-teal-800">
                    Stage {st.stage}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 transition-colors">{st.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. FEATURES SECTION                                      */}
      {/* ======================================================== */}
      <section id="capabilities" className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              Platform Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              Designed for Hospitals and Public Healthcare Administrators
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
              Purpose-built capabilities delivering clear visibility into healthcare referral patterns and resource shortages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 transition-colors">Referral Analytics</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Understand referral patterns across hospitals, track transfer volumes, and examine clinical specialties driving inter-facility patient transfers.
              </p>
            </div>

            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 transition-colors">Service Gap Identification</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Identify frequently unavailable medical services and prioritize potential infrastructure, equipment, and specialist deficits requiring verification.
              </p>
            </div>

            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 transition-colors">Hospital-wise Insights</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Discover recurring referral issues at individual hospitals, compare outbound vs inbound loads, and track specific deficit drivers per facility.
              </p>
            </div>

            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 transition-colors">District-level Monitoring</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Understand healthcare service gaps across districts, observe localized referral outflows, and examine hospital clusters needing intervention.
              </p>
            </div>

            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 transition-colors">State and National Overview</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Compare referral patterns across larger geographical areas, observe macro regional pressures, and coordinate high-level resource planning.
              </p>
            </div>

            <div className="card-healthcare p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                <LineChart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 transition-colors">Data-driven Dashboards</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Convert referral information into meaningful visual insights with interactive trends, category breakdowns, heat maps, and evidence dossiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. PLATFORM PREVIEW                                      */}
      {/* ======================================================== */}
      <section id="preview" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              Live Platform Preview
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
              A Functional Healthcare Decision-Support Dashboard
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
              Explore the actual interface used by health authorities to analyze referral flows and review potential capacity deficits.
            </p>
          </div>

          {/* Interactive Preview Mockup Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden max-w-5xl mx-auto transition-colors">
            {/* Top Toolbar */}
            <div className="bg-slate-900 px-6 py-3.5 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  https://sehatsetu.gov.in/analytics/gaps
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-800 text-teal-200 text-[10px] font-semibold">
                District Authority: Central Delhi
              </span>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Metric Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Referrals</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">63</div>
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">Recorded in Period</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Potential Gaps</span>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">3</div>
                  <span className="text-[11px] text-red-700 dark:text-red-400 font-medium">Requires Verification</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Top Deficit Resource</span>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">Echo</div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">50 Outbound Referrals</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Monitored Facilities</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">10</div>
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">3 Administrative Tiers</span>
                </div>
              </div>

              {/* Sample Gap Flag Card */}
              <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                      Potential Service Gap
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm transition-colors">
                      CHC Paharganj (Hospital A) — Cardiology
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 transition-colors">
                    Facility dispatched <strong>50 outbound referrals</strong> citing <strong>Echocardiogram Unavailable</strong> to District Hospital Central. Flagged for verification.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-navbar-portal shrink-0"
                >
                  <span>Inspect Evidence Records</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. DATA ETHICS & PRIVACY ARCHITECTURE                    */}
      {/* ======================================================== */}
      <section className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs">
            <Lock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Ethical Healthcare Data Standards</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">
            Privacy-Preserving Healthcare Referral Analytics
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto transition-colors">
            SEHAT-SETU operates on de-identified clinical transfer information. The platform deliberately excludes patient names, government identification numbers, and identifiable personal notes. It demonstrates how healthcare referral trends and facility capacity metrics can be correlated to improve public health planning without compromising individual patient privacy.
          </p>
        </div>
      </section>

      {/* Footer and Persistent Cookie Consent */}
      <Footer />
      <CookieConsent />
    </div>
  );
};

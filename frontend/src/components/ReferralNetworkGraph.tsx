import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export const ReferralNetworkGraph: React.FC = () => {
  // Automated 3-Phase Demo Loop (like a high-end product demo video)
  // Phase 0: Normal Flow (0s - 4s)
  // Phase 1: Deficit Surge (4s - 8s)
  // Phase 2: Service Gap Flagged (8s - 12s)
  const [phase, setPhase] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const cycleDuration = 12000; // 12 seconds per full loop
    const intervalTime = 50;
    const step = (intervalTime / cycleDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Sync phase based on progress percentage
  useEffect(() => {
    if (progress < 33) {
      setPhase(0); // Normal baseline
    } else if (progress < 66) {
      setPhase(1); // Cardiac cases surging to DH
    } else {
      setPhase(2); // AI detects repeated gap
    }
  }, [progress]);

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white p-2">
      {/* Deep Navy Futuristic Command Surface */}
      <div className="relative rounded-xl overflow-hidden bg-[#050C1A] border border-cyan-950/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        
        {/* Subtle Ambient Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_0.75px,transparent_0.75px)] [background-size:20px_20px] opacity-15" />
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl" />
          {phase >= 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 1 }}
              className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl"
            />
          )}
        </div>

        {/* Minimalist Demo Header */}
        <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-cyan-900/30 bg-[#071326]/60 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
              LIVE REFERRAL TOPOLOGY
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              DEMO
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <AnimatePresence mode="wait">
              {phase === 0 && (
                <motion.span
                  key="p0"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold text-teal-400"
                >
                  <CheckCircle2 className="w-3 h-3 text-teal-400" />
                  <span>BASELINE INFLOW</span>
                </motion.span>
              )}
              {phase === 1 && (
                <motion.span
                  key="p1"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold text-amber-400"
                >
                  <TrendingUp className="w-3 h-3 text-amber-400 animate-bounce" />
                  <span>CARDIO SURGE (6 CASES)</span>
                </motion.span>
              )}
              {phase === 2 && (
                <motion.span
                  key="p2"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold text-red-400"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                  <span>GAP IDENTIFIED</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cinematic SVG Topology Visualization */}
        <div className="relative w-full h-[260px] select-none">
          <svg className="w-full h-full" viewBox="0 0 500 260" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Volumetric Glow Filters */}
              <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glowAmber" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Highway Gradients */}
              <linearGradient id="roadBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#083344" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0F766E" stopOpacity="0.6" />
              </linearGradient>

              <linearGradient id="roadSurge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Subtle radar geometry lines */}
            <g opacity="0.08" stroke="#06B6D4" strokeWidth="1" fill="none">
              <circle cx="200" cy="130" r="70" strokeDasharray="3 5" />
              <circle cx="200" cy="130" r="130" strokeDasharray="3 5" />
            </g>

            {/* ==================================================== */}
            {/* REFERRAL PATHWAYS                                    */}
            {/* ==================================================== */}

            {/* 1. PHC (85, 70) -> CHC (200, 130) */}
            <path 
              d="M 85 70 Q 135 90 200 130" 
              stroke="#0E7490" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
              fill="none" 
              opacity="0.6" 
            />

            {/* 2. CHC (200, 130) -> District Hospital (345, 75) */}
            {/* Transitions from normal road to Fiery Surge Arterial */}
            <path 
              d="M 200 130 Q 270 70 345 75" 
              stroke={phase >= 1 ? '#EF4444' : '#164E63'} 
              strokeWidth={phase >= 1 ? '5' : '2'} 
              strokeOpacity={phase >= 1 ? '0.4' : '0.6'}
              filter={phase >= 1 ? 'url(#glowAmber)' : undefined}
              fill="none" 
              className="transition-all duration-700"
            />
            <path 
              d="M 200 130 Q 270 70 345 75" 
              stroke={phase >= 1 ? 'url(#roadSurge)' : 'url(#roadBase)'} 
              strokeWidth={phase >= 1 ? '3' : '2'} 
              fill="none" 
              className="transition-all duration-700"
            />
            {phase >= 1 && (
              <path 
                d="M 200 130 Q 270 70 345 75" 
                stroke="#FFFBEB" 
                strokeWidth="1.5" 
                strokeDasharray="8 14" 
                fill="none" 
                opacity="0.85"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  values="0;-44" 
                  dur="0.8s" 
                  repeatCount="indefinite" 
                />
              </path>
            )}

            {/* 3. CHC (200, 130) -> Apex Medical College (385, 195) */}
            <path 
              d="M 200 130 Q 290 185 385 195" 
              stroke="#0D9488" 
              strokeWidth="2" 
              strokeDasharray="3 3" 
              fill="none" 
              opacity="0.5" 
            />

            {/* 4. District Hospital (345, 75) -> Apex Medical College (385, 195) */}
            <path 
              d="M 345 75 L 385 195" 
              stroke="#334155" 
              strokeWidth="1.5" 
              strokeDasharray="2 3" 
              fill="none" 
              opacity="0.4" 
            />

            {/* ==================================================== */}
            {/* LUMINOUS ENERGY COMETS (Continuous Demo Motion)      */}
            {/* ==================================================== */}

            {/* PHC -> CHC Normal Triage Comet */}
            <circle r="3" fill="#22D3EE" filter="url(#glowCyan)">
              <animateMotion 
                path="M 85 70 Q 135 90 200 130" 
                dur="3.2s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* CHC -> DH Referral Packets */}
            {phase === 0 ? (
              // Baseline: Single slow packet
              <circle r="3" fill="#0D9488" opacity="0.8">
                <animateMotion 
                  path="M 200 130 Q 270 70 345 75" 
                  dur="2.8s" 
                  repeatCount="indefinite" 
                />
              </circle>
            ) : (
              // Phase 1 & 2: Multiple fast amber packets (6 cases overload)
              <g>
                <circle r="4" fill="#F59E0B" filter="url(#glowAmber)">
                  <animateMotion 
                    path="M 200 130 Q 270 70 345 75" 
                    dur="1.2s" 
                    repeatCount="indefinite" 
                  />
                </circle>
                <circle r="3.5" fill="#EF4444" filter="url(#glowAmber)">
                  <animateMotion 
                    path="M 200 130 Q 270 70 345 75" 
                    dur="1.2s" 
                    begin="0.4s"
                    repeatCount="indefinite" 
                  />
                </circle>
                <circle r="3" fill="#FDE047" opacity="0.9">
                  <animateMotion 
                    path="M 200 130 Q 270 70 345 75" 
                    dur="1.2s" 
                    begin="0.8s"
                    repeatCount="indefinite" 
                  />
                </circle>
              </g>
            )}

            {/* CHC -> Tertiary Comet */}
            <circle r="2.5" fill="#A855F7" opacity="0.7">
              <animateMotion 
                path="M 200 130 Q 290 185 385 195" 
                dur="3s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* ==================================================== */}
            {/* AMBER DEFICIT SHOCKWAVE (Triggered in Phase 1 & 2)   */}
            {/* ==================================================== */}
            {phase >= 1 && (
              <g pointerEvents="none">
                <circle cx="200" cy="130" r="26" stroke="#F59E0B" strokeWidth="2" fill="none">
                  <animate attributeName="r" values="26;75" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85;0" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="130" r="26" stroke="#EF4444" strokeWidth="1.5" fill="none">
                  <animate attributeName="r" values="26;90" dur="2s" begin="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0" dur="2s" begin="0.6s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* ==================================================== */}
            {/* HOSPITAL NODES                                       */}
            {/* ==================================================== */}

            {/* NODE 1: PHC Daryaganj (85, 70) */}
            <g>
              <circle cx="85" cy="70" r="20" fill="#042F2E" stroke="#0D9488" strokeWidth="1.5" filter="url(#glowCyan)" />
              <circle cx="85" cy="70" r="14" fill="#0F766E" opacity="0.4" />
              <text x="85" y="74" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2DD4BF" fontFamily="monospace">
                PHC
              </text>
              <text x="85" y="102" textAnchor="middle" fontSize="10" fontWeight="600" fill="#E2E8F0">
                PHC Daryaganj
              </text>
              <text x="85" y="114" textAnchor="middle" fontSize="8.5" fill="#94A3B8">
                Primary Care
              </text>
            </g>

            {/* NODE 2: CHC Paharganj (200, 130) [HOTSPOT] */}
            <g>
              <circle 
                cx="200" 
                cy="130" 
                r="26" 
                fill={phase >= 1 ? '#451A03' : '#042F2E'} 
                stroke={phase >= 1 ? '#F59E0B' : '#0D9488'} 
                strokeWidth={phase >= 1 ? '3' : '2'} 
                filter={phase >= 1 ? 'url(#glowAmber)' : 'url(#glowCyan)'} 
                className="transition-colors duration-500"
              />
              <circle 
                cx="200" 
                cy="130" 
                r="18" 
                fill={phase >= 1 ? '#78350F' : '#0F766E'} 
                opacity="0.6" 
                className="transition-colors duration-500"
              />
              <text 
                x="200" 
                y="134" 
                textAnchor="middle" 
                fontSize="11" 
                fontWeight="900" 
                fill={phase >= 1 ? '#FDE047' : '#2DD4BF'} 
                fontFamily="monospace"
                className="transition-colors duration-500"
              >
                CHC
              </text>

              <text x="200" y="170" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF">
                CHC Paharganj
              </text>
              {phase >= 1 ? (
                <text x="200" y="182" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#F87171" fontFamily="monospace">
                  6 Outbound (Cardio Gap)
                </text>
              ) : (
                <text x="200" y="182" textAnchor="middle" fontSize="8.5" fill="#94A3B8">
                  Community Centre
                </text>
              )}
            </g>

            {/* NODE 3: District Hospital Central (345, 75) */}
            <g>
              <circle cx="345" cy="75" r="24" fill="#082F49" stroke="#0284C7" strokeWidth="2" filter="url(#glowCyan)" />
              <circle cx="345" cy="75" r="17" fill="#0369A1" opacity="0.4" />
              <text x="345" y="79" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#38BDF8" fontFamily="monospace">
                DH
              </text>
              <text x="345" y="112" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#E2E8F0">
                District Hospital
              </text>
              <text x="345" y="124" textAnchor="middle" fontSize="8.5" fill="#94A3B8">
                4 Cardiologists Active
              </text>
            </g>

            {/* NODE 4: Tertiary Medical College (385, 195) */}
            <g>
              <circle cx="385" cy="195" r="26" fill="#2E1065" stroke="#7E22CE" strokeWidth="2" />
              <circle cx="385" cy="195" r="18" fill="#581C87" opacity="0.4" />
              <text x="385" y="199" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#C084FC" fontFamily="monospace">
                APEX
              </text>
              <text x="385" y="232" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#E2E8F0">
                Medical College
              </text>
              <text x="385" y="244" textAnchor="middle" fontSize="8.5" fill="#A855F7">
                Cath Lab & CCU
              </text>
            </g>
          </svg>
        </div>

        {/* Dynamic Context Card (Narrates the Demo Story) */}
        <div className="relative z-10 px-4 py-3 border-t border-cyan-900/40 bg-gradient-to-r from-[#040B17] via-[#071428] to-[#040B17] backdrop-blur-md">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="phase-0"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200">Stage 1: Primary Triage Ingest</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Routine referrals flow smoothly from primary dispensaries to community facilities.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/40 px-2 py-1 rounded shrink-0 ml-2">
                  NORMAL STATUS
                </div>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div
                key="phase-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-amber-300">Stage 2: Repeated Outbound Transfers</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Cardiology = 0 Specialists
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    CHC Paharganj repeatedly escalates cardiac cases to District Hospital due to missing diagnostics.
                  </p>
                </div>
                <div className="text-right text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-1 rounded shrink-0 ml-2">
                  6 TRANSFERS
                </div>
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div
                key="phase-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-red-300">Stage 3: Service Gap Identified</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950 text-red-300 border border-red-700/60">
                      Rule 1 Flag
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Recurring transfers without in-house specialty capability surface as an actionable infrastructure gap.
                  </p>
                </div>
                <div className="text-right text-[10px] font-mono font-bold text-red-400 bg-red-950/80 border border-red-800/60 px-2.5 py-1 rounded shrink-0 ml-2 shadow-[0_0_10px_rgba(239,68,68,0.25)]">
                  FLAGGED
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video-Style Looping Progress Bar (Indicates automated demo cycle) */}
        <div className="w-full h-1 bg-slate-900 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-amber-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  );
};

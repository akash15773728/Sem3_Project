import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Users, Building2, Landmark, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface DemoRoleAccount {
  id: 'district' | 'facility' | 'state' | 'national';
  title: string;
  email: string;
  pwd: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}

export const DEMO_ROLES: DemoRoleAccount[] = [
  {
    id: 'district',
    title: 'District Officer',
    email: 'district@sehatsetu.gov.in',
    pwd: 'District@123',
    icon: Users,
    badge: 'Central Delhi'
  },
  {
    id: 'facility',
    title: 'Facility Staff',
    email: 'staff@sehatsetu.gov.in',
    pwd: 'Staff@123',
    icon: Building2,
    badge: 'CHC Paharganj'
  },
  {
    id: 'state',
    title: 'State Officer',
    email: 'state@sehatsetu.gov.in',
    pwd: 'State@123',
    icon: Landmark,
    badge: 'Delhi NCR State'
  },
  {
    id: 'national',
    title: 'National Officer',
    email: 'national@sehatsetu.gov.in',
    pwd: 'National@123',
    icon: ShieldCheck,
    badge: 'Republic of India'
  }
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<string>('district');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: 'district@sehatsetu.gov.in',
    password: 'District@123',
    rememberMe: true
  });

  const handleRoleSelect = (role: DemoRoleAccount) => {
    setSelectedRole(role.id);
    setFormData(prev => ({
      ...prev,
      email: role.email,
      password: role.pwd
    }));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-slate-900 overflow-x-hidden">
      {/* ======================================================== */}
      {/* Left Panel - Healthcare Intelligence Brand Visual        */}
      {/* ======================================================== */}
      <div className="md:w-1/2 relative min-h-[280px] md:min-h-screen overflow-hidden flex flex-col justify-between p-6 sm:p-10">
        {/* Back to Home Button */}
        <div className="relative z-20">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Visual Background with Healthcare Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80"
            alt="SEHAT-SETU Healthcare Operations Center"
            className="w-full h-full object-cover object-center filter brightness-65 contrast-110"
          />
          {/* Deep Navy/Teal Gradient Shroud */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#0A1A2F]/85 to-teal-950/60 mix-blend-multiply" />
          {/* Radial Center Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0F766E_0%,transparent_60%)] opacity-40" />
        </div>

        {/* Left Panel Brand Text Banner */}
        <div className="relative z-20 mt-auto pt-10 text-white space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span>National Health Intelligence Core</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            SEHAT-SETU
          </h2>
          <p className="text-sm text-slate-300 max-w-md leading-relaxed font-normal">
            Digital hospital referral analytics and automated healthcare service gap identification across District, State, and National health administrations.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Right Panel - Form & Demo Role Switcher Section         */}
      {/* ======================================================== */}
      <div className="md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-950 p-6 sm:p-10 lg:p-12 transition-colors duration-300">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Title Header */}
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2.5 group cursor-pointer" title="Return to Home">
              <img
                src="/sehat-setu-logo.png"
                alt="SEHAT-SETU Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                SEHAT<span className="text-blue-600 dark:text-blue-400">-SETU</span>
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Sign in with your role-authorized credentials to access the analytics command center.
            </p>
          </div>

          {/* Error Alert Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@sehatsetu.gov.in"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-12 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset is restricted to authorized state administrators. Please contact support@sehatsetu.gov.in.')}
                className="text-teal-700 dark:text-teal-400 hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* ======================================================== */}
          {/* Quick Demo Role Cards (Attached Image 2 Specification)   */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Select Demo Role
              </span>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                Click to load credentials
              </span>
            </div>

            {/* 4 Role Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DEMO_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                      isSelected
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-bold leading-tight ${
                      isSelected
                        ? 'text-emerald-950 dark:text-emerald-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {role.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mint Security Badge Banner (From Image 2) */}
            <div className="rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Secure Login</span>
              </div>
              <span className="text-emerald-300 dark:text-emerald-700 hidden sm:inline">•</span>
              <span>Role-Based Access</span>
              <span className="text-emerald-300 dark:text-emerald-700 hidden sm:inline">•</span>
              <span>Encrypted Data</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;

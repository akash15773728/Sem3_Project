import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Activity, LayoutDashboard, LogIn, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Wordmark (Clickable Brand) */}
          <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="h-10 sm:h-11 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/sehat-setu-logo.png"
                alt="SEHAT-SETU Logo"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white transition-colors">
                  SEHAT<span className="text-blue-600 dark:text-blue-400">-SETU</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                  Analytics
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase transition-colors">
                Referral Analytics & Gap Identification
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            <Link to="/" className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <a href="/#about" className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About
            </a>
            <a href="/#how-it-works" className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              How It Works
            </a>
            <a href="/#methodology" className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Analytical Approach
            </a>
            <a href="/#capabilities" className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="/#preview" className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Preview
            </a>
          </nav>

          {/* Action CTAs & Animated Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3.5">
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-navbar-portal"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-200" />
                <span>Open Dashboard ({user?.role?.replace(' Officer', '')})</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn-navbar-portal"
              >
                <LogIn className="w-4 h-4 text-blue-200" />
                <span>Login to Portal</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3 transition-colors">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            About the Platform
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            How It Works
          </a>
          <a
            href="/#methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Analytical Approach
          </a>
          <a
            href="/#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Features
          </a>
          <a
            href="/#preview"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Preview
          </a>

          <div className="pt-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full btn-navbar-portal justify-center py-2.5"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-200" />
                <span>Open Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full btn-navbar-portal justify-center py-2.5"
              >
                <LogIn className="w-4 h-4 text-blue-200" />
                <span>Login to Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

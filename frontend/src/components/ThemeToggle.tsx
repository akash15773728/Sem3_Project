import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
          : 'bg-gradient-to-r from-amber-100 via-sky-100 to-amber-50 border border-amber-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
      } ${className}`}
    >
      {/* Background Ambience / Micro-Elements */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none select-none">
        {/* Left Side: Sun Ray Ambient Glow */}
        <span
          className={`text-[10px] text-amber-500 transition-opacity duration-300 ${
            isDark ? 'opacity-0 scale-75' : 'opacity-80 scale-100'
          }`}
        >
          ☀
        </span>

        {/* Right Side: Night Stars Twinkle */}
        <div
          className={`flex items-center space-x-0.5 text-indigo-300 transition-opacity duration-300 ${
            isDark ? 'opacity-90 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <span className="text-[8px] animate-pulse">✦</span>
          <span className="text-[6px] opacity-70">★</span>
        </div>
      </div>

      {/* Floating Animated Switch Knob */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 32
        }}
        animate={{
          x: isDark ? 28 : 0
        }}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
            : 'bg-gradient-to-br from-amber-400 to-orange-400 text-amber-950 shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
        }`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 fill-current text-white stroke-[2.2]" />
          ) : (
            <Sun className="w-4 h-4 fill-amber-100 text-white stroke-[2.2]" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
};

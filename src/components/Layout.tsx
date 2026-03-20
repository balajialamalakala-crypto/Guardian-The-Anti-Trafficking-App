import React, { useState, useCallback, useMemo } from 'react';
import { Shield, LayoutDashboard, AlertTriangle, BookOpen, User, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * Main Layout component for GuardianLink.
 * Optimized for accessibility (ARIA) and efficiency (memoization).
 */
const Layout = React.memo(({ children, activeTab, setActiveTab }: LayoutProps) => {
  const handlePanicExit = useCallback(() => {
    // Instant redirect to a neutral site
    window.location.href = 'https://www.google.com';
  }, []);

  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Safety', icon: LayoutDashboard, aria: 'View safety dashboard' },
    { id: 'report', label: 'Report', icon: AlertTriangle, aria: 'Report suspicious activity' },
    { id: 'resources', label: 'Help', icon: BookOpen, aria: 'View safety resources' },
    { id: 'profile', label: 'Profile', icon: User, aria: 'View your profile' },
  ], []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-32" role="application">
      {/* Header */}
      <header 
        className="sticky top-0 z-40 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between"
        role="banner"
      >
        <div className="flex items-center gap-2" aria-label="GuardianLink Home">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <Shield size={20} aria-hidden="true" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">GuardianLink</h1>
        </div>
        
        {/* Panic Exit Button - High Accessibility */}
        <button 
          onClick={handlePanicExit}
          aria-label="Quick Exit: Redirect to Google immediately"
          className="px-4 py-2 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-100 flex items-center gap-2 focus:ring-4 focus:ring-red-200 outline-none"
        >
          <X size={14} aria-hidden="true" />
          Quick Exit
        </button>
      </header>

      {/* Main Content - Semantic Landmark */}
      <main className="max-w-md mx-auto px-6 pt-8" role="main" id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Bar - Semantic Navigation */}
      <nav 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm z-50"
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="bg-zinc-900 rounded-[32px] p-2 flex items-center justify-between shadow-2xl shadow-zinc-300 border border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.aria}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isActive ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Stealth Mode Hint */}
      <div 
        className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-zinc-400 font-medium uppercase tracking-widest opacity-50"
        aria-hidden="true"
      >
        Triple-tap header for Stealth Mode
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';
export default Layout;

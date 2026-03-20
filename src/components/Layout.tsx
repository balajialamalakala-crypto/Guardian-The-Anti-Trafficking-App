import React, { useState } from 'react';
import { Shield, AlertTriangle, BookOpen, User, Menu, X, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'report' | 'resources' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'report' | 'resources' | 'profile') => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'report', label: 'Report', icon: AlertTriangle },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Shield size={20} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">GuardianLink</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24 pt-4 px-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 pb-8 z-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 relative",
                  isActive ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive && "bg-emerald-50"
                )}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-emerald-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick SOS Overlay (Discreet) */}
      <div className="fixed bottom-24 right-4 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-200 border-4 border-white"
          onClick={() => setActiveTab('dashboard')} // Quick access to SOS
        >
          <PhoneCall size={24} />
        </motion.button>
      </div>
    </div>
  );
}

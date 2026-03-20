import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, AlertTriangle, Phone, BookOpen, ChevronRight, Loader2, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SOSButton from './SOSButton';
import SafetyMap from './Map';
import SafetyPlan from './SafetyPlan';
import { getSafetyAdvice } from '../services/gemini';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

/**
 * Dashboard component for GuardianLink.
 * Optimized for accessibility and efficiency.
 */
const Dashboard = React.memo(() => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [safetyAdvice, setSafetyAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleSOSActivate = useCallback(() => {
    setIsSOSActive(true);
  }, []);

  const handleSOSCancel = useCallback(() => {
    setIsSOSActive(false);
  }, []);

  const handleCheckIn = useCallback(() => {
    setIsCheckedIn(true);
    setTimeout(() => setIsCheckedIn(false), 3000);
  }, []);

  const fetchAdvice = useCallback(async () => {
    setIsAdviceLoading(true);
    try {
      const advice = await getSafetyAdvice("supportive and empowering safety tips for survivors of trafficking");
      setSafetyAdvice(advice);
    } finally {
      setIsAdviceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvice();

    const reportsQuery = query(
      collection(db, 'reports'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      setReports(reportsData);
      setIsReportsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });

    return () => unsubscribe();
  }, [fetchAdvice]);

  const mapSection = useMemo(() => (
    <section className="space-y-4" aria-labelledby="nearby-activity-title">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg">
            <MapPin size={16} aria-hidden="true" />
          </div>
          <h3 id="nearby-activity-title" className="text-sm font-bold text-zinc-900 tracking-tight">Community Safety</h3>
        </div>
        <button 
          aria-label="View full interactive map"
          className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors focus:ring-2 focus:ring-emerald-500/50 outline-none"
        >
          View Full Map
        </button>
      </div>
      
      {isReportsLoading ? (
        <div className="h-[400px] bg-zinc-100 rounded-3xl flex items-center justify-center" aria-busy="true">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl shadow-lg border border-zinc-200">
          <SafetyMap reports={reports} />
        </div>
      )}
    </section>
  ), [isReportsLoading, reports]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* SOS Section */}
      <section className="relative" aria-label="Emergency SOS Trigger">
        <SOSButton 
          isActive={isSOSActive} 
          onActivate={handleSOSActivate} 
          onCancel={handleSOSCancel} 
        />
      </section>

      {/* Quick Check-in */}
      <section 
        className="flex items-center justify-between p-5 bg-white rounded-3xl border border-zinc-200 shadow-sm"
        aria-label="Safety Check-in"
      >
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Quick Check-in</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Signal safety to your contacts.</p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn}
          aria-label={isCheckedIn ? "Safety check-in sent successfully" : "Send safety check-in to emergency contacts"}
          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 focus:ring-4 outline-none ${
            isCheckedIn 
              ? 'bg-emerald-50 text-emerald-600 focus:ring-emerald-100' 
              : 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-200'
          }`}
        >
          {isCheckedIn ? (
            <>
              <CheckCircle2 size={14} aria-hidden="true" />
              Sent
            </>
          ) : (
            'I am Safe'
          )}
        </button>
      </section>

      {/* Safety Plan Generator - High Impact Feature */}
      <section className="relative z-20" aria-label="Personalized Safety Planning">
        <SafetyPlan />
      </section>

      {/* AI Safety Insight */}
      <section 
        className="bg-emerald-900 text-emerald-50 p-6 rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-800 relative overflow-hidden"
        aria-labelledby="ai-insight-title"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-800/50 rounded-full blur-3xl" aria-hidden="true" />
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-emerald-400" aria-hidden="true" />
          <h3 id="ai-insight-title" className="text-xs font-bold uppercase tracking-widest text-emerald-400">Survivor Support</h3>
        </div>
        
        <div className="relative z-10" aria-live="polite">
          {isAdviceLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={20} className="animate-spin text-emerald-400" />
              <span className="text-sm text-emerald-300">Gathering support...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed font-medium italic">
              "{safetyAdvice || "You are strong. Your safety is the priority. Trust your instincts and know that help is always available."}"
            </p>
          )}
        </div>
        
        <button 
          onClick={fetchAdvice}
          aria-label="Refresh AI safety advice"
          className="mt-4 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors focus:ring-2 focus:ring-emerald-400/50 outline-none"
        >
          Refresh Support
        </button>
      </section>

      {/* Safety Map Section */}
      {mapSection}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;

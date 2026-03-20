import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Phone, BookOpen, ChevronRight, Loader2, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SOSButton from './SOSButton';
import SafetyMap from './Map';
import { getSafetyAdvice } from '../services/gemini';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function Dashboard() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [safetyAdvice, setSafetyAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(true);

  const handleSOSActivate = () => {
    setIsSOSActive(true);
    // In a real app, this would trigger Firebase functions to alert contacts
  };

  const handleSOSCancel = () => {
    setIsSOSActive(false);
  };

  const fetchAdvice = async () => {
    setIsAdviceLoading(true);
    const advice = await getSafetyAdvice("general safety tips for high-risk areas");
    setSafetyAdvice(advice);
    setIsAdviceLoading(false);
  };

  useEffect(() => {
    fetchAdvice();

    // Real-time reports
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
  }, []);

  return (
    <div className="space-y-8">
      {/* SOS Section */}
      <section className="relative">
        <SOSButton 
          isActive={isSOSActive} 
          onActivate={handleSOSActivate} 
          onCancel={handleSOSCancel} 
        />
      </section>

      {/* AI Safety Insight */}
      <section className="bg-emerald-900 text-emerald-50 p-6 rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-800 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-800/50 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">AI Safety Insight</h3>
        </div>
        
        <div className="relative z-10">
          {isAdviceLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={20} className="animate-spin text-emerald-400" />
              <span className="text-sm text-emerald-300">Analyzing safety data...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed font-medium">
              {safetyAdvice || "Always trust your instincts. If a situation feels wrong, prioritize leaving immediately and finding a public space."}
            </p>
          )}
        </div>
        
        <button 
          onClick={fetchAdvice}
          className="mt-4 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Refresh Advice
        </button>
      </section>

      {/* Safety Map Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg">
              <MapPin size={16} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Nearby Activity</h3>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors">
            View Full Map
          </button>
        </div>
        
        {isReportsLoading ? (
          <div className="h-[400px] bg-zinc-100 rounded-3xl flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : (
          <SafetyMap reports={reports} />
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
            <AlertTriangle size={20} />
          </div>
          <h4 className="font-bold text-zinc-900 text-sm tracking-tight">Report Activity</h4>
          <p className="text-[10px] text-zinc-500 mt-1">Submit a suspicious incident report.</p>
        </div>
        
        <div className="p-5 bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <h4 className="font-bold text-zinc-900 text-sm tracking-tight">Safety Guide</h4>
          <p className="text-[10px] text-zinc-500 mt-1">Learn about trafficking indicators.</p>
        </div>
      </section>
    </div>
  );
}

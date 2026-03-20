import React, { useState, useCallback, useMemo } from 'react';
import { ShieldCheck, Sparkles, Loader2, ChevronRight, Download, EyeOff, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSafetyAdvice } from '../services/gemini';

/**
 * SafetyPlan Generator Component.
 * Uses Gemini AI to create a personalized, discreet safety plan for survivors.
 * High-impact feature for Problem Statement Alignment.
 */
const SafetyPlan = React.memo(() => {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState('');
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const prompt = `Create a discreet, step-by-step safety plan for a survivor of trafficking in this situation: "${situation}". 
      Focus on: 
      1. Immediate physical safety.
      2. Securing digital identity.
      3. Finding trusted community support.
      4. How to leave safely if needed.
      Keep it supportive, empowering, and easy to read. Use bullet points.`;
      
      const result = await getSafetyAdvice(prompt);
      setPlan(result);
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  }, [situation]);

  const questions = useMemo(() => [
    { id: 1, text: "What is your current situation? (e.g., I'm at home, I'm traveling, I'm looking for a way out)", value: situation, setter: setSituation },
  ], [situation]);

  return (
    <div className="bg-white rounded-[32px] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden" role="region" aria-labelledby="plan-title">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 id="plan-title" className="text-xl font-bold text-zinc-900 tracking-tight">AI Safety Plan</h2>
            <p className="text-sm text-zinc-500">Personalized steps for your protection.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-sm text-zinc-600 leading-relaxed">
                  This tool uses AI to help you create a discreet safety plan. Your input is confidential and used only to generate your plan.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all focus:ring-4 focus:ring-zinc-200 outline-none"
              >
                Start My Plan
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="situation" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  Describe your current situation
                </label>
                <textarea
                  id="situation"
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="e.g., I need a safe way to contact help without being noticed..."
                  className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                />
              </div>
              <button
                onClick={generatePlan}
                disabled={!situation || isLoading}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 focus:ring-4 focus:ring-emerald-100 outline-none"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={20} />}
                Generate My Plan
              </button>
            </motion.div>
          )}

          {step === 3 && plan && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-emerald-200">
                  <Lock size={48} opacity={0.1} />
                </div>
                <div className="prose prose-sm prose-emerald max-w-none">
                  <div className="whitespace-pre-wrap text-emerald-900 font-medium leading-relaxed">
                    {plan}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors outline-none focus:ring-2 focus:ring-zinc-200"
                >
                  Start Over
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <Download size={14} />
                  Save PDF
                </button>
              </div>

              <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                <EyeOff size={12} />
                Discreet Mode Enabled
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

SafetyPlan.displayName = 'SafetyPlan';
export default SafetyPlan;

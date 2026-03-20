import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Phone, Send, MapPin, X } from 'lucide-react';

interface SOSButtonProps {
  onActivate: () => void;
  onCancel: () => void;
  isActive: boolean;
}

export default function SOSButton({ onActivate, onCancel, isActive }: SOSButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds

  useEffect(() => {
    if (isHolding) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
        setProgress(newProgress);
        if (newProgress >= 100) {
          clearInterval(timerRef.current!);
          onActivate();
          setIsHolding(false);
        }
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHolding, onActivate]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl shadow-zinc-200 border border-zinc-100 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              {/* Progress Circle Background */}
              <svg className="w-48 h-48 -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="transparent"
                  stroke="#f4f4f5"
                  strokeWidth="8"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 - (552.92 * progress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-75 ease-linear"
                />
              </svg>
              
              {/* Main Button */}
              <button
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl shadow-red-200 active:scale-95 transition-transform"
              >
                <ShieldAlert size={48} className={isHolding ? "animate-pulse" : ""} />
                <span className="mt-2 font-bold text-xl tracking-tighter">SOS</span>
              </button>
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-zinc-900">Emergency SOS</h2>
              <p className="text-sm text-zinc-500 max-w-[200px] mt-1">
                {isHolding ? "Keep holding to activate..." : "Hold for 3 seconds to alert emergency contacts"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center animate-bounce">
              <ShieldAlert size={40} />
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">SOS ACTIVATED</h2>
              <p className="text-zinc-600 mt-2">Alerts sent to your emergency contacts with your current location.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <div className="p-4 bg-zinc-50 rounded-2xl flex flex-col items-center gap-2 border border-zinc-100">
                <MapPin size={20} className="text-emerald-600" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Location Sent</span>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl flex flex-col items-center gap-2 border border-zinc-100">
                <Send size={20} className="text-blue-600" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Contacts Notified</span>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="mt-4 flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
              Cancel Alert
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

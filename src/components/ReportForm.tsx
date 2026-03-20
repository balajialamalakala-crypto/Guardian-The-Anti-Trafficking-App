import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeReport } from '../services/gemini';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

interface ReportFormProps {
  onSubmit?: (report: any) => void;
}

export default function ReportForm({ onSubmit }: ReportFormProps) {
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAnalyze = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    const analysis = await analyzeReport(description);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: "Current Location"
        });
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const reportData = {
        id: Date.now().toString(),
        uid: isAnonymous ? null : auth.currentUser?.uid,
        timestamp: serverTimestamp(),
        location: location || { lat: 0, lng: 0, address: "Unknown" },
        description,
        photos,
        status: 'pending',
        isAnonymous,
      };

      await addDoc(collection(db, 'reports'), reportData);
      
      if (onSubmit) onSubmit(reportData);
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-xl shadow-zinc-200 border border-zinc-100 flex flex-col items-center text-center gap-6"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Report Submitted</h2>
          <p className="text-zinc-500 mt-2">Thank you for your vigilance. Authorities have been notified and will investigate.</p>
        </div>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setDescription('');
            setPhotos([]);
            setLocation(null);
            setAiAnalysis(null);
          }}
          className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-colors"
        >
          Submit Another Report
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-zinc-200 border border-zinc-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Report Suspicious Activity</h2>
          <p className="text-sm text-zinc-500">Your report can save lives.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you saw (people, vehicles, behavior)..."
            className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none"
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!description || isAnalyzing}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
            AI Analysis (Extract Details)
          </button>
          
          <AnimatePresence>
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 leading-relaxed"
              >
                <strong>AI Insight:</strong> {aiAnalysis}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-colors"
          >
            <Camera size={20} className="text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-700">Add Photos</span>
          </button>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={handleGetLocation}
            className={cn(
              "flex items-center justify-center gap-2 p-4 border rounded-2xl transition-colors",
              location ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            )}
          >
            <MapPin size={20} className={location ? "text-emerald-600" : "text-zinc-500"} />
            <span className="text-sm font-semibold">{location ? "Location Set" : "Add Location"}</span>
          </button>
        </div>

        {photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative w-16 h-16 flex-shrink-0">
                <img src={photo} alt="Preview" className="w-full h-full object-cover rounded-xl border border-zinc-200" />
                <button
                  type="button"
                  onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-zinc-700">Submit Anonymously</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              isAnonymous ? "bg-emerald-600" : "bg-zinc-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              isAnonymous ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
          Submit Report
        </button>
      </form>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

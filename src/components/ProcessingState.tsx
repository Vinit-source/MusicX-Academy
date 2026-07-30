import React from 'react';
import { Sparkles, Loader2, Music, CheckCircle2 } from 'lucide-react';

export const ProcessingState: React.FC = () => {
  return (
    <div id="ocr-processing-modal" className="max-w-md mx-auto my-16 bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-fade-in">
      
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900">
          Digitizing Swara Notation...
        </h3>
        <p className="text-xs text-slate-500">
          Gemini AI Vision is extracting handwritten & printed Carnatic structures
        </p>
      </div>

      {/* Animated Step Tracker */}
      <div className="space-y-2.5 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-2 text-indigo-700">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Detecting Raga Name & Parent Melakarta</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          <span>Parsing Arohanam & Avarohanam scale swaras</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          <span>Structuring Short Phrases grid</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          <span>Formatting Adi Thala (Two Kalai) beat columns</span>
        </div>
      </div>
    </div>
  );
};

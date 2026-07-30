import React from 'react';
import { Music, Sparkles, FileSpreadsheet, FileText, Upload, Settings } from 'lucide-react';
import { SAMPLE_RAGAS } from '../data/sampleRagas';
import { SwaraStructure } from '../types';

interface NavbarProps {
  onSelectSample: (sample: SwaraStructure) => void;
  onResetNewUpload: () => void;
  onOpenSettings: () => void;
  activeRagaName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectSample,
  onResetNewUpload,
  onOpenSettings,
  activeRagaName,
}) => {
  return (
    <header id="app-navbar" className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div id="brand-container" className="flex items-center space-x-3 cursor-pointer" onClick={onResetNewUpload}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-normal tracking-wide text-slate-800 font-yatra pt-1">
                gitaragavidvat
              </h1>
              <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full">
                Smart OCR
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Digitize handwritten & printed swara sheets
            </p>
          </div>
        </div>

        {/* Quick Sample Selector & Actions */}
        <div id="navbar-actions" className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-xs font-medium text-slate-500 px-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Library Vol 1:
            </span>
            {SAMPLE_RAGAS.map((sample) => {
              const isActive = activeRagaName === sample.ragaName;
              return (
                <button
                  key={sample.id}
                  id={`sample-btn-${sample.id}`}
                  onClick={() => onSelectSample(sample)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {sample.ragaName}
                </button>
              );
            })}
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <button
            id="settings-btn"
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            id="new-upload-btn"
            onClick={onResetNewUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
};

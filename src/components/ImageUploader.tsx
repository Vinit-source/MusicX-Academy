import React, { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Sparkles, FileText, Camera, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { SAMPLE_RAGAS } from '../data/sampleRagas';
import { SwaraStructure } from '../types';

interface ImageUploaderProps {
  onProcessImage: (base64Image: string, mimeType: string) => void;
  onSelectSample: (sample: SwaraStructure) => void;
  isLoading: boolean;
}

const MAX_FREE_TIER_UPLOADS = 15;

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onProcessImage,
  onSelectSample,
  isLoading,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check usage limits from local storage
    const dateStr = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem('ocrUploadDate');
    if (storedDate !== dateStr) {
      localStorage.setItem('ocrUploadDate', dateStr);
      localStorage.setItem('ocrUploadsToday', '0');
      setUsageCount(0);
    } else {
      setUsageCount(parseInt(localStorage.getItem('ocrUploadsToday') || '0', 10));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    setErrorMsg(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDigitizeClick = () => {
    if (selectedImage) {
      onProcessImage(selectedImage, mimeType);
    }
  };

  const remaining = Math.max(0, MAX_FREE_TIER_UPLOADS - usageCount);
  const isLimitReached = remaining === 0;

  return (
    <div id="image-uploader-section" className="space-y-8 max-w-4xl mx-auto py-6 px-4">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Carnatic Music Swara Structure OCR
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Upload handwritten or printed swara notation sheets. Our AI extracts Raga details, Arohanam, Avarohanam, Short Phrases, and Adi Thala (Two Kalai) into editable structured tables.
        </p>
      </div>

      {/* Main Upload Card */}
      <div id="upload-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        {/* Drop Zone */}
        <div
          id="drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/80 bg-slate-50/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isLimitReached}
          />

          {selectedImage ? (
            <div id="selected-preview" className="space-y-4">
              <div className="relative inline-block max-w-sm rounded-lg overflow-hidden border border-slate-300 shadow-md">
                <img
                  src={selectedImage}
                  alt="Swara sheet preview"
                  className="max-h-64 object-contain mx-auto bg-slate-900/5"
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Click or drag to change image
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Drop your handwritten or printed swara photo here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, JPEG, WebP photos of notebook or book notation
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center space-x-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                  <Camera className="w-3.5 h-3.5" /> Select File or Photo
                </span>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 pt-2">
          {/* Action Button */}
          {selectedImage && (
            <button
              id="digitize-action-btn"
              onClick={handleDigitizeClick}
              disabled={isLoading || isLimitReached}
              className={`flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 ${
                isLoading || isLimitReached ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
              }`}
            >
              <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
              <span>Digitize Swara Sheet</span>
            </button>
          )}

          {/* Usage limit info */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <div className="flex h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${remaining < 100 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${(usageCount / MAX_FREE_TIER_UPLOADS) * 100}%` }}
              ></div>
            </div>
            <span>
              Free tier: <strong>{usageCount}</strong> / {MAX_FREE_TIER_UPLOADS} uploads today. Resets daily.
            </span>
          </div>
        </div>
      </div>

      {/* Library Section */}
      <div id="library-section" className="bg-slate-100 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-2xl text-slate-800 font-yatra tracking-wide">
              gitaragavidvatam Library
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              A definitive collection. Each Volume contains 72 Rare Janya Ragas. 24 double sheets per volume.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Active Volume 1 */}
          <div className="bg-amber-100/50 border border-amber-200 rounded-xl overflow-hidden shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition-all relative">
            <div className="bg-amber-700 text-white p-3 flex flex-col items-center justify-center flex-1 min-h-[140px] relative overflow-hidden group-hover:bg-amber-800 transition-colors">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-overlay"></div>
              <BookOpen className="w-8 h-8 mb-2 opacity-80" />
              <span className="font-yatra text-xl tracking-wider text-amber-50">Vol 1</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-amber-200 mt-1">Available</span>
            </div>
            <div className="bg-white p-3 border-t border-amber-200">
              <div className="text-xs font-bold text-slate-800 mb-2">Sample Ragas:</div>
              <div className="space-y-1.5">
                {SAMPLE_RAGAS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample)}
                    className="block w-full text-left text-[11px] text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors truncate"
                    title={sample.ragaName}
                  >
                    • {sample.ragaName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Volumes */}
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((vol) => (
            <div key={vol} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
              <div className="bg-slate-300 text-slate-500 p-3 flex flex-col items-center justify-center flex-1 min-h-[140px] relative">
                <BookOpen className="w-8 h-8 mb-2 opacity-40" />
                <span className="font-yatra text-xl tracking-wider text-slate-600">Vol {vol}</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mt-1">Upcoming</span>
              </div>
              <div className="bg-white p-3 border-t border-slate-200 flex items-center justify-center">
                 <span className="text-[10px] text-slate-400">72 Rare Janya Ragas</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

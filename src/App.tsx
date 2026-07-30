/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { ProcessingState } from './components/ProcessingState';
import { SwaraEditor } from './components/SwaraEditor';
import { SettingsModal } from './components/SettingsModal';
import { SwaraStructure } from './types';
import { SAMPLE_RAGAS } from './data/sampleRagas';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [digitizedData, setDigitizedData] = useState<SwaraStructure | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load API key from local storage
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('geminiApiKey', key);
    } else {
      localStorage.removeItem('geminiApiKey');
    }
  };

  const incrementUsage = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem('ocrUploadDate');
    let currentUsage = parseInt(localStorage.getItem('ocrUploadsToday') || '0', 10);
    
    if (storedDate !== dateStr) {
      localStorage.setItem('ocrUploadDate', dateStr);
      currentUsage = 0;
    }
    
    localStorage.setItem('ocrUploadsToday', (currentUsage + 1).toString());
  };

  // Handle OCR API call
  const handleProcessImage = async (imageBase64: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          clientApiKey: apiKey,
        }),
      });

      const resData = await response.json();

      if (response.status === 401 && resData.error === 'API_KEY_REQUIRED') {
        // Deployed outside AI studio and API key is missing
        setIsSettingsOpen(true);
        throw new Error('Gemini API key is required. Please set it in settings.');
      }

      if (resData.success && resData.data) {
        incrementUsage();
        setDigitizedData(resData.data);
      } else {
        throw new Error(resData.error || 'Failed to extract swara structure from image.');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError(err.message || 'An error occurred during image OCR processing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting preset sample
  const handleSelectSample = (sample: SwaraStructure) => {
    setError(null);
    setDigitizedData(sample);
  };

  // Reset to upload view
  const handleResetNewUpload = () => {
    setDigitizedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        onSelectSample={handleSelectSample}
        onResetNewUpload={handleResetNewUpload}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeRagaName={digitizedData?.ragaName}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {error && (
          <div className="max-w-4xl mx-auto my-4 px-4">
            <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-4 text-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-semibold hover:underline text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <ProcessingState />
        ) : digitizedData ? (
          <SwaraEditor
            initialData={digitizedData}
            onBackToUpload={handleResetNewUpload}
          />
        ) : (
          <ImageUploader
            onProcessImage={handleProcessImage}
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-300">Carnatic Swara Digitizer</span> — Smart OCR & Notation Formatter
          </div>
          <div>
            Exports to Excel (.xlsx) & PDF format
          </div>
        </div>
      </footer>
    </div>
  );
}

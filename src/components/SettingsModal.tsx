import React, { useState } from 'react';
import { Settings, X, Key, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Required if you are running this app outside of Google AI Studio. Your key is securely stored in your browser's local storage.
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-800 mb-1">
              How to get an API Key (Takes 2 mins)
            </h3>
            <ol className="list-decimal list-inside text-xs text-indigo-700 space-y-1 mt-2">
              <li>
                Go to{' '}
                <a
                  href="https://aistudio.google.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-indigo-900 inline-flex items-center gap-1"
                >
                  aistudio.google.com/apikeys
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Sign in with your Google account.</li>
              <li>Click <strong>"Create API key"</strong>.</li>
              <li>Copy the generated key and paste it above.</li>
            </ol>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveApiKey(inputKey);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

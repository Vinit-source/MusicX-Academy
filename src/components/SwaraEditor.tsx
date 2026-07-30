import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Music,
  Edit3,
  Sparkles,
  Info,
  ArrowLeft, GripVertical } from 'lucide-react';
// @ts-ignore
import MIDISounds from 'midi-sounds-react';
import { SwaraStructure, SwaraPhraseRow, AdiThalaRow } from '../types';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';
import { playSwaraSequence } from '../utils/audioSynth';

export const INSTRUMENTS = [
  { id: 5, name: 'Electric Piano' },
  { id: 21, name: 'Harmonium (Reed Organ)' }
];

interface SwaraEditorProps {
  initialData: SwaraStructure;
  onBackToUpload: () => void;
}

export const SwaraEditor: React.FC<SwaraEditorProps> = ({
  initialData,
  onBackToUpload,
}) => {
  const [data, setData] = useState<SwaraStructure>(initialData);
  const [copied, setCopied] = useState(false);
  const [showNotationHelp, setShowNotationHelp] = useState(false);
  const [activeAudioRow, setActiveAudioRow] = useState<string | null>(null);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);

  const [draggedPhraseIdx, setDraggedPhraseIdx] = useState<number | null>(null);
  const [draggedThalaIdx, setDraggedThalaIdx] = useState<number | null>(null);

  const handlePlayAllShortPhrases = () => {
    const allTokens: string[] = [];
    data.shortPhrases.forEach(row => {
      if (row.cell1) allTokens.push(...row.cell1.split(/[\s]+/));
      if (row.cell2) allTokens.push(...row.cell2.split(/[\s]+/));
      if (row.cell3) allTokens.push(...row.cell3.split(/[\s]+/));
      if (row.cell4) allTokens.push(...row.cell4.split(/[\s]+/));
    });
    handlePlayPhraseText(allTokens.join(' '), 'All-Short-Phrases');
  };

  const handlePlayAllAdiThala = () => {
    const allTokens: string[] = [];
    data.adiThalaRows.forEach(row => {
      allTokens.push(...row.phrases.join(' ').split(/[\s]+/));
    });
    handlePlayPhraseText(allTokens.join(' '), 'All-Adi-Thala');
  };

  const handlePhraseDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedPhraseIdx(idx);
  };
  const handlePhraseDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedPhraseIdx === null || draggedPhraseIdx === targetIdx) return;
    setData(prev => {
      const updated = [...prev.shortPhrases];
      const [moved] = updated.splice(draggedPhraseIdx, 1);
      updated.splice(targetIdx, 0, moved);
      return { ...prev, shortPhrases: updated };
    });
    setDraggedPhraseIdx(null);
  };

  const handleThalaDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedThalaIdx(idx);
  };
  const handleThalaDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedThalaIdx === null || draggedThalaIdx === targetIdx) return;
    setData(prev => {
      const updated = [...prev.adiThalaRows];
      const [moved] = updated.splice(draggedThalaIdx, 1);
      updated.splice(targetIdx, 0, moved);
      return { ...prev, adiThalaRows: updated };
    });
    setDraggedThalaIdx(null);
  };

  // -----

  const [selectedInstrument, setSelectedInstrument] = useState<number>(5);
  const midiSoundsRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Field update handlers
  const handleMetaChange = (field: keyof SwaraStructure, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArohanamChange = (text: string) => {
    const list = text.split(/[\s,]+/).filter(Boolean);
    setData((prev) => ({ ...prev, arohanam: list }));
  };

  const handleAvarohanamChange = (text: string) => {
    const list = text.split(/[\s,]+/).filter(Boolean);
    setData((prev) => ({ ...prev, avarohanam: list }));
  };

  // Short Phrases handlers
  const handleShortPhraseCellChange = (rowIndex: number, cellKey: keyof SwaraPhraseRow, value: string) => {
    setData((prev) => {
      const updated = [...prev.shortPhrases];
      updated[rowIndex] = { ...updated[rowIndex], [cellKey]: value };
      return { ...prev, shortPhrases: updated };
    });
  };

  const handleAddShortPhraseRow = () => {
    setData((prev) => ({
      ...prev,
      shortPhrases: [
        ...prev.shortPhrases,
        { cell1: '', cell2: '', cell3: '', cell4: '' },
      ],
    }));
  };

  const handleRemoveShortPhraseRow = (index: number) => {
    setData((prev) => ({
      ...prev,
      shortPhrases: prev.shortPhrases.filter((_, i) => i !== index),
    }));
  };

  // Adi Thala handlers
  const handleAdiThalaHeaderChange = (rowIndex: number, colIndex: number, value: string) => {
    setData((prev) => {
      const updated = [...prev.adiThalaRows];
      const newHeader = [...updated[rowIndex].header] as [string, string, string, string];
      newHeader[colIndex] = value;
      updated[rowIndex] = { ...updated[rowIndex], header: newHeader };
      return { ...prev, adiThalaRows: updated };
    });
  };

  const handleAdiThalaPhraseChange = (rowIndex: number, colIndex: number, value: string) => {
    setData((prev) => {
      const updated = [...prev.adiThalaRows];
      const newPhrases = [...updated[rowIndex].phrases] as [string, string, string, string];
      newPhrases[colIndex] = value;
      updated[rowIndex] = { ...updated[rowIndex], phrases: newPhrases };
      return { ...prev, adiThalaRows: updated };
    });
  };

  const handleAddAdiThalaRow = () => {
    const isEven = data.adiThalaRows.length % 2 === 0;
    const defaultHeader: [string, string, string, string] = isEven
      ? ['U', '1', '2', '3']
      : ['U', 'V', 'U', 'V'];

    setData((prev) => ({
      ...prev,
      adiThalaRows: [
        ...prev.adiThalaRows,
        {
          id: `row-${Date.now()}`,
          header: defaultHeader,
          phrases: ['', '', '', ''],
        },
      ],
    }));
  };

  const handleRemoveAdiThalaRow = (index: number) => {
    setData((prev) => ({
      ...prev,
      adiThalaRows: prev.adiThalaRows.filter((_, i) => i !== index),
    }));
  };

  // Audio Playback
  const handleStopAudio = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setActiveAudioRow(null);
    setActiveAudioIndex(null);
  };

  const handlePlayScale = async (tokens: string[], label: string) => {
    if (activeAudioRow === label) {
      handleStopAudio();
      return;
    }
    handleStopAudio();
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;
    setActiveAudioRow(label);
    await playSwaraSequence(
      midiSoundsRef.current,
      tokens,
      selectedInstrument,
      (idx) => { if (!abortCtrl.signal.aborted) setActiveAudioIndex(idx); },
      abortCtrl.signal
    );
    if (!abortCtrl.signal.aborted) {
      setActiveAudioRow(null);
      abortControllerRef.current = null;
    }
  };

  const handlePlayPhraseText = async (text: string, label: string) => {
    if (activeAudioRow === label) {
      handleStopAudio();
      return;
    }
    handleStopAudio();
    
    // Parse the text into swara tokens. 
    // It can be space-separated like "s r2 g3" or grouped like "sr2g3" or "srgm".
    // We use a regex to match a swara: an alphabet, optionally followed by 1-3, optionally followed by ' or . or ,
    // Also include '-' or 'x' as extensions.
    let tokens = text.trim().split(/[\s]+/);
    if (tokens.length === 1 && text.length > 3 && !text.includes(' ')) {
      // Try to split tightly packed notations like "pnSRG"
      const matches = text.match(/[a-zA-Z][1-3]?['.,]?|-|x/g);
      if (matches) {
        tokens = matches;
      }
    } else {
      // Just in case there are attached commas like "p,m,g,r", split them too if they are packed
      const newTokens: string[] = [];
      tokens.forEach(t => {
        const matches = t.match(/[a-zA-Z][1-3]?['.,]?|-|x/g);
        if (matches && matches.join('') === t) {
          newTokens.push(...matches);
        } else {
          newTokens.push(t);
        }
      });
      tokens = newTokens;
    }

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;
    setActiveAudioRow(label);
    await playSwaraSequence(
      midiSoundsRef.current,
      tokens,
      selectedInstrument,
      (idx) => { if (!abortCtrl.signal.aborted) setActiveAudioIndex(idx); },
      abortCtrl.signal
    );
    if (!abortCtrl.signal.aborted) {
      setActiveAudioRow(null);
      abortControllerRef.current = null;
    }
  };


  // Plain Text Copy
  const handleCopyText = () => {
    let str = `${data.ragaName} : Parent Raga - ${data.parentRaga}\n`;
    if (data.remarks) str += `Note: ${data.remarks}\n`;
    str += `\nArohanam:\n${data.arohanam.join(' ')}\n`;
    str += `\nAvarohanam:\n${data.avarohanam.join(' ')}\n`;
    str += `\nShort Phrases:\n`;
    data.shortPhrases.forEach((r) => {
      str += `${r.cell1}\t|\t${r.cell2}\t|\t${r.cell3}\t|\t${r.cell4}\n`;
    });
    str += `\nAdi Thala (Two Kalai):\n`;
    data.adiThalaRows.forEach((r) => {
      str += `[ ${r.header.join(' | ')} ]\n`;
      str += `${r.phrases.join('  ||  ')}\n\n`;
    });

    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset Changes
  const handleReset = () => {
    setData(initialData);
  };

  return (
    <div id="swara-editor-container" className="max-w-6xl mx-auto py-6 px-4 space-y-8">
      <div style={{ display: 'none' }}>
        <MIDISounds ref={midiSoundsRef} appElementName="root" instruments={INSTRUMENTS.map(i => i.id)} />
      </div>
      
      {/* Action Bar Header */}
      <div id="editor-action-bar" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            id="back-btn"
            onClick={onBackToUpload}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            title="Upload new image"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Digitized Swara Sheet
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {data.ragaName || 'Untitled Raga'}
            </h2>
          </div>
        </div>

        {/* Toolbar Download & Copy Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowNotationHelp(!showNotationHelp)}
            className="flex items-center gap-1.5 px-3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors font-medium text-xs border border-indigo-100 mr-2"
            title="Notation Guide"
          >
            <Info className="w-4 h-4" />
            <span>Guide</span>
          </button>
          <div className="relative flex items-center mr-2">
            <Music className="w-4 h-4 text-slate-400 absolute left-3" />
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(Number(e.target.value))}
              className="pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer transition-colors"
              title="Select Playback Instrument"
            >
              {INSTRUMENTS.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="export-pdf-btn"
            onClick={() => exportToPdf(data)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            id="export-excel-btn"
            onClick={() => exportToExcel(data)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>

          <button
            id="copy-text-btn"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            id="reset-btn"
            onClick={handleReset}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="Reset edits to OCR output"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Notation Guide */}
      {showNotationHelp && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm text-sm text-slate-700 relative">
          <button 
            onClick={() => setShowNotationHelp(false)}
            className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-600"
          >
            &times;
          </button>
          <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" /> Swara Notation Guide
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 border-b border-indigo-100 pb-1">Mandra Saptak (Lower)</h4>
              <p className="text-xs text-slate-600 mb-1">Add a comma <code className="bg-white px-1 rounded text-indigo-700">,</code> after the swara.</p>
              <ul className="text-xs space-y-1 mt-2">
                <li><code className="font-bold">s,</code> - Lower Sa</li>
                <li><code className="font-bold">n3,</code> - Lower Kakali Nishadam</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 border-b border-indigo-100 pb-1">Madhya Saptak (Middle)</h4>
              <p className="text-xs text-slate-600 mb-1">Standard notation without suffixes.</p>
              <ul className="text-xs space-y-1 mt-2">
                <li><code className="font-bold">s</code> - Middle Sa</li>
                <li><code className="font-bold">g3</code> - Middle Antara Gandharam</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 border-b border-indigo-100 pb-1">Tara Saptak (Higher)</h4>
              <p className="text-xs text-slate-600 mb-1">Use CAPITAL letters.</p>
              <ul className="text-xs space-y-1 mt-2">
                <li><code className="font-bold">s'</code> or <code className="font-bold">s.</code> - Higher Sa</li>
                <li><code className="font-bold">r2'</code> - Higher Chathusruthi Rishabham</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Raga Header Card */}
      <div id="raga-meta-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Raga Name (Title)
            </label>
            <input
              type="text"
              value={data.ragaName}
              onChange={(e) => handleMetaChange('ragaName', e.target.value)}
              className="w-full text-lg font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white"
              placeholder="e.g. Gambhira natta"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Parent Raga
            </label>
            <input
              type="text"
              value={data.parentRaga}
              onChange={(e) => handleMetaChange('parentRaga', e.target.value)}
              className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white"
              placeholder="e.g. Chala natta No 36"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Special Remarks / Notes (Optional)
          </label>
          <input
            type="text"
            value={data.remarks || ''}
            onChange={(e) => handleMetaChange('remarks', e.target.value)}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white"
            placeholder="e.g. A bhashanga raga in which the 'Anya Swara' is Kakali Nishadam (n3)"
          />
        </div>
      </div>

      {/* Arohanam & Avarohanam Card */}
      <div id="scales-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-600" />
            Arohanam & Avarohanam Scales
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Edit swara tokens space-separated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Arohanam */}
          <div className="space-y-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Arohanam (Ascending)
              </label>
              <button
                onClick={() => handlePlayScale(data.arohanam, 'Arohanam')}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  activeAudioRow === 'Arohanam' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200'
                }`}
              >
                {activeAudioRow === 'Arohanam' ? (
                  <>
                    <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={data.arohanam.join(' ')}
              onChange={(e) => handleArohanamChange(e.target.value)}
              className="w-full text-base font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />

            {/* Visual Swara Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.arohanam.map((swara, idx) => (
                <span
                  key={idx}
                  className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border transition-all ${
                    activeAudioRow === 'Arohanam' && activeAudioIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-700 scale-110 shadow'
                      : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                  }`}
                >
                  {swara}
                </span>
              ))}
            </div>
          </div>

          {/* Avarohanam */}
          <div className="space-y-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Avarohanam (Descending)
              </label>
              <button
                onClick={() => handlePlayScale(data.avarohanam, 'Avarohanam')}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  activeAudioRow === 'Avarohanam' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200'
                }`}
              >
                {activeAudioRow === 'Avarohanam' ? (
                  <>
                    <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={data.avarohanam.join(' ')}
              onChange={(e) => handleAvarohanamChange(e.target.value)}
              className="w-full text-base font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />

            {/* Visual Swara Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.avarohanam.map((swara, idx) => (
                <span
                  key={idx}
                  className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border transition-all ${
                    activeAudioRow === 'Avarohanam' && activeAudioIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-700 scale-110 shadow'
                      : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                  }`}
                >
                  {swara}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Short Phrases Section */}
      <div id="short-phrases-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Short Phrases (Sancharas)
            </h3>
            <p className="text-xs text-slate-500">
              Key characteristic phrases of the raga arranged in 4-column grid
            </p>
          </div>

          <button
            onClick={handlePlayAllShortPhrases}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs ${
              activeAudioRow === 'All-Short-Phrases' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
            }`}
          >
            {activeAudioRow === 'All-Short-Phrases' ? (
              <>
                <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </>
            )}
          </button>
        </div>

        {/* Phrases Table */}
        <div className="overflow-x-auto border border-slate-300 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase border-b border-slate-300">
                <th className="p-3 border-r border-slate-300 text-center w-12">#</th>
                <th className="p-3 border-r border-slate-300">Phrase 1</th>
                <th className="p-3 border-r border-slate-300">Phrase 2</th>
                <th className="p-3 border-r border-slate-300">Phrase 3</th>
                <th className="p-3 border-r border-slate-300">Phrase 4</th>
                <th className="p-3 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.shortPhrases.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-all cursor-move" draggable onDragStart={(e) => handlePhraseDragStart(e, rIdx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handlePhraseDrop(e, rIdx)}>
                  <td className="p-2 text-center text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-50 flex items-center justify-center gap-1">
                    <GripVertical className="w-3 h-3 text-slate-400" />
                    {rIdx + 1}
                  </td>
                  {(['cell1', 'cell2', 'cell3', 'cell4'] as (keyof SwaraPhraseRow)[]).map((colKey, colIdx) => (
                    <td key={colIdx} className="p-2 border-r border-slate-200 relative group">
                      <input
                        type="text"
                        value={row[colKey]}
                        onChange={(e) => handleShortPhraseCellChange(rIdx, colKey, e.target.value)}
                        className="w-full text-sm font-mono text-slate-800 bg-transparent px-2 py-1 pr-8 rounded focus:bg-indigo-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="..."
                      />
                      {row[colKey] && (
                        <button
                          onClick={() => handlePlayPhraseText(row[colKey] as string, `phrase-${rIdx}-${colIdx}`)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all opacity-0 group-hover:opacity-100 ${
                            activeAudioRow === `phrase-${rIdx}-${colIdx}`
                              ? 'opacity-100 bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                          }`}
                          title={activeAudioRow === `phrase-${rIdx}-${colIdx}` ? "Stop" : "Play Phrase"}
                        >
                          {activeAudioRow === `phrase-${rIdx}-${colIdx}` ? (
                            <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                          ) : (
                            <Play className="w-3 h-3 fill-current" />
                          )}
                        </button>
                      )}
                    </td>
                  ))}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleRemoveShortPhraseRow(rIdx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleAddShortPhraseRow}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Phrase Row</span>
          </button>
        </div>
      </div>

      {/* Adi Thala (Two Kalai) Table Section */}
      <div id="adi-thala-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Adi Thala ( Two Kalai )
            </h3>
            <p className="text-xs text-slate-500">
              Traditional 4-beat column layout with beat markers (U, 1, 2, 3 or U, V, U, V) and swaras
            </p>
          </div>

          <button
            onClick={handlePlayAllAdiThala}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs ${
              activeAudioRow === 'All-Adi-Thala' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
            }`}
          >
            {activeAudioRow === 'All-Adi-Thala' ? (
              <>
                <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted Adi Thala Table */}
        <div className="space-y-6">
          {data.adiThalaRows.map((row, rIdx) => {
            const isAudioPlayingThisRow = activeAudioRow === `AdiThala-${rIdx}`;

            return (
              <div
                key={row.id || rIdx}
                className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs bg-slate-50/30" draggable onDragStart={(e) => handleThalaDragStart(e, rIdx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleThalaDrop(e, rIdx)}>
                {/* Row Controls Bar */}
                <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-300 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[11px]">
                      {rIdx + 1}
                    </span>
                    Avartanam Row {rIdx + 1}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlayPhraseText(row.phrases.join(' '), `AdiThala-${rIdx}`)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                        isAudioPlayingThisRow
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white hover:bg-indigo-50 text-slate-800 border border-slate-300'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isAudioPlayingThisRow ? 'Playing...' : 'Play Row'}</span>
                    </button>

                    <button
                      onClick={() => handleRemoveAdiThalaRow(rIdx)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      title="Delete avartanam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid Table */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-200/70 border-b border-slate-300 text-center font-bold text-slate-800 text-sm">
                      {row.header.map((head, cIdx) => (
                        <th key={cIdx} className="p-2 border-r border-slate-300 last:border-r-0 w-1/4">
                          <input
                            type="text"
                            value={head}
                            onChange={(e) => handleAdiThalaHeaderChange(rIdx, cIdx, e.target.value)}
                            className="w-16 text-center font-extrabold text-slate-900 bg-white/80 border border-slate-300 rounded px-1 py-0.5 focus:outline-none focus:border-indigo-500"
                            placeholder="U/1/V"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      {row.phrases.map((phrase, cIdx) => (
                        <td key={cIdx} className="p-3 border-r border-slate-300 last:border-r-0">
                          <textarea
                            rows={2}
                            value={phrase}
                            onChange={(e) => handleAdiThalaPhraseChange(rIdx, cIdx, e.target.value)}
                            className="w-full text-sm font-mono font-medium text-slate-900 bg-slate-50/50 p-2 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500 resize-none"
                            placeholder="Notation..."
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

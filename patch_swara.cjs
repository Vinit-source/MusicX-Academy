const fs = require('fs');
let code = fs.readFileSync('src/components/SwaraEditor.tsx', 'utf8');

// 1. Add abort controller ref
code = code.replace(
  "const midiSoundsRef = useRef<any>(null);",
  "const midiSoundsRef = useRef<any>(null);\n  const abortControllerRef = useRef<AbortController | null>(null);"
);

// 2. Replace Audio Playback handlers
const newHandlers = `
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
    // Support parsing strings without spaces like "srgm" by adding spaces between valid swara chars if needed?
    // Actually, splitting by space is safest if they follow notation. But if they wrote "srgm", let's try splitting by space, if length 1, maybe split by char?
    // Better to just split by space, users can add spaces. Or split by standard regex. Let's just split by whitespace.
    const tokens = text.split(/[\\s]+/).filter(Boolean);
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
`;

code = code.replace(
  /const handlePlayScale = async [\s\S]*?setActiveAudioRow\(null\);\n  };/g,
  newHandlers.trim()
);

// 3. Update Arohanam Play button
code = code.replace(
  /<button[\s\n]*onClick=\{\(\) => handlePlayScale\(data\.arohanam, 'Arohanam'\)\}[\s\n]*className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-2\.5 py-1 rounded-lg transition-all"[\s\n]*>[\s\n]*<Play className="w-3\.5 h-3\.5 fill-current" \/>[\s\n]*<span>Play<\/span>[\s\n]*<\/button>/m,
  `<button
                onClick={() => handlePlayScale(data.arohanam, 'Arohanam')}
                className={\`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all \${
                  activeAudioRow === 'Arohanam' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200'
                }\`}
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
              </button>`
);

// 4. Update Avarohanam Play button
code = code.replace(
  /<button[\s\n]*onClick=\{\(\) => handlePlayScale\(data\.avarohanam, 'Avarohanam'\)\}[\s\n]*className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-2\.5 py-1 rounded-lg transition-all"[\s\n]*>[\s\n]*<Play className="w-3\.5 h-3\.5 fill-current" \/>[\s\n]*<span>Play<\/span>[\s\n]*<\/button>/m,
  `<button
                onClick={() => handlePlayScale(data.avarohanam, 'Avarohanam')}
                className={\`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all \${
                  activeAudioRow === 'Avarohanam' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200'
                }\`}
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
              </button>`
);

// 5. Short phrase cell play buttons
// We want to add a play button inside each Short Phrase cell (input)
code = code.replace(
  /<td key=\{colIdx\} className="p-2 border-r border-slate-200">[\s\n]*<input[\s\n]*type="text"[\s\n]*value=\{row\[colKey\]\}[\s\n]*onChange=\{\(e\) => handleShortPhraseCellChange\(rIdx, colKey, e\.target\.value\)\}[\s\n]*className="w-full text-sm font-mono text-slate-800 bg-transparent px-2 py-1 rounded focus:bg-indigo-50\/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"[\s\n]*placeholder="\.\.\."[\s\n]*\/>[\s\n]*<\/td>/m,
  `<td key={colIdx} className="p-2 border-r border-slate-200 relative group">
                      <input
                        type="text"
                        value={row[colKey]}
                        onChange={(e) => handleShortPhraseCellChange(rIdx, colKey, e.target.value)}
                        className="w-full text-sm font-mono text-slate-800 bg-transparent px-2 py-1 pr-8 rounded focus:bg-indigo-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="..."
                      />
                      {row[colKey] && (
                        <button
                          onClick={() => handlePlayPhraseText(row[colKey] as string, \`phrase-\${rIdx}-\${colIdx}\`)}
                          className={\`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all opacity-0 group-hover:opacity-100 \${
                            activeAudioRow === \`phrase-\${rIdx}-\${colIdx}\`
                              ? 'opacity-100 bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                          }\`}
                          title={activeAudioRow === \`phrase-\${rIdx}-\${colIdx}\` ? "Stop" : "Play Phrase"}
                        >
                          {activeAudioRow === \`phrase-\${rIdx}-\${colIdx}\` ? (
                            <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                          ) : (
                            <Play className="w-3 h-3 fill-current" />
                          )}
                        </button>
                      )}
                    </td>`
);

fs.writeFileSync('src/components/SwaraEditor.tsx', code, 'utf8');

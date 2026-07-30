const fs = require('fs');
let code = fs.readFileSync('src/components/SwaraEditor.tsx', 'utf8');

// 1. Imports
code = code.replace(
  /ArrowLeft,?\s*\} from 'lucide-react';/,
  "ArrowLeft, GripVertical } from 'lucide-react';"
);

// 2. State & Drag handlers
const newHooks = `
  const [draggedPhraseIdx, setDraggedPhraseIdx] = useState<number | null>(null);
  const [draggedThalaIdx, setDraggedThalaIdx] = useState<number | null>(null);

  const handlePlayAllShortPhrases = () => {
    const allTokens: string[] = [];
    data.shortPhrases.forEach(row => {
      if (row.cell1) allTokens.push(...row.cell1.split(/[\\s]+/));
      if (row.cell2) allTokens.push(...row.cell2.split(/[\\s]+/));
      if (row.cell3) allTokens.push(...row.cell3.split(/[\\s]+/));
      if (row.cell4) allTokens.push(...row.cell4.split(/[\\s]+/));
    });
    handlePlayPhraseText(allTokens.join(' '), 'All-Short-Phrases');
  };

  const handlePlayAllAdiThala = () => {
    const allTokens: string[] = [];
    data.adiThalaRows.forEach(row => {
      allTokens.push(...row.phrases.join(' ').split(/[\\s]+/));
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
`;
code = code.replace(/const \[activeAudioIndex, setActiveAudioIndex\] = useState<number \| null>\(null\);/, 
  "const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);\n" + newHooks);


// 3. Replace Add button with Play All in Short Phrases header
code = code.replace(
  /<button[\s\n]*onClick=\{handleAddShortPhraseRow\}[\s\n]*className="flex items-center gap-1 px-3 py-1\.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-all"[\s\n]*>[\s\n]*<Plus className="w-3\.5 h-3\.5" \/>[\s\n]*<span>Add Phrase Row<\/span>[\s\n]*<\/button>/m,
  `<button
            onClick={handlePlayAllShortPhrases}
            className={\`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs \${
              activeAudioRow === 'All-Short-Phrases' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
            }\`}
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
          </button>`
);

// 4. Update Short Phrases Table Row to be draggable and add Add button at bottom
code = code.replace(
  /<tr key=\{rIdx\} className="hover:bg-slate-50\/80 transition-all">/g,
  `<tr key={rIdx} className="hover:bg-slate-50/80 transition-all cursor-move" draggable onDragStart={(e) => handlePhraseDragStart(e, rIdx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handlePhraseDrop(e, rIdx)}>`
);

code = code.replace(
  /<td className="p-2 text-center text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-50">[\s\n]*\{rIdx \+ 1\}[\s\n]*<\/td>/g,
  `<td className="p-2 text-center text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-50 flex items-center justify-center gap-1">
                    <GripVertical className="w-3 h-3 text-slate-400" />
                    {rIdx + 1}
                  </td>`
);

// Add "Add Phrase Row" at the bottom of the table
code = code.replace(
  /<\/tbody>[\s\n]*<\/table>[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*\{\/\* Adi Thala/m,
  `</tbody>
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

      {/* Adi Thala`
);

// 5. Replace Add button with Play All in Adi Thala header
code = code.replace(
  /<button[\s\n]*id="add-thala-row-btn"[\s\n]*onClick=\{handleAddAdiThalaRow\}[\s\n]*className="flex items-center gap-1 px-3 py-1\.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-all shadow-xs"[\s\n]*>[\s\n]*<Plus className="w-3\.5 h-3\.5" \/>[\s\n]*<span>Add Avartanam Row<\/span>[\s\n]*<\/button>/m,
  `<button
            onClick={handlePlayAllAdiThala}
            className={\`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs \${
              activeAudioRow === 'All-Adi-Thala' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
            }\`}
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
          </button>`
);

// 6. Update Adi Thala Table Row to be draggable and add Add button at bottom
code = code.replace(
  /className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs bg-slate-50\/30"[\s\n]*>/g,
  `className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs bg-slate-50/30" draggable onDragStart={(e) => handleThalaDragStart(e, rIdx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleThalaDrop(e, rIdx)}>`
);

code = code.replace(
  /<span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-\[11px\]">[\s\n]*\{rIdx \+ 1\}[\s\n]*<\/span>/g,
  `<GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[11px]">
                      {rIdx + 1}
                    </span>`
);

code = code.replace(
  /<\/div>[\s\n]*\)\;[\s\n]*\}\)[\s\n]*\}[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*\)\;[\s\n]*\}/m,
  `</div>
            );
          })}
        </div>
        <div className="flex justify-center mt-4 pt-4">
          <button
            id="add-thala-row-btn"
            onClick={handleAddAdiThalaRow}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Avartanam Row</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
}`
);

fs.writeFileSync('src/components/SwaraEditor.tsx', code, 'utf8');

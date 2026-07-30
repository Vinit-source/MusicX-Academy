const fs = require('fs');
let code = fs.readFileSync('src/components/SwaraEditor.tsx', 'utf8');

const replacement = `
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
    let tokens = text.trim().split(/[\\s]+/);
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
`;

code = code.replace(/const handlePlayPhraseText = async [\s\S]*?abortControllerRef\.current = null;\n    \}\n  \};/m, replacement.trim());

fs.writeFileSync('src/components/SwaraEditor.tsx', code, 'utf8');

// Carnatic Swara Synthesizer with midi-sounds-react

const MIDI_NOTES: Record<string, number> = {
  s: 60,
  r1: 61,
  r2: 62, g1: 62, r: 62,
  g2: 63, r3: 63,
  g3: 64, g: 64,
  m1: 65, m: 65,
  m2: 66,
  p: 67,
  d1: 68,
  d2: 69, n1: 69, d: 69,
  d3: 70, n2: 70,
  n3: 71, n: 71,
};

/**
 * Parse a swara token like "g3", "m1", "S", "p", "r2", "x"
 */
function parseSwaraToMidi(token: string): { note: number; isExtension: boolean; isRest: boolean; rawToken: string } {
  const clean = token.trim();
  if (!clean) {
    return { note: 0, isExtension: false, isRest: true, rawToken: clean };
  }
  if (clean.toLowerCase() === 'x') {
    return { note: 0, isExtension: true, isRest: false, rawToken: clean };
  }
  if (clean === '-') {
    return { note: 0, isExtension: false, isRest: true, rawToken: clean };
  }

  let isUpper = false;
  let isLower = false;

  // Check if the first character is an uppercase letter (S, R, G, M, P, D, N)
  const firstChar = clean.charAt(0);
  if (firstChar >= 'A' && firstChar <= 'Z') {
    isUpper = true;
  }

  let key = clean.toLowerCase();
  let octaveOffset = 0;

  // Upper octave indicators (' or .)
  if (key.includes("'") || key.includes(".")) {
    isUpper = true;
    key = key.replace(/['.]/g, "");
  }
  
  // Lower octave indicators (,)
  if (key.includes(",")) {
    isLower = true;
    key = key.replace(/,/g, "");
  }

  if (isUpper) octaveOffset = 12;
  if (isLower) octaveOffset = -12;

  const baseNote = MIDI_NOTES[key] || 60; // Default to C4 (Sa)

  return {
    note: baseNote + octaveOffset,
    isExtension: false,
    isRest: false,
    rawToken: clean
  };
}

/**
 * Play a sequence of swara tokens using midi-sounds-react
 */
export async function playSwaraSequence(
  midiSounds: any,
  swaraTokens: string[],
  instrumentId: number,
  onActiveIndex?: (idx: number | null) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!midiSounds) return;

  const baseNoteDuration = 0.45; // seconds per swara
  let lastNote = 0;

  for (let i = 0; i < swaraTokens.length; i++) {
    if (signal?.aborted) {
      if (onActiveIndex) onActiveIndex(null);
      midiSounds.cancelQueue();
      return;
    }

    const token = swaraTokens[i];
    const parsed = parseSwaraToMidi(token);

    // If it's a rest ('-'), wait for its duration. Do not play anything.
    if (parsed.isRest) {
      lastNote = 0; // reset last note so it doesn't carry over
      if (onActiveIndex) onActiveIndex(i);
      await new Promise<void>((resolve) => {
        let timeoutId: any;
        const onAbort = () => { clearTimeout(timeoutId); resolve(); };
        if (signal) signal.addEventListener('abort', onAbort, { once: true });
        timeoutId = setTimeout(() => {
          if (signal) signal.removeEventListener('abort', onAbort);
          resolve();
        }, baseNoteDuration * 1000);
      });
      continue;
    }

    // If it's an extension ('x'), we just wait for its duration.
    // The previous note was already played with the extended duration!
    if (parsed.isExtension && lastNote > 0) {
      if (onActiveIndex) onActiveIndex(i);
      await new Promise<void>((resolve) => {
        let timeoutId: any;
        const onAbort = () => { clearTimeout(timeoutId); resolve(); };
        if (signal) signal.addEventListener('abort', onAbort, { once: true });
        timeoutId = setTimeout(() => {
          if (signal) signal.removeEventListener('abort', onAbort);
          resolve();
        }, baseNoteDuration * 1000);
      });
      continue;
    }

    if (parsed.note > 0) {
      lastNote = parsed.note;
    }

    if (onActiveIndex) onActiveIndex(i);

    // If it's a normal note, calculate its total extended duration
    if (parsed.note > 0) {
      let extensions = 0;
      for (let j = i + 1; j < swaraTokens.length; j++) {
        const nextToken = parseSwaraToMidi(swaraTokens[j]);
        if (nextToken.isExtension) {
          extensions++;
        } else {
          break;
        }
      }

      // Play the note ONCE with the full extended duration
      // 2.5x total means baseNoteDuration + extensions * baseNoteDuration * 1.5
      const totalDuration = baseNoteDuration + (extensions * baseNoteDuration * 1.5);
      midiSounds.playChordNow(instrumentId, [parsed.note], totalDuration);
    }

    // Wait for the duration of THIS specific note slot (1x base duration)
    // The subsequent 'x's will be handled by the loop iterations (which will wait their own base duration).
    await new Promise<void>((resolve) => {
      let timeoutId: any;
      const onAbort = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
      }
      timeoutId = setTimeout(() => {
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        resolve();
      }, baseNoteDuration * 1000);
    });
  }

  if (onActiveIndex) onActiveIndex(null);
}

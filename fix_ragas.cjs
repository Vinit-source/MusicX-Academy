const fs = require('fs');
let code = fs.readFileSync('src/data/sampleRagas.ts', 'utf8');

// 1. Convert all standalone tokens like 'S', 'G3' back to lowercase 's', 'g3'
code = code.replace(/['"]([A-Z]\d?)['"]/g, (match, p1) => {
    return `'${p1.toLowerCase()}'`;
});

// 2. The arohanam array ends with upper Sa. The avarohanam starts with upper Sa.
// We can manually fix the arrays:
code = code.replace(/arohanam: \[([^\]]+)\]/g, (match, p1) => {
    let tokens = p1.split(',').map(s => s.trim().replace(/['"]/g, ''));
    if (tokens[tokens.length - 1] === 's') tokens[tokens.length - 1] = 'S';
    return `arohanam: [${tokens.map(t => `'${t}'`).join(', ')}]`;
});

code = code.replace(/avarohanam: \[([^\]]+)\]/g, (match, p1) => {
    let tokens = p1.split(',').map(s => s.trim().replace(/['"]/g, ''));
    if (tokens[0] === 's') tokens[0] = 'S';
    return `avarohanam: [${tokens.map(t => `'${t}'`).join(', ')}]`;
});

// 3. Any string that has an apostrophe for upper octave: replace the character before the apostrophe with its uppercase version.
// e.g. "g m p n s'" -> "g m p n S"
// e.g. "S G M P M G S" is currently in the file. Wait, in the file, it is: 'S G M P M G S'
// Let's replace any uppercase in shortPhrases or adiThalaRows with uppercase, but only if they are Tara Saptak.
// The image says: "S G M P M G S", and these are Tara Saptak. The user wants capital letters for upper notes everywhere.
// So if the text has "S G M P M G S", that is correct (they are Tara Saptak). 
// Let's just remove apostrophes and ensure upper notes are uppercase, lower notes are lowercase.

// Let's replace anything with apostrophe to uppercase:
code = code.replace(/([a-z]\d?)['.]/g, (match, p1) => {
    return p1.toUpperCase();
});

fs.writeFileSync('src/data/sampleRagas.ts', code, 'utf8');

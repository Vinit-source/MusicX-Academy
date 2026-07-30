const fs = require('fs');
let code = fs.readFileSync('src/data/sampleRagas.ts', 'utf8');

// Replace standard arohanam patterns
code = code.replace(/arohanam: \[([^\]]+)\]/g, (match, p1) => {
    let tokens = p1.split(',').map(s => s.trim().replace(/['"]/g, ''));
    if (tokens[0].toLowerCase() === 's') tokens[0] = 's';
    if (tokens[tokens.length - 1].toLowerCase() === 's') tokens[tokens.length - 1] = "s'";
    return `arohanam: [${tokens.map(t => `'${t}'`).join(', ')}]`;
});

code = code.replace(/avarohanam: \[([^\]]+)\]/g, (match, p1) => {
    let tokens = p1.split(',').map(s => s.trim().replace(/['"]/g, ''));
    if (tokens[0].toLowerCase() === 's') tokens[0] = "s'";
    if (tokens[tokens.length - 1].toLowerCase() === 's') tokens[tokens.length - 1] = "s";
    return `avarohanam: [${tokens.map(t => `'${t}'`).join(', ')}]`;
});

// Also replace 'S' with 's' throughout the file to avoid confusion? No, only specific ones might be S.
// The script above only fixes arohanam/avarohanam. Let's do it for all 'S' -> 's' and "S'" -> "s'".
code = code.replace(/'S'/g, "'s'").replace(/"S"/g, "'s'");
code = code.replace(/'S\''/g, "\"s'\"").replace(/"S'"/g, "\"s'\"");

fs.writeFileSync('src/data/sampleRagas.ts', code, 'utf8');

const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  "dev": "vite",
  "build": "vite build",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit"
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { saveUploadToFirestore }')) {
  code = code.replace(
    /import \{ AlertCircle \} from 'lucide-react';/,
    "import { AlertCircle } from 'lucide-react';\nimport { saveUploadToFirestore } from './lib/firebase';"
  );
  fs.writeFileSync('src/App.tsx', code, 'utf8');
}

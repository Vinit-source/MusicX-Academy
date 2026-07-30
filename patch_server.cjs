const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(err instanceof SyntaxError && err\.status === 400 && 'body' in err\)/,
  "if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err)"
);

code = code.replace(
  /app\.use\(\(err, req, res, next\) => \{/,
  "app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {"
);

fs.writeFileSync('server.ts', code, 'utf8');

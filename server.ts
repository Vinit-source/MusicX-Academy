import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limit for image uploads
  app.use(express.json({ limit: '25mb' }));

  // OCR Endpoint for Carnatic Swara Sheets
  app.post('/api/ocr', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', clientApiKey } = req.body;

      if (!imageBase64) {
        res.status(400).json({ success: false, error: 'No image provided for OCR.' });
        return;
      }

      const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.status(401).json({ success: false, error: 'API_KEY_REQUIRED', message: 'Gemini API key is required.' });
        return;
      }

      // Initialize Gemini AI SDK
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Clean base64 string if data URI prefix is included
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const systemInstruction = `You are an expert Carnatic Music Notation OCR and Musicologist AI.
Your task is to analyze an image of a handwritten or printed Carnatic music swara notation sheet and convert it into a structured JSON representation.

The sheet strictly follows this traditional structure:
1. Raga Name (Title): e.g., "Gambhira natta", "Mohanam", "Hamsadhwani", "Hindolam", "Des"
2. Parent Raga: e.g., "Chala natta No 36", "Harikambhoji No 28", "Sankarabharanam No 29"
3. Remarks / Special Notes (optional): e.g., "A bhashanga raga in which the 'Anya Swara' is Kakali Nishadam (n3)"
4. Arohanam (Ascending scale swaras as an array of strings): e.g., ["S", "g3", "m1", "p", "n3", "S"]
5. Avarohanam (Descending scale swaras as an array of strings): e.g., ["S", "n3", "p", "m1", "g3", "S"]
6. Short Phrases (Grid of short swara phrases, usually 3 rows of 4 columns):
   Each row has cell1, cell2, cell3, cell4.
7. Adi Thala (Two Kalai) Section (Table of notation rows with beat headers):
   - Each row has a 4-element beat header array like ["U", "1", "2", "3"] or ["U", "V", "U", "V"]
   - Each row has a 4-element phrase array containing the swara notation for those 4 beats.
   Note symbols: 'x' represents beat pauses/rests, '-' represents note extensions/kanas, lowercase/uppercase swara letters (s, r, g, m, p, d, n, S, R, G, M, P, D, N) represent octave levels and swara variants.

Be extremely precise with handwritten and printed swara letters, dots, hyphens (-), rests (x), and numbers (like g3, m1, r2, d1, n3).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: 'Extract and digitize the Carnatic swara structure from this sheet into the specified JSON format.',
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ragaName: { type: Type.STRING, description: 'Title of the Raga' },
              parentRaga: { type: Type.STRING, description: 'Parent Raga name and number' },
              remarks: { type: Type.STRING, description: 'Optional special remarks or bhashanga note' },
              arohanam: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Ascending scale swara notes',
              },
              avarohanam: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Descending scale swara notes',
              },
              shortPhrases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    cell1: { type: Type.STRING },
                    cell2: { type: Type.STRING },
                    cell3: { type: Type.STRING },
                    cell4: { type: Type.STRING },
                  },
                  required: ['cell1', 'cell2', 'cell3', 'cell4'],
                },
                description: 'Grid rows of short swara phrases',
              },
              adiThalaRows: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    header: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '4-element array of beat markers e.g. ["U", "1", "2", "3"] or ["U", "V", "U", "V"]',
                    },
                    phrases: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '4-element array of swara notation cells for this avartanam row',
                    },
                  },
                  required: ['header', 'phrases'],
                },
                description: 'Adi Thala Two Kalai rows',
              },
            },
            required: ['ragaName', 'parentRaga', 'arohanam', 'avarohanam', 'shortPhrases', 'adiThalaRows'],
          },
        },
      });

      const jsonText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(jsonText);

      // Add client IDs to adiThalaRows if missing
      if (Array.isArray(parsedData.adiThalaRows)) {
        parsedData.adiThalaRows = parsedData.adiThalaRows.map((row: any, idx: number) => ({
          id: `ocr-row-${idx}-${Date.now()}`,
          header: Array.isArray(row.header) && row.header.length === 4 ? row.header : ['U', '1', '2', '3'],
          phrases: Array.isArray(row.phrases) && row.phrases.length === 4 ? row.phrases : ['', '', '', ''],
        }));
      }

      parsedData.id = `digitized-${Date.now()}`;
      parsedData.createdDate = new Date().toISOString().split('T')[0];

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('OCR Processing Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to process image OCR.',
      });
    }
  });

  // Vite Middleware for dev mode / Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Carnatic Swara Digitizer server running on http://localhost:${PORT}`);
  });
}

startServer();

# Carnatic Raga Swara Editor

A beautiful, interactive web application for Carnatic music enthusiasts, students, and teachers to notate, visualize, and listen to Raga swaras and Adi Thala (Two Kalai) patterns. 

## Features
- **Visual Swara Notation**: Clean grid layouts for Sancharas (short phrases) and 4-beat structural Avartanams.
- **Audio Synthesizer**: Built-in playback engine that understands standard Carnatic swara letters (`s`, `r1`, `r2`, `g3`, etc.), Tara Saptak caps (`S`, `R2`), and extensions (`x`) vs rests (`-`).
- **Drag & Drop**: Easily rearrange phrases and Thala rows to compose larger swara patterns.
- **Exporting**: Download notations as PDF or Excel spreadsheets, or copy to clipboard for quick sharing.
- **Library**: Built-in reference ragas like Gambhira Natta, Mohanam, Hamsadhwani, Hindolam, and Des.

## How to Use This Website

### 1. Notation Rules
The application's playback engine understands standard Carnatic notation:
- **Lower Case** (Madhya Saptak): `s, r1, r2, g2, g3, m1, m2, p, d1, d2, n2, n3`
- **Upper Case** (Tara Saptak): `S, R1, R2, G3` etc. for upper octave notes.
- **Extensions**: Use `x` to extend the duration of the previous note. The engine will intelligently hold the note without restriking it!
- **Pauses/Rests**: Use `-` to denote a silent rest or gap. No note will play during this beat.
- **Spacing**: Keep spaces between swaras when typing phrases (e.g. `s r2 g3 m1 p`). If you pack them together (`sr2g3`), the engine will still try to parse it automatically!

### 2. Sancharas (Short Phrases)
- Add typical characteristic phrases of a raga in the 4-column grid.
- Use the **Play All** button at the top to listen to all phrases sequentially.
- Hover over any individual cell to play just that phrase.
- Drag the `⋮⋮` grip handle to reorder rows.
- Click **Add Phrase Row** at the bottom to add more blocks.

### 3. Adi Thala (Two Kalai)
- Structured in a 4-beat column layout with beat markers (`U, 1, 2, 3` or `U, V, U, V`).
- Use the text inputs to write swaras that align with the beats of the Thala.
- Drag the `⋮⋮` grip handle next to the row number to shuffle the avartanams.
- Press the **Play All** button above the Thala block to play all avartanams sequentially.

### 4. Customizing Raga Metadata
Click on the Raga title (e.g., "Mohanam") to edit the details such as Parent Raga and Remarks to personalize your sheets.

## Contributing

We welcome contributions from the Carnatic music community and open-source developers!

### Getting Started
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the local development server.

### Contribution Guidelines
- **Raga Data**: You can contribute new preset ragas by adding to `src/data/sampleRagas.ts`. Ensure they follow the `SwaraStructure` typing.
- **Synthesizer Engine**: Enhancements to `parseSwaraToMidi` in `audioSynth.ts` are welcome (e.g., handling Mandra Saptak or Gamakas).
- **UI Tweaks**: We use Tailwind CSS. Please keep the minimal, clean, indigo/slate aesthetic consistent.
- **Pull Requests**: Submit a PR with a clear description of your feature or bug fix. Ensure `npm run lint` passes.

## License
MIT License. Feel free to use and distribute.

export interface SwaraPhraseRow {
  cell1: string;
  cell2: string;
  cell3: string;
  cell4: string;
}

export interface AdiThalaRow {
  id: string;
  header: [string, string, string, string]; // Beat markers: e.g. ["U", "1", "2", "3"] or ["U", "V", "U", "V"]
  phrases: [string, string, string, string]; // Notation cells
}

export interface SwaraStructure {
  id: string;
  ragaName: string;
  parentRaga: string;
  remarks?: string;
  arohanam: string[];
  avarohanam: string[];
  shortPhrases: SwaraPhraseRow[];
  adiThalaRows: AdiThalaRow[];
  rawOcrText?: string;
  createdDate?: string;
  confidence?: number;
}

export interface OCRResponse {
  success: boolean;
  data?: SwaraStructure;
  error?: string;
}

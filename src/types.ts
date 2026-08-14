export interface OfficerInfo {
  cargoPosto: string;
  rg: string;
  nome: string;
  rawText: string;
}

export interface Inscricao {
  id: string;
  orderIndex: number;
  timestamp: string; // e.g. "14/08/2026 15:34:40"
  timestampParsed: number; // epoch ms
  email: string;
  dataCapacitacao: string; // e.g. "18/08/2026"
  chefeSecaoRaw: string;
  chefeSecaoParsed: OfficerInfo;
  policial1Raw: string;
  policial1Parsed: OfficerInfo;
  policial2Raw: string;
  policial2Parsed: OfficerInfo;
  telefone: string;
  telefonesList: string[];
  comandoIntermediario: string; // e.g. "1° CPA", "2 CPA"
  opm: string; // e.g. "5° BPM"
  totalEfetivo: number;
}

export interface FilterState {
  search: string;
  dataSelected: string;
  cpaSelected: string;
  opmSelected: string;
  sortBy: 'timestamp' | 'sheet' | 'data' | 'opm' | 'cpa' | 'totalEfetivo';
  sortOrder: 'asc' | 'desc';
}

export interface StatSummary {
  totalInscricoes: number;
  totalEfetivo: number;
  totalOpms: number;
  cpasCount: number;
  porData: { [data: string]: number };
  porCpa: { [cpa: string]: number };
}

import { Inscricao, OfficerInfo } from '../types';

/**
 * Parses raw text containing Posto/Graduação, RG, and Name into a structured object.
 */
export function parseOfficerInfo(raw: string): OfficerInfo {
  const trimmed = (raw || '').trim().replace(/[\t]+/g, ' ');
  if (!trimmed) {
    return { cargoPosto: '', rg: '', nome: '', rawText: '' };
  }

  // Regex patterns to detect Posto/Graduação and RG
  // Matches: (MAJ|CAP|TEN|SUBTEN|ST|SGT|CB|SD|MAJOR|CAPITÃO|SARGENTO|CABO|SOLDADO) ... RG ...
  const rgPattern = /(?:RG[:\s]*|RG\.\s*|RG\s+)([\d\.\-]+)/i;
  const rgMatch = trimmed.match(rgPattern);
  const rg = rgMatch ? rgMatch[1].trim() : '';

  // Extract Cargo/Posto at the beginning
  const cargoMatch = trimmed.match(/^([123]?[º⁰°]?\s*(?:MAJ|MAJOR|CAP|CAPIT[ÃA]O|TEN|TENENTE|SUBTEN|SUBTENENTE|ST|SGT|SGTP|SARGENTO|CB|CABO|SD|SOLDADO)(?:\s*PM)?)/i);
  let cargoPosto = cargoMatch ? cargoMatch[1].trim() : '';

  let nome = trimmed;
  if (rgMatch) {
    // Name is usually after the RG match
    const rgIndex = trimmed.indexOf(rgMatch[0]);
    nome = trimmed.substring(rgIndex + rgMatch[0].length).trim();
  } else if (cargoMatch) {
    nome = trimmed.substring(cargoMatch[0].length).trim();
  }

  // Clean extra punctuation
  nome = nome.replace(/^[:\-–\s]+/, '').trim();

  // If nome ended up empty but raw text had content
  if (!nome && trimmed) {
    nome = trimmed;
  }

  return {
    cargoPosto,
    rg,
    nome,
    rawText: trimmed,
  };
}

/**
 * Standardizes CPA names (e.g. "2 CPA" -> "2° CPA")
 */
export function normalizeCpa(cpa: string): string {
  const trimmed = (cpa || '').trim();
  if (!trimmed) return 'Não Informado';
  if (/^(\d+)\s*CPA$/i.test(trimmed)) {
    return trimmed.replace(/^(\d+)\s*CPA$/i, '$1° CPA');
  }
  return trimmed;
}

/**
 * Extracts phones and creates clean contact links
 */
export function parsePhoneNumbers(phoneStr: string): string[] {
  if (!phoneStr) return [];
  // Split by '-', '/', '&', 'e', or comma if separating multiple numbers
  const splitPhones = phoneStr.split(/[-–\/,;]|\s+e\s+|\s+ou\s+/i);
  const results: string[] = [];

  for (const part of splitPhones) {
    const cleaned = part.replace(/\D/g, '');
    if (cleaned.length >= 8) {
      results.push(cleaned);
    }
  }

  // If splitting broke up a formatted number like (21) 99152-4681
  const fullCleaned = phoneStr.replace(/\D/g, '');
  if (results.length === 0 && fullCleaned.length >= 8) {
    results.push(fullCleaned);
  }

  return results;
}

/**
 * Parses Brazilian date string "DD/MM/YYYY HH:mm:ss" or "DD/MM/YYYY" into epoch milliseconds for accurate sorting
 */
export function parseDateTimestamp(ts: string): number {
  if (!ts) return 0;
  const trimmed = ts.trim();
  const parts = trimmed.split(' ');
  const dateParts = (parts[0] || '').split('/');
  if (dateParts.length === 3) {
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    let year = parseInt(dateParts[2], 10);
    if (year < 100) year += 2000;

    let hour = 0;
    let min = 0;
    let sec = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(':');
      hour = parseInt(timeParts[0] || '0', 10);
      min = parseInt(timeParts[1] || '0', 10);
      sec = parseInt(timeParts[2] || '0', 10);
    }
    const d = new Date(year, month, day, hour, min, sec);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }
  return 0;
}

/**
 * Format phone string for visual display
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * Parse CSV text accounting for quotes and commas
 */
export function parseCsv(csvText: string): Inscricao[] {
  if (!csvText || typeof csvText !== 'string') return [];

  // Normalize line breaks
  const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if (char === '\n' && !insideQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length <= 1) return [];

  // Parse header line to determine column indices if order differs
  const parseRow = (rowText: string): string[] => {
    const values: string[] = [];
    let currentVal = '';
    let inQuote = false;

    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"') {
        if (inQuote && rowText[i + 1] === '"') {
          currentVal += '"';
          i++; // skip escaped quote
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());
    return values;
  };

  const headerRow = parseRow(lines[0]);
  const headerMap: { [key: string]: number } = {};

  headerRow.forEach((col, idx) => {
    const clean = col.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean.includes('carimbo') || clean.includes('data/hora') || clean.includes('timestamp')) {
      headerMap['timestamp'] = idx;
    } else if (clean.includes('mail') || clean.includes('e-mail') || clean.includes('email')) {
      headerMap['email'] = idx;
    } else if (clean.includes('data') && !clean.includes('carimbo')) {
      headerMap['datas'] = idx;
    } else if (clean.includes('chefe') || clean.includes('oficial')) {
      headerMap['chefe'] = idx;
    } else if (clean.includes('1') && clean.includes('policial')) {
      headerMap['policial1'] = idx;
    } else if (clean.includes('2') && clean.includes('policial')) {
      headerMap['policial2'] = idx;
    } else if (clean.includes('telefone') || clean.includes('contato')) {
      headerMap['telefone'] = idx;
    } else if (clean.includes('comando') || clean.includes('intermediario') || clean.includes('cpa')) {
      headerMap['comando'] = idx;
    } else if (clean.includes('opm') || clean.includes('unidade') || clean.includes('bpm')) {
      headerMap['opm'] = idx;
    }
  });

  const inscricoes: Inscricao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length < 3) continue;

    const timestamp = values[headerMap['timestamp'] ?? 0] || '';
    const email = values[headerMap['email'] ?? 1] || '';
    const dataCapacitacao = values[headerMap['datas'] ?? 2] || '';
    const chefeSecaoRaw = values[headerMap['chefe'] ?? 3] || '';
    const policial1Raw = values[headerMap['policial1'] ?? 4] || '';
    const policial2Raw = values[headerMap['policial2'] ?? 5] || '';
    const telefone = values[headerMap['telefone'] ?? 6] || '';
    const comandoIntermediarioRaw = values[headerMap['comando'] ?? 7] || '';
    const opm = values[headerMap['opm'] ?? 8] || '';

    const chefeSecaoParsed = parseOfficerInfo(chefeSecaoRaw);
    const policial1Parsed = parseOfficerInfo(policial1Raw);
    const policial2Parsed = parseOfficerInfo(policial2Raw);

    let totalEfetivo = 0;
    if (chefeSecaoRaw.trim()) totalEfetivo++;
    if (policial1Raw.trim()) totalEfetivo++;
    if (policial2Raw.trim()) totalEfetivo++;

    const comandoIntermediario = normalizeCpa(comandoIntermediarioRaw);
    const telefonesList = parsePhoneNumbers(telefone);
    const timestampParsed = parseDateTimestamp(timestamp);

    inscricoes.push({
      id: `insc-${i}-${opm.replace(/\s+/g, '-')}`,
      orderIndex: i,
      timestamp,
      timestampParsed,
      email,
      dataCapacitacao,
      chefeSecaoRaw,
      chefeSecaoParsed,
      policial1Raw,
      policial1Parsed,
      policial2Raw,
      policial2Parsed,
      telefone,
      telefonesList,
      comandoIntermediario,
      opm,
      totalEfetivo,
    });
  }

  return inscricoes;
}

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inscricao } from '../types';
import { formatPhone } from './csvParser';

export const exportInscricoesToPdf = (
  inscricoes: Inscricao[],
  filterInfo?: { dataSelected?: string; cpaSelected?: string; opmSelected?: string; searchTerm?: string }
) => {
  // Use landscape orientation for clear tabular reporting
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalEfetivo = inscricoes.reduce((sum, item) => sum + item.totalEfetivo, 0);

  // Top header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 842, 56, 'F');

  // Blue accent line under header
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 56, 842, 3, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'RELATÓRIO DE INSCRIÇÕES - CICLO DE CAPACITAÇÕES (ISP-RJ)',
    30,
    28
  );

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(191, 219, 254); // blue-200
  doc.text(
    `Gerado em: ${formattedDate} às ${formattedTime} | Efetivo Total Inscrito: ${totalEfetivo} policiais`,
    30,
    44
  );

  // Filter notes if any filter is active
  let startY = 72;
  const activeFilters: string[] = [];
  if (filterInfo?.dataSelected) activeFilters.push(`Data: ${filterInfo.dataSelected}`);
  if (filterInfo?.cpaSelected) activeFilters.push(`Comando/CPA: ${filterInfo.cpaSelected}`);
  if (filterInfo?.opmSelected) activeFilters.push(`OPM: ${filterInfo.opmSelected}`);
  if (filterInfo?.searchTerm) activeFilters.push(`Busca: "${filterInfo.searchTerm}"`);

  if (activeFilters.length > 0) {
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont('helvetica', 'bold');
    doc.text(`Filtros Ativos: `, 30, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(activeFilters.join('  |  '), 95, startY);
    startY += 14;
  }

  // Build table data
  const head = [[
    '#',
    'Data',
    'Comando',
    'OPM',
    'Chefe da 3ª Seção',
    '1° Policial',
    '2° Policial',
    'Telefone(s)',
    'E-mail',
  ]];

  const body = inscricoes.map((item, index) => {
    // Format Chefe
    const chefeText = [
      item.chefeSecaoParsed.cargoPosto,
      item.chefeSecaoParsed.rg ? `RG ${item.chefeSecaoParsed.rg}` : '',
      item.chefeSecaoParsed.nome || item.chefeSecaoRaw,
    ].filter(Boolean).join(' ');

    // Format Policial 1
    const p1Text = item.policial1Raw
      ? [
          item.policial1Parsed.cargoPosto,
          item.policial1Parsed.rg ? `RG ${item.policial1Parsed.rg}` : '',
          item.policial1Parsed.nome || item.policial1Raw,
        ].filter(Boolean).join(' ')
      : '-';

    // Format Policial 2
    const p2Text = item.policial2Raw
      ? [
          item.policial2Parsed.cargoPosto,
          item.policial2Parsed.rg ? `RG ${item.policial2Parsed.rg}` : '',
          item.policial2Parsed.nome || item.policial2Raw,
        ].filter(Boolean).join(' ')
      : '-';

    const formattedPhones = item.telefonesList.map(t => formatPhone(t)).join('\n') || formatPhone(item.telefone);

    return [
      (index + 1).toString(),
      item.dataCapacitacao,
      item.comandoIntermediario,
      item.opm,
      chefeText,
      p1Text,
      p2Text,
      formattedPhones,
      item.email,
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY,
    margin: { left: 24, right: 24, bottom: 30 },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59], // slate-800
      lineColor: [203, 213, 225], // slate-300
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' }, // #
      1: { cellWidth: 46, halign: 'center', fontStyle: 'bold' }, // Data
      2: { cellWidth: 50, halign: 'center' }, // Comando
      3: { cellWidth: 60, fontStyle: 'bold' }, // OPM
      4: { cellWidth: 155 }, // Chefe
      5: { cellWidth: 140 }, // 1° Policial
      6: { cellWidth: 140 }, // 2° Policial
      7: { cellWidth: 70, halign: 'center' }, // Telefone
      8: { cellWidth: 110 }, // Email
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount} — Relatório de Gestão Operacional`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 12
      );
    },
  });

  // Save the PDF file directly to triggers standard browser download
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`relatorio_inscricoes_isp_${dateStr}.pdf`);
};

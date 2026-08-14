import React, { useState, useEffect, useMemo } from 'react';
import { Inscricao, FilterState, StatSummary } from './types';
import { GOOGLE_SHEET_CSV_URL, FALLBACK_CSV_DATA } from './data/sampleData';
import { parseCsv, parseDateTimestamp } from './utils/csvParser';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FiltersBar } from './components/FiltersBar';
import { InscricoesTable } from './components/InscricoesTable';
import { InscricoesCards } from './components/InscricoesCards';
import { InscricaoModal } from './components/InscricaoModal';
import { PrintReport } from './components/PrintReport';
import { Footer } from './components/Footer';
import { exportInscricoesToPdf } from './utils/pdfExport';
import { AlertCircle, CheckCircle2, FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function App() {
  const [rawCsv, setRawCsv] = useState<string>(FALLBACK_CSV_DATA);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>(() => parseCsv(FALLBACK_CSV_DATA));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Selected item for modal
  const [selectedInscricao, setSelectedInscricao] = useState<Inscricao | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // View mode: 'table' or 'cards' (responsive default)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter state - Default to chronological submission timestamp ascending (matches spreadsheet order)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dataSelected: '',
    cpaSelected: '',
    opmSelected: '',
    sortBy: 'timestamp',
    sortOrder: 'asc',
  });

  // Fetch live CSV from Google Sheet
  const fetchLiveData = async (isManual = false) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Add timestamp cache buster to prevent stale response
      const timestamp = new Date().getTime();
      const response = await fetch(`${GOOGLE_SHEET_CSV_URL}&_t=${timestamp}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta da planilha: status ${response.status}`);
      }

      const text = await response.text();
      if (text && text.length > 50 && text.includes(',')) {
        setRawCsv(text);
        const parsed = parseCsv(text);
        setInscricoes(parsed);
        setLastUpdated(new Date());
        if (isManual) {
          showToast(`${parsed.length} inscrições sincronizadas com sucesso!`);
        }
      } else {
        throw new Error('Conteúdo da planilha retornou vazio ou inválido.');
      }
    } catch (err: any) {
      console.warn('Live fetch falhou, utilizando dados base da planilha:', err);
      // Ensure fallback data is active
      const parsed = parseCsv(rawCsv || FALLBACK_CSV_DATA);
      setInscricoes(parsed);
      setErrorMsg(
        'Não foi possível atualizar em tempo real via rede. Exibindo a versão salva da planilha.'
      );
      if (isManual) {
        showToast('Utilizando os dados mais recentes salvos.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData(false);
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Compute available filter options
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    inscricoes.forEach((i) => {
      if (i.dataCapacitacao) dates.add(i.dataCapacitacao);
    });
    return Array.from(dates).sort((a, b) => parseDateTimestamp(a) - parseDateTimestamp(b));
  }, [inscricoes]);

  const availableCpas = useMemo(() => {
    const cpas = new Set<string>();
    inscricoes.forEach((i) => {
      if (i.comandoIntermediario) cpas.add(i.comandoIntermediario);
    });
    return Array.from(cpas).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [inscricoes]);

  const availableOpms = useMemo(() => {
    const opms = new Set<string>();
    inscricoes.forEach((i) => {
      if (i.opm) opms.add(i.opm);
    });
    return Array.from(opms).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [inscricoes]);

  // Compute filtered & sorted list
  const filteredInscricoes = useMemo(() => {
    return inscricoes
      .filter((item) => {
        // Search filter
        if (filters.search) {
          const q = filters.search.toLowerCase().trim();
          const matches =
            item.opm.toLowerCase().includes(q) ||
            item.comandoIntermediario.toLowerCase().includes(q) ||
            item.dataCapacitacao.toLowerCase().includes(q) ||
            item.timestamp.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            item.telefone.toLowerCase().includes(q) ||
            item.chefeSecaoRaw.toLowerCase().includes(q) ||
            item.chefeSecaoParsed.nome.toLowerCase().includes(q) ||
            item.chefeSecaoParsed.rg.toLowerCase().includes(q) ||
            item.chefeSecaoParsed.cargoPosto.toLowerCase().includes(q) ||
            item.policial1Raw.toLowerCase().includes(q) ||
            item.policial1Parsed.nome.toLowerCase().includes(q) ||
            item.policial1Parsed.rg.toLowerCase().includes(q) ||
            item.policial2Raw.toLowerCase().includes(q) ||
            item.policial2Parsed.nome.toLowerCase().includes(q) ||
            item.policial2Parsed.rg.toLowerCase().includes(q);

          if (!matches) return false;
        }

        // Data filter
        if (filters.dataSelected && item.dataCapacitacao !== filters.dataSelected) {
          return false;
        }

        // CPA filter
        if (filters.cpaSelected && item.comandoIntermediario !== filters.cpaSelected) {
          return false;
        }

        // OPM filter
        if (filters.opmSelected && item.opm !== filters.opmSelected) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filters.sortBy === 'timestamp' || filters.sortBy === 'sheet') {
          const timeA = a.timestampParsed || parseDateTimestamp(a.timestamp);
          const timeB = b.timestampParsed || parseDateTimestamp(b.timestamp);
          comp = timeA - timeB;
          if (comp === 0) comp = a.orderIndex - b.orderIndex;
        } else if (filters.sortBy === 'data') {
          const dateA = parseDateTimestamp(a.dataCapacitacao);
          const dateB = parseDateTimestamp(b.dataCapacitacao);
          comp = dateA - dateB;
          if (comp === 0) comp = a.opm.localeCompare(b.opm, undefined, { numeric: true });
        } else if (filters.sortBy === 'cpa') {
          comp = a.comandoIntermediario.localeCompare(b.comandoIntermediario, undefined, { numeric: true });
          if (comp === 0) comp = a.opm.localeCompare(b.opm, undefined, { numeric: true });
        } else if (filters.sortBy === 'opm') {
          comp = a.opm.localeCompare(b.opm, undefined, { numeric: true });
        } else if (filters.sortBy === 'totalEfetivo') {
          comp = a.totalEfetivo - b.totalEfetivo;
        }

        return filters.sortOrder === 'asc' ? comp : -comp;
      });
  }, [inscricoes, filters]);

  // Overall stats
  const stats: StatSummary = useMemo(() => {
    let totalEfetivo = 0;
    const opms = new Set<string>();
    const cpas = new Set<string>();
    const porData: { [data: string]: number } = {};
    const porCpa: { [cpa: string]: number } = {};

    inscricoes.forEach((i) => {
      totalEfetivo += i.totalEfetivo;
      if (i.opm) opms.add(i.opm);
      if (i.comandoIntermediario) {
        cpas.add(i.comandoIntermediario);
        porCpa[i.comandoIntermediario] = (porCpa[i.comandoIntermediario] || 0) + 1;
      }
      if (i.dataCapacitacao) {
        porData[i.dataCapacitacao] = (porData[i.dataCapacitacao] || 0) + 1;
      }
    });

    return {
      totalInscricoes: inscricoes.length,
      totalEfetivo,
      totalOpms: opms.size,
      cpasCount: cpas.size,
      porData,
      porCpa,
    };
  }, [inscricoes]);

  // Filter updates
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      dataSelected: '',
      cpaSelected: '',
      opmSelected: '',
      sortBy: 'timestamp',
      sortOrder: 'asc',
    });
  };

  // Toggle sort from column headers
  const handleHeaderSort = (column: FilterState['sortBy']) => {
    setFilters((prev) => {
      if (prev.sortBy === column) {
        return { ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' };
      }
      return { ...prev, sortBy: column, sortOrder: 'asc' };
    });
  };

  // Copy registration summary for quick dispatch
  const handleCopyInfo = (inscricao: Inscricao) => {
    const text = `📋 *INSCRIÇÃO CICLO ISP-RJ - PM3*
🏛️ *OPM:* ${inscricao.opm} (${inscricao.comandoIntermediario})
📅 *Data da Capacitação:* ${inscricao.dataCapacitacao}
👮 *Chefe da 3ª Seção:* ${inscricao.chefeSecaoRaw}
👮 *1° Policial:* ${inscricao.policial1Raw || 'Não informado'}
👮 *2° Policial:* ${inscricao.policial2Raw || 'Não informado'}
📞 *Telefone:* ${inscricao.telefone}
✉️ *E-mail:* ${inscricao.email}
⏰ *Registrado em:* ${inscricao.timestamp}`;

    navigator.clipboard.writeText(text);
    setCopiedId(inscricao.id);
    showToast(`Dados do ${inscricao.opm} copiados para a área de transferência!`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Export filtered items to PDF directly downloading the document
  const handleExportPdf = () => {
    try {
      exportInscricoesToPdf(filteredInscricoes, {
        dataSelected: filters.dataSelected,
        cpaSelected: filters.cpaSelected,
        opmSelected: filters.opmSelected,
        searchTerm: filters.searchTerm,
      });
      showToast(`Relatório PDF com ${filteredInscricoes.length} registros exportado com sucesso!`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      // Fallback to window.print if needed
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Interactive Web View (Hidden when printing) */}
      <div className="print:hidden">
        
        {/* Header */}
        <Header
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          onRefresh={() => fetchLiveData(true)}
          totalRecords={inscricoes.length}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Toast Notification */}
          {successToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-medium">{successToast}</span>
            </div>
          )}

          {/* Warning banner if live sync is offline */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => fetchLiveData(true)}
                className="font-semibold text-amber-900 underline hover:no-underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Key Metrics Overview */}
          <StatsOverview
            stats={stats}
            selectedDate={filters.dataSelected}
            onSelectDate={(d) => handleFilterChange({ dataSelected: d })}
          />

          {/* Filters & Actions Bar */}
          <FiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableDates={availableDates}
            availableCpas={availableCpas}
            availableOpms={availableOpms}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExportPdf={handleExportPdf}
            filteredCount={filteredInscricoes.length}
            totalCount={inscricoes.length}
          />

          {/* Main Visualizer: Table on desktop / Cards view */}
          {viewMode === 'table' ? (
            <div className="space-y-4">
              {/* Responsive indicator for small screens */}
              <div className="lg:hidden bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>Dica: Arraste a tabela lateralmente ou alterne para a visualização em <strong>Cartões</strong>.</span>
                <button
                  onClick={() => setViewMode('cards')}
                  className="px-2.5 py-1 rounded bg-blue-900 text-white font-semibold text-[11px] cursor-pointer"
                >
                  Ver Cartões
                </button>
              </div>

              <InscricoesTable
                inscricoes={filteredInscricoes}
                onSelectInscricao={(i) => setSelectedInscricao(i)}
                copiedId={copiedId}
                onCopyInfo={handleCopyInfo}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onHeaderSort={handleHeaderSort}
              />
            </div>
          ) : (
            <InscricoesCards
              inscricoes={filteredInscricoes}
              onSelectInscricao={(i) => setSelectedInscricao(i)}
              copiedId={copiedId}
              onCopyInfo={handleCopyInfo}
            />
          )}

        </main>
      </div>

      {/* Printable Report Component (Shows only on Ctrl+P or Imprimir) */}
      <PrintReport
        inscricoes={filteredInscricoes}
        totalEfetivo={filteredInscricoes.reduce((acc, curr) => acc + curr.totalEfetivo, 0)}
      />

      {/* Modal for full registration record */}
      <InscricaoModal
        inscricao={selectedInscricao}
        onClose={() => setSelectedInscricao(null)}
        onCopyInfo={handleCopyInfo}
        isCopied={copiedId === selectedInscricao?.id}
      />

      {/* Footer */}
      <div className="print:hidden">
        <Footer />
      </div>

    </div>
  );
}

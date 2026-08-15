import React, { useState, useMemo } from 'react';
import { Inscricao } from '../types';
import { EXPECTED_UNITS, ExpectedUnit } from '../data/expectedUnits';
import { CheckCircle2, AlertTriangle, XCircle, Search, Shield, ChevronDown, ChevronUp, Copy, Check, Filter } from 'lucide-react';

interface UnitStatusSummaryProps {
  inscricoes: Inscricao[];
  onSelectUnit: (opmName: string) => void;
  onSelectInscricao: (inscricao: Inscricao) => void;
}

export interface UnitStatusItem {
  expected: ExpectedUnit;
  status: 'responded' | 'duplicate' | 'pending';
  submissions: Inscricao[];
  submissionCount: number;
}

/**
 * Normalizes OPM string strictly based on the OPM column
 * e.g. "36º BPM" -> "36° BPM", "6° CPA" -> "6° CPA", "2 CIPM" -> "2° CIPM"
 */
export const normalizeUnitCode = (str: string): string => {
  if (!str) return '';
  const clean = str.trim().toUpperCase().replace(/[ºª]/g, '°');
  const numFirst = clean.match(/(\d+)\s*°?\s*(BPM|CIPM|CPA|UPP)/i);
  if (numFirst) {
    return `${parseInt(numFirst[1], 10)}° ${numFirst[2].toUpperCase()}`;
  }
  const typeFirst = clean.match(/(BPM|CIPM|CPA|UPP)\s*(\d+)/i);
  if (typeFirst) {
    return `${parseInt(typeFirst[2], 10)}° ${typeFirst[1].toUpperCase()}`;
  }
  return clean.replace(/\s+/g, ' ');
};

export const UnitStatusSummary: React.FC<UnitStatusSummaryProps> = ({
  inscricoes,
  onSelectUnit,
  onSelectInscricao,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'duplicate' | 'responded'>('all');
  const [selectedCpa, setSelectedCpa] = useState<string>('');
  const [unitSearch, setUnitSearch] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);

  // Exact matching computed strictly by OPM column
  const unitStatuses = useMemo(() => {
    const list: UnitStatusItem[] = EXPECTED_UNITS.map((exp) => {
      const expNorm = normalizeUnitCode(exp.opm);

      // Exact match on OPM column
      const matches = inscricoes.filter((ins) => {
        const insOpmNorm = normalizeUnitCode(ins.opm);
        return insOpmNorm === expNorm;
      });

      const count = matches.length;
      let status: 'responded' | 'duplicate' | 'pending' = 'pending';
      if (count === 1) status = 'responded';
      else if (count > 1) status = 'duplicate';

      return {
        expected: exp,
        status,
        submissions: matches,
        submissionCount: count,
      };
    });

    // Check if there are any submissions with OPM not in the standard 50 expected list
    const expectedNorms = new Set(EXPECTED_UNITS.map((e) => normalizeUnitCode(e.opm)));
    const extraMap = new Map<string, Inscricao[]>();

    inscricoes.forEach((ins) => {
      const insNorm = normalizeUnitCode(ins.opm);
      if (!expectedNorms.has(insNorm)) {
        const key = ins.opm.trim() || 'Não Informado';
        if (!extraMap.has(key)) extraMap.set(key, []);
        extraMap.get(key)!.push(ins);
      }
    });

    extraMap.forEach((subs, opmKey) => {
      const count = subs.length;
      list.push({
        expected: {
          opm: opmKey,
          cpa: subs[0]?.comandoIntermediario || 'Outros',
        },
        status: count > 1 ? 'duplicate' : 'responded',
        submissions: subs,
        submissionCount: count,
      });
    });

    return list;
  }, [inscricoes]);

  // Overall counters
  const totalExpected = EXPECTED_UNITS.length;
  const respondedCount = unitStatuses.filter((u) => u.status === 'responded').length;
  const duplicateCount = unitStatuses.filter((u) => u.status === 'duplicate').length;
  const pendingCount = unitStatuses.filter((u) => u.status === 'pending').length;
  const totalCovered = respondedCount + duplicateCount;
  const percentage = Math.round((totalCovered / totalExpected) * 100) || 0;

  // Filtered units
  const filteredList = useMemo(() => {
    return unitStatuses.filter((item) => {
      if (filterTab === 'pending' && item.status !== 'pending') return false;
      if (filterTab === 'duplicate' && item.status !== 'duplicate') return false;
      if (filterTab === 'responded' && item.status !== 'responded') return false;

      if (selectedCpa && item.expected.cpa !== selectedCpa) return false;

      if (unitSearch) {
        const q = unitSearch.toLowerCase();
        const opmMatch = item.expected.opm.toLowerCase().includes(q);
        const cpaMatch = item.expected.cpa.toLowerCase().includes(q);
        const officerMatch = item.submissions.some((s) =>
          s.chefeSecaoRaw.toLowerCase().includes(q) || s.policial1Raw.toLowerCase().includes(q)
        );
        if (!opmMatch && !cpaMatch && !officerMatch) return false;
      }

      return true;
    });
  }, [unitStatuses, filterTab, selectedCpa, unitSearch]);

  // Copy pending list for WhatsApp broadcast
  const handleCopyPending = () => {
    const pendings = unitStatuses
      .filter((u) => u.status === 'pending')
      .map((u) => `• ${u.expected.opm} (${u.expected.cpa})`)
      .join('\n');

    const text = `🚨 *PMERJ - EMG/PM-3*\n📋 *RELAÇÃO DE UNIDADES PENDENTES DE INSCRIÇÃO*\n*Ciclo de Capacitações ISP-RJ*\n\nTotal de Pendentes: ${pendingCount} de ${totalExpected} Unidades\n\n${pendings}\n\n_Atualizado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}_`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all">
      {/* Top Banner / Accordion Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Quadro de Acompanhamento de Unidades
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                {totalCovered}/{totalExpected} Convocadas ({percentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Auditoria em tempo real das respostas enviadas pelas OPMs no formulário
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {pendingCount > 0 && (
            <button
              onClick={handleCopyPending}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar lista de pendentes formatada para WhatsApp"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copiado!' : 'Copiar Pendentes'}</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isOpen ? 'Recolher Quadro' : 'Expandir Quadro'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5">
          {/* Progress Bar & Status Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {/* Todas */}
            <button
              onClick={() => setFilterTab('all')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[11px] font-medium opacity-80">Todas Convocadas</div>
              <div className="text-xl font-extrabold mt-0.5">{totalExpected}</div>
              <div className="text-[10px] opacity-70">1° CPA ao 8° CPA</div>
            </button>

            {/* Respondidas */}
            <button
              onClick={() => setFilterTab('responded')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                filterTab === 'responded'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">Respondidas (1x)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold mt-0.5 text-emerald-700">{respondedCount}</div>
              <div className="text-[10px] text-emerald-700">Formulário OK</div>
            </button>

            {/* Duplicadas */}
            <button
              onClick={() => setFilterTab('duplicate')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                filterTab === 'duplicate'
                  ? 'bg-blue-800 text-white border-blue-800 shadow-sm'
                  : 'bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">Múltiplos Envios</span>
                <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-extrabold mt-0.5 text-blue-800">{duplicateCount}</div>
              <div className="text-[10px] text-blue-700">Respondidas ≥ 2 vezes</div>
            </button>

            {/* Pendentes */}
            <button
              onClick={() => setFilterTab('pending')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                  : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">Pendentes</span>
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl font-extrabold mt-0.5 text-rose-700">{pendingCount}</div>
              <div className="text-[10px] text-rose-700">Ainda não enviaram</div>
            </button>
          </div>

          {/* Progress Visual Bar */}
          <div className="mb-4 bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (respondedCount / totalExpected) * 100)}%` }}
              title={`Respondidas: ${respondedCount}`}
            />
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (duplicateCount / totalExpected) * 100)}%` }}
              title={`Múltiplos Envios: ${duplicateCount}`}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar unidade no quadro (ex: 36° BPM, 6° CPA)..."
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCpa}
                onChange={(e) => setSelectedCpa(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="">Todos os CPAs</option>
                {['1° CPA', '2° CPA', '3° CPA', '4° CPA', '5° CPA', '6° CPA', '7° CPA', '8° CPA'].map((cpa) => (
                  <option key={cpa} value={cpa}>{cpa}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of Unit Badges / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
            {filteredList.map((item, idx) => {
              const isPending = item.status === 'pending';
              const isDuplicate = item.status === 'duplicate';
              const isResponded = item.status === 'responded';

              return (
                <div
                  key={`${item.expected.opm}-${idx}`}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isPending
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                      : isDuplicate
                      ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                      : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">{item.expected.opm}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {item.expected.cpa}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="mt-1 flex items-center gap-1 text-[11px]">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                            <XCircle className="w-3 h-3 text-rose-600" /> Pendente
                          </span>
                        )}

                        {isResponded && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 1 Resposta OK
                          </span>
                        )}

                        {isDuplicate && (
                          <span className="inline-flex items-center gap-1 text-blue-800 font-bold">
                            <AlertTriangle className="w-3 h-3 text-blue-600" /> {item.submissionCount}x Envios
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action button if has response */}
                    {item.submissions.length > 0 && (
                      <button
                        onClick={() => onSelectUnit(item.expected.opm)}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 text-[10px] font-semibold transition-colors cursor-pointer"
                        title="Ver respostas na tabela"
                      >
                        Filtrar
                      </button>
                    )}
                  </div>

                  {/* Submissions details if present */}
                  {item.submissions.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 space-y-1">
                      {item.submissions.map((sub, sIdx) => (
                        <div
                          key={sub.id}
                          onClick={() => onSelectInscricao(sub)}
                          className="text-[10px] text-slate-600 flex items-center justify-between hover:text-blue-900 cursor-pointer p-0.5 rounded hover:bg-white/80"
                          title="Clique para ver ficha completa"
                        >
                          <span className="truncate max-w-[150px]">
                            {sIdx + 1}. {sub.chefeSecaoParsed.cargoPosto} {sub.chefeSecaoParsed.nome || sub.chefeSecaoRaw}
                          </span>
                          <span className="font-mono text-slate-400 text-[9px] flex-shrink-0 ml-1">
                            {sub.timestamp ? sub.timestamp.split(' ')[0] : sub.dataCapacitacao}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredList.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              Nenhuma unidade encontrada com os filtros selecionados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

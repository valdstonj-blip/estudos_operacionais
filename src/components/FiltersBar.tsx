import React from 'react';
import { Search, Filter, X, Table, LayoutGrid, FileDown, ArrowUpDown } from 'lucide-react';
import { FilterState } from '../types';

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableDates: string[];
  availableCpas: string[];
  availableOpms: string[];
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  onExportPdf: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableDates,
  availableCpas,
  availableOpms,
  viewMode,
  onViewModeChange,
  onExportPdf,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters = Boolean(
    filters.search || filters.dataSelected || filters.cpaSelected || filters.opmSelected
  );

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm shadow-slate-200/50 mb-6 space-y-3.5">
      
      {/* Top row: Search input + View Mode Switcher + Export PDF Button */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Search input with high contrast clear icon */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-blue-600" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar por policial, RG, OPM, CPA, telefone, e-mail..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          
          {/* View Mode Buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Visualizar em Tabela"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Visualizar em Cartões"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cartões</span>
            </button>
          </div>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            title="Exportar dados filtrados em formato PDF / Imprimir"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white rounded-lg text-xs font-semibold border border-blue-800 shadow-sm shadow-blue-950/20 transition-all cursor-pointer active:scale-95"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-300" />
            <span>Exportar PDF</span>
          </button>

        </div>
      </div>

      {/* Bottom row: Filter Dropdowns (Data, CPA, OPM, Ordenação) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
        
        {/* Data Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Data da Capacitação
          </label>
          <select
            value={filters.dataSelected}
            onChange={(e) => onFilterChange({ dataSelected: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          >
            <option value="">Todas as Datas</option>
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* CPA Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Comando Intermediário (CPA)
          </label>
          <select
            value={filters.cpaSelected}
            onChange={(e) => onFilterChange({ cpaSelected: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          >
            <option value="">Todos os CPAs</option>
            {availableCpas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* OPM Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Unidade (OPM / BPM)
          </label>
          <select
            value={filters.opmSelected}
            onChange={(e) => onFilterChange({ opmSelected: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          >
            <option value="">Todas as OPMs</option>
            {availableOpms.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Order by */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Ordenar Por
          </label>
          <div className="flex items-center gap-1">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            >
              <option value="data">Data de Capacitação</option>
              <option value="cpa">Comando (CPA)</option>
              <option value="opm">OPM / Unidade</option>
              <option value="timestamp">Ordem de Inscrição</option>
              <option value="totalEfetivo">Qtd. Efetivo</option>
            </select>
            <button
              onClick={() => onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
              title={`Ordem: ${filters.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Filter status and quick reset */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          Mostrando <strong className="text-slate-800 font-semibold">{filteredCount}</strong> de <strong className="text-slate-800 font-semibold">{totalCount}</strong> inscrições
          {hasActiveFilters && <span className="text-blue-700 font-medium"> (Filtros ativos)</span>}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Limpar todos os filtros
          </button>
        )}
      </div>

    </div>
  );
};

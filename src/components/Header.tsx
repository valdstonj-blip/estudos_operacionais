import React from 'react';
import { RefreshCw, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { GOOGLE_SHEET_CSV_URL } from '../data/sampleData';

interface HeaderProps {
  isLoading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  isLoading,
  lastUpdated,
  onRefresh,
  totalRecords,
}) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl border-b-2 border-blue-600/40 relative overflow-hidden">
      {/* Background glow effects with navy tones */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Main Title & Tag */}
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2.5 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 tracking-wider uppercase shadow-sm">
                EMG-PM/3
              </span>
              <span className="inline-flex items-center text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                {totalRecords} inscrições carregadas
              </span>
            </div>
            
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
              Inscrições para ciclo de capacitações do Instituto de Segurança Pública (ISP-RJ)
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
              <span>Painel de Visualização</span>
            </p>
          </div>

          {/* Right Action & Sync Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 md:pt-0 border-t border-slate-800 md:border-t-0 flex-shrink-0">
            <div className="text-left md:text-right">
              <div className="text-[11px] text-slate-300 flex items-center md:justify-end gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>Atualizado:</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {lastUpdated ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Carregando...'}
              </div>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Recarregar dados da planilha Google"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-500/40 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-blue-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <a
              href={GOOGLE_SHEET_CSV_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir planilha Google (origem CSV)"
              className="inline-flex items-center space-x-1 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Planilha</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-600/40 flex items-center justify-center text-blue-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-slate-200 font-semibold tracking-wide">
                Núcleo de Estudos Operacionais - DevFiel26
              </p>
              <p className="text-[11px] text-slate-400">
                Painel de Controle e Gestão Operacional
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="text-slate-400 font-medium">
              &copy; {currentYear} &bull; Ferramenta de Apoio Interno
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/40 text-blue-300 font-mono text-[10px]">
              v1.26
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};

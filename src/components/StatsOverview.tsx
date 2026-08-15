import React from 'react';
import { Users, Calendar, Building, ShieldCheck } from 'lucide-react';
import { StatSummary } from '../types';

interface StatsOverviewProps {
  stats: StatSummary;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  selectedDate,
  onSelectDate,
}) => {
  const dates = Object.keys(stats.porData).sort();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Total Inscrições */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-sm shadow-slate-200/50 hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inscrições</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalInscricoes}
          </span>
          <span className="text-xs text-slate-500 font-medium">respostas na planilha</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Formulários enviados
        </p>
      </div>

      {/* Total Efetivo Policial */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-sm shadow-slate-200/50 hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Efetivo Inscrito</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalEfetivo}
          </span>
          <span className="text-xs text-slate-500 font-medium">policiais militares</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Chefes de P3 e agentes indicados
        </p>
      </div>

      {/* Comandos / CPAs Cobertos */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-sm shadow-slate-200/50 hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comandos (CPAs)</span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.cpasCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">CPAs representados</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          1° ao 8° CPA com inscrições
        </p>
      </div>

      {/* Distribuição por Datas com Clique Rápido */}
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-md shadow-blue-950/20 border border-blue-800/60 flex flex-col justify-between col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            Vagas por Data
          </span>
          {selectedDate && (
            <button
              onClick={() => onSelectDate('')}
              className="text-[10px] text-blue-300 hover:text-white underline cursor-pointer"
            >
              Ver todas
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {dates.map((data) => {
            const count = stats.porData[data] || 0;
            const isSelected = selectedDate === data;
            const shortDate = data.slice(0, 5); // "18/08"
            return (
              <button
                key={data}
                onClick={() => onSelectDate(isSelected ? '' : data)}
                className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/50 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border-slate-700/80'
                }`}
                title={`Filtrar data ${data}`}
              >
                <div className="text-[11px] font-medium leading-tight">{shortDate}</div>
                <div className="text-xs sm:text-sm font-bold text-blue-300 mt-0.5">{count} <span className="text-[9px] font-normal text-slate-300">inscrições</span></div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

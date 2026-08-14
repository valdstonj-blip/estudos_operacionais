import React from 'react';
import { Inscricao } from '../types';
import { formatPhone } from '../utils/csvParser';

interface PrintReportProps {
  inscricoes: Inscricao[];
  totalEfetivo: number;
}

export const PrintReport: React.FC<PrintReportProps> = ({ inscricoes, totalEfetivo }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="hidden print:block p-4 font-sans text-black text-xs leading-tight">
      {/* Official Header */}
      <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="border-2 border-black px-3 py-1 text-center font-bold">
            <div className="text-[10px]">RELATÓRIO</div>
            <div className="text-base font-black">ISP-RJ</div>
          </div>
          <div>
            <h1 className="text-base font-bold uppercase tracking-tight">
              Inscrições para ciclo de capacitações do Instituto de Segurança Pública (ISP-RJ)
            </h1>
            <p className="text-[11px] font-semibold text-gray-700">
              RELATÓRIO OPERACIONAL DE INSCRIÇÕES
            </p>
          </div>
        </div>

        <div className="text-right text-[10px]">
          <div><strong>Emissão:</strong> {currentDate}</div>
          <div><strong>Efetivo Total:</strong> {totalEfetivo} Policiais</div>
        </div>
      </div>

      {/* Table for print */}
      <table className="w-full border-collapse border border-gray-400 text-[10px]">
        <thead>
          <tr className="bg-gray-200 text-black font-bold uppercase border-b border-gray-400">
            <th className="border border-gray-400 p-1.5 text-center w-8">#</th>
            <th className="border border-gray-400 p-1.5 text-center">Data</th>
            <th className="border border-gray-400 p-1.5 text-center">CPA</th>
            <th className="border border-gray-400 p-1.5 text-left">OPM</th>
            <th className="border border-gray-400 p-1.5 text-left">Chefe 3ª Seção</th>
            <th className="border border-gray-400 p-1.5 text-left">1° Policial</th>
            <th className="border border-gray-400 p-1.5 text-left">2° Policial</th>
            <th className="border border-gray-400 p-1.5 text-left">Telefone</th>
            <th className="border border-gray-400 p-1.5 text-left">E-mail</th>
          </tr>
        </thead>
        <tbody>
          {inscricoes.map((item, idx) => (
            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 p-1 text-center font-bold">{idx + 1}</td>
              <td className="border border-gray-300 p-1 text-center font-bold whitespace-nowrap">{item.dataCapacitacao}</td>
              <td className="border border-gray-300 p-1 text-center whitespace-nowrap">{item.comandoIntermediario}</td>
              <td className="border border-gray-300 p-1 font-bold">{item.opm}</td>
              <td className="border border-gray-300 p-1">
                {item.chefeSecaoParsed.cargoPosto && <strong>{item.chefeSecaoParsed.cargoPosto} </strong>}
                {item.chefeSecaoParsed.rg && <span className="font-mono">RG {item.chefeSecaoParsed.rg} </span>}
                {item.chefeSecaoParsed.nome || item.chefeSecaoRaw}
              </td>
              <td className="border border-gray-300 p-1">
                {item.policial1Parsed.cargoPosto && <strong>{item.policial1Parsed.cargoPosto} </strong>}
                {item.policial1Parsed.rg && <span className="font-mono">RG {item.policial1Parsed.rg} </span>}
                {item.policial1Parsed.nome || item.policial1Raw || '-'}
              </td>
              <td className="border border-gray-300 p-1">
                {item.policial2Parsed.cargoPosto && <strong>{item.policial2Parsed.cargoPosto} </strong>}
                {item.policial2Parsed.rg && <span className="font-mono">RG {item.policial2Parsed.rg} </span>}
                {item.policial2Parsed.nome || item.policial2Raw || '-'}
              </td>
              <td className="border border-gray-300 p-1 whitespace-nowrap">{formatPhone(item.telefone)}</td>
              <td className="border border-gray-300 p-1">{item.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature and Official Footer */}
      <div className="mt-8 pt-4 border-t border-black flex justify-between items-end text-[10px]">
        <div>
          <p className="font-bold text-gray-900">Núcleo de Estudos Operacionais - DevFiel26</p>
          <p className="text-gray-600">Ciclo de Capacitações &bull; Instituto de Segurança Pública (ISP-RJ)</p>
        </div>
        <div className="text-center w-64 border-t border-gray-400 pt-1">
          <p className="font-bold">Responsável / Gestor</p>
          <p className="text-[9px] text-gray-500">Assinatura / Matrícula</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Inscricao } from '../types';
import { Phone, Mail, User, Eye, Copy, Check, MessageSquare } from 'lucide-react';
import { formatPhone } from '../utils/csvParser';

interface InscricoesTableProps {
  inscricoes: Inscricao[];
  onSelectInscricao: (inscricao: Inscricao) => void;
  copiedId: string | null;
  onCopyInfo: (inscricao: Inscricao) => void;
}

export const InscricoesTable: React.FC<InscricoesTableProps> = ({
  inscricoes,
  onSelectInscricao,
  copiedId,
  onCopyInfo,
}) => {
  if (inscricoes.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Nenhuma inscrição encontrada</h3>
        <p className="text-xs text-slate-500 mt-1">Tente ajustar seus termos de busca ou filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
      {/* Scroll container with vertical max-height and horizontal scroll */}
      <div className="overflow-x-auto overflow-y-auto max-h-[620px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800 shadow-sm">
              <th className="py-3 px-3.5 whitespace-nowrap bg-slate-900">Data</th>
              <th className="py-3 px-3.5 whitespace-nowrap bg-slate-900">CPA / OPM</th>
              <th className="py-3 px-3.5 min-w-[200px] bg-slate-900">Chefe da 3ª Seção</th>
              <th className="py-3 px-3.5 min-w-[180px] bg-slate-900">1° Policial</th>
              <th className="py-3 px-3.5 min-w-[180px] bg-slate-900">2° Policial</th>
              <th className="py-3 px-3.5 min-w-[150px] bg-slate-900">Contatos</th>
              <th className="py-3 px-3.5 text-center whitespace-nowrap bg-slate-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {inscricoes.map((item, index) => {
              const dateColor =
                item.dataCapacitacao.includes('18')
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : item.dataCapacitacao.includes('19')
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200';

              const firstPhone = item.telefonesList[0] || '';
              const whatsappLink = firstPhone ? `https://wa.me/55${firstPhone}` : null;
              const isCopied = copiedId === item.id;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  {/* Data Capacitação */}
                  <td className="py-3 px-3.5 align-top whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold border ${dateColor}`}>
                      {item.dataCapacitacao}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      {item.timestamp.split(' ')[0]}
                    </div>
                  </td>

                  {/* CPA / OPM */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="font-bold text-slate-900 text-sm">{item.opm}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.comandoIntermediario}
                    </span>
                  </td>

                  {/* Chefe 3ª Seção */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="flex items-start gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                      <div>
                        {item.chefeSecaoParsed.cargoPosto && (
                          <span className="font-bold text-blue-900 mr-1 text-[11px]">
                            {item.chefeSecaoParsed.cargoPosto}
                          </span>
                        )}
                        {item.chefeSecaoParsed.rg && (
                          <span className="text-slate-500 font-mono text-[10px] mr-1">
                            RG {item.chefeSecaoParsed.rg}
                          </span>
                        )}
                        <div className="font-medium text-slate-900 leading-snug">
                          {item.chefeSecaoParsed.nome || item.chefeSecaoRaw}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 1° Policial */}
                  <td className="py-3 px-3.5 align-top">
                    {item.policial1Raw ? (
                      <div className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                        <div>
                          {item.policial1Parsed.cargoPosto && (
                            <span className="font-semibold text-slate-700 mr-1 text-[11px]">
                              {item.policial1Parsed.cargoPosto}
                            </span>
                          )}
                          {item.policial1Parsed.rg && (
                            <span className="text-slate-500 font-mono text-[10px] mr-1">
                              RG {item.policial1Parsed.rg}
                            </span>
                          )}
                          <div className="text-slate-800 leading-snug">
                            {item.policial1Parsed.nome || item.policial1Raw}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Não informado</span>
                    )}
                  </td>

                  {/* 2° Policial */}
                  <td className="py-3 px-3.5 align-top">
                    {item.policial2Raw ? (
                      <div className="flex items-start gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                        <div>
                          {item.policial2Parsed.cargoPosto && (
                            <span className="font-semibold text-slate-700 mr-1 text-[11px]">
                              {item.policial2Parsed.cargoPosto}
                            </span>
                          )}
                          {item.policial2Parsed.rg && (
                            <span className="text-slate-500 font-mono text-[10px] mr-1">
                              RG {item.policial2Parsed.rg}
                            </span>
                          )}
                          <div className="text-slate-800 leading-snug">
                            {item.policial2Parsed.nome || item.policial2Raw}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Não informado</span>
                    )}
                  </td>

                  {/* Contatos */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="space-y-1">
                      {item.telefone && (
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Phone className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="text-[11px] truncate max-w-[130px]" title={item.telefone}>
                            {formatPhone(item.telefone)}
                          </span>
                        </div>
                      )}
                      
                      {item.email && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <a
                            href={`mailto:${item.email}`}
                            className="text-[11px] text-blue-700 hover:underline truncate max-w-[130px]"
                            title={item.email}
                          >
                            {item.email}
                          </a>
                        </div>
                      )}

                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline pt-0.5"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="py-3 px-3.5 align-top text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onSelectInscricao(item)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 border border-blue-200 transition-all cursor-pointer"
                        title="Ver Ficha Completa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onCopyInfo(item)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                        }`}
                        title="Copiar Resumo da Inscrição"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { Inscricao } from '../types';
import { Phone, Mail, User, Eye, Copy, Check, MessageSquare, Shield, Calendar, Building } from 'lucide-react';
import { formatPhone } from '../utils/csvParser';

interface InscricoesCardsProps {
  inscricoes: Inscricao[];
  onSelectInscricao: (inscricao: Inscricao) => void;
  copiedId: string | null;
  onCopyInfo: (inscricao: Inscricao) => void;
}

export const InscricoesCards: React.FC<InscricoesCardsProps> = ({
  inscricoes,
  onSelectInscricao,
  copiedId,
  onCopyInfo,
}) => {
  if (inscricoes.length === 0) {
    return (
      <div className="bg-white rounded-xl p-10 text-center border border-slate-200 shadow-sm">
        <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">Nenhum registro encontrado</h3>
        <p className="text-xs text-slate-500 mt-1">Ajuste os filtros de busca para visualizar os dados.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100/60 rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
      {/* Scroll container with matching max-height and custom scrollbars */}
      <div className="overflow-y-auto max-h-[620px] p-3.5 sm:p-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inscricoes.map((item) => {
        const dateColor =
          item.dataCapacitacao.includes('18')
            ? 'bg-blue-600 text-white'
            : item.dataCapacitacao.includes('19')
            ? 'bg-indigo-600 text-white'
            : 'bg-emerald-600 text-white';

        const firstPhone = item.telefonesList[0] || '';
        const whatsappLink = firstPhone ? `https://wa.me/55${firstPhone}` : null;
        const isCopied = copiedId === item.id;

        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200/90 shadow-sm shadow-slate-200/50 hover:shadow-md hover:border-blue-300 transition-all p-4 flex flex-col justify-between"
          >
            {/* Top Card Header: OPM, CPA and Date */}
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-950 text-white flex flex-col items-center justify-center font-bold text-xs border border-blue-800 shadow-sm">
                    <Building className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
                    <span>OPM</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {item.opm}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-block text-[11px] font-semibold text-blue-700">
                        {item.comandoIntermediario}
                      </span>
                      {item.timestamp && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          • Envio: {item.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-xs ${dateColor}`}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.dataCapacitacao}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Efetivo: <strong className="text-slate-700">{item.totalEfetivo}</strong>
                  </div>
                </div>
              </div>

              {/* Roster: Chefe da 3ª Seção + Policiais */}
              <div className="mt-3.5 space-y-2.5">
                {/* Chefe */}
                <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                  <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">
                    Chefe da 3ª Seção
                  </div>
                  <div className="text-xs font-medium text-slate-900">
                    {item.chefeSecaoParsed.cargoPosto && (
                      <span className="font-bold text-blue-900 mr-1">
                        {item.chefeSecaoParsed.cargoPosto}
                      </span>
                    )}
                    {item.chefeSecaoParsed.rg && (
                      <span className="text-slate-500 font-mono text-[10px] mr-1">
                        RG {item.chefeSecaoParsed.rg}
                      </span>
                    )}
                    <span>{item.chefeSecaoParsed.nome || item.chefeSecaoRaw}</span>
                  </div>
                </div>

                {/* Policial 1 */}
                <div className="bg-white rounded-lg p-2 border border-slate-100 text-xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    1° Policial
                  </div>
                  <div className="text-slate-800">
                    {item.policial1Raw ? (
                      <>
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
                        <span>{item.policial1Parsed.nome || item.policial1Raw}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Não informado</span>
                    )}
                  </div>
                </div>

                {/* Policial 2 */}
                <div className="bg-white rounded-lg p-2 border border-slate-100 text-xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    2° Policial
                  </div>
                  <div className="text-slate-800">
                    {item.policial2Raw ? (
                      <>
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
                        <span>{item.policial2Parsed.nome || item.policial2Raw}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Não informado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                {item.telefone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <a
                        href={`tel:${firstPhone}`}
                        className="font-medium text-slate-900 hover:text-blue-700"
                      >
                        {formatPhone(item.telefone)}
                      </a>
                    </div>

                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold border border-emerald-200"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>Zap</span>
                      </a>
                    )}
                  </div>
                )}

                {item.email && (
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <a
                      href={`mailto:${item.email}`}
                      className="text-[11px] text-blue-700 hover:underline truncate"
                    >
                      {item.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectInscricao(item)}
                className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Ficha Completa</span>
              </button>

              <button
                onClick={() => onCopyInfo(item)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                  isCopied
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
                title="Copiar dados"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">{isCopied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

          </div>
        );
      })}
        </div>
      </div>
    </div>
  );
};

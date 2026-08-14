import React from 'react';
import { Inscricao } from '../types';
import { X, Building2, Calendar, Clock, User, Phone, Mail, MessageSquare, Copy, Check, Printer, Shield } from 'lucide-react';
import { formatPhone } from '../utils/csvParser';

interface InscricaoModalProps {
  inscricao: Inscricao | null;
  onClose: () => void;
  onCopyInfo: (inscricao: Inscricao) => void;
  isCopied: boolean;
}

export const InscricaoModal: React.FC<InscricaoModalProps> = ({
  inscricao,
  onClose,
  onCopyInfo,
  isCopied,
}) => {
  if (!inscricao) return null;

  const firstPhone = inscricao.telefonesList[0] || '';
  const whatsappLink = firstPhone ? `https://wa.me/55${firstPhone}` : null;

  const handlePrintModal = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white font-black text-sm shadow-inner">
                PM3
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                  Ficha de Inscrição Oficial
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  {inscricao.opm}
                </h2>
                <p className="text-xs text-blue-200 font-medium">
                  {inscricao.comandoIntermediario} &bull; Instituto de Segurança Pública (ISP-RJ)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Top Key Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                Data da Capacitação
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {inscricao.dataCapacitacao}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                Carimbo / Registro
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {inscricao.timestamp}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-600" />
                Efetivo Inscrito
              </div>
              <div className="text-sm font-bold text-blue-900 mt-1">
                {inscricao.totalEfetivo} policiais indicados
              </div>
            </div>
          </div>

          {/* Detailed Nomina / Efetivo Breakdown */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-700" />
              Efetivo Indicado da 3ª Seção
            </h3>

            <div className="space-y-2.5">
              {/* Chefe */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-white uppercase tracking-wider">
                  Oficial Chefe da 3ª Seção (P3)
                </span>
                <div className="text-sm font-bold text-slate-900 mt-1.5">
                  {inscricao.chefeSecaoParsed.cargoPosto && (
                    <span className="text-blue-900 mr-1.5 font-extrabold">
                      {inscricao.chefeSecaoParsed.cargoPosto}
                    </span>
                  )}
                  {inscricao.chefeSecaoParsed.rg && (
                    <span className="text-slate-600 font-mono text-xs mr-2">
                      RG {inscricao.chefeSecaoParsed.rg}
                    </span>
                  )}
                  <span>{inscricao.chefeSecaoParsed.nome || inscricao.chefeSecaoRaw}</span>
                </div>
                {inscricao.chefeSecaoRaw !== inscricao.chefeSecaoParsed.nome && (
                  <div className="text-[11px] text-slate-500 mt-1 italic">
                    Texto original: "{inscricao.chefeSecaoRaw}"
                  </div>
                )}
              </div>

              {/* 1° Policial */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 uppercase tracking-wider">
                  1° Policial da 3ª Seção
                </span>
                <div className="text-sm font-semibold text-slate-900 mt-1.5">
                  {inscricao.policial1Raw ? (
                    <>
                      {inscricao.policial1Parsed.cargoPosto && (
                        <span className="text-slate-800 mr-1.5 font-bold">
                          {inscricao.policial1Parsed.cargoPosto}
                        </span>
                      )}
                      {inscricao.policial1Parsed.rg && (
                        <span className="text-slate-500 font-mono text-xs mr-2">
                          RG {inscricao.policial1Parsed.rg}
                        </span>
                      )}
                      <span>{inscricao.policial1Parsed.nome || inscricao.policial1Raw}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic font-normal">Não informado no formulário</span>
                  )}
                </div>
              </div>

              {/* 2° Policial */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 uppercase tracking-wider">
                  2° Policial da 3ª Seção
                </span>
                <div className="text-sm font-semibold text-slate-900 mt-1.5">
                  {inscricao.policial2Raw ? (
                    <>
                      {inscricao.policial2Parsed.cargoPosto && (
                        <span className="text-slate-800 mr-1.5 font-bold">
                          {inscricao.policial2Parsed.cargoPosto}
                        </span>
                      )}
                      {inscricao.policial2Parsed.rg && (
                        <span className="text-slate-500 font-mono text-xs mr-2">
                          RG {inscricao.policial2Parsed.rg}
                        </span>
                      )}
                      <span>{inscricao.policial2Parsed.nome || inscricao.policial2Raw}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic font-normal">Não informado no formulário</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-700" />
              Contatos e Canais de Comunicação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Telefone Informado</div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {inscricao.telefone ? formatPhone(inscricao.telefone) : 'Não informado'}
                </div>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Iniciar Conversa no WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">E-mail Cadastrado</div>
                <div className="text-sm font-bold text-slate-900 mt-1 truncate" title={inscricao.email}>
                  {inscricao.email || 'Não informado'}
                </div>
                {inscricao.email && (
                  <a
                    href={`mailto:${inscricao.email}`}
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Enviar E-mail</span>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Núcleo de Estudos Operacionais - DevFiel26
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onCopyInfo(inscricao)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Dados Copiados!' : 'Copiar Resumo'}</span>
            </button>

            <button
              onClick={handlePrintModal}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

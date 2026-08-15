# EMG-PM/3 — Painel de Visualização das Inscrições (Ciclo de Capacitações ISP-RJ)

Aplicação web moderna e responsiva para acompanhamento em tempo real das inscrições das Unidades Policiais Militares (OPMs e CPAs) para o ciclo de capacitações do Instituto de Segurança Pública (ISP-RJ).

---

## 🚀 Funcionalidades

- **Sincronização em Tempo Real**: Conexão direta com a planilha do Google Forms via CSV público.
- **Quadro de Auditoria de Unidades**: Rastreamento em tempo real das 50 unidades convocadas (Respondidas 1x, Múltiplos Envios ≥2x e Pendentes), com botão de cópia formatada para WhatsApp.
- **Ordenação Cronológica**: Exibição ordenada pelo Carimbo de Data/Hora de envio, idêntica à ordem da planilha original.
- **Visões Alternadas**: Tabela Operacional completa e Modo Cartões, ambas com altura controlada e rolagem interna suave.
- **Filtros Avançados**: Filtre instantaneamente por Data de Capacitação, CPA, OPM ou busca livre por nome, RG e telefone.
- **Exportação e Relatórios**: Download de PDF formatado para impressão oficial (com coluna de carimbo e contagem sequencial) e visualização de impressão nativa A4.
- **Integração WhatsApp**: Abertura direta de conversa no WhatsApp dos pontos de contato das 3ª Seções.

---

## 📖 Documentação e Engenharia

- **[DOCUMENTACAO.md](./DOCUMENTACAO.md)**: Manual técnico e operacional detalhado com fluxos, regras de negócio e estrutura do projeto.
- **[PROMPT.md](./PROMPT.md)**: Prompt mestre de engenharia de software e design system para reprodução em novos projetos e outros modelos de IA.

---

## 🛠️ Tecnologias Utilizadas

- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **jsPDF & jsPDF-AutoTable**
- **Vite**

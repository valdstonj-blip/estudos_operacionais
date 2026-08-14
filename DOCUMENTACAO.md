# Documentação Técnica e Operacional

## Painel de Visualização — Inscrições Ciclo de Capacitações ISP-RJ
**Gestão e Coordenação**: EMG-PM/3 (Polícia Militar do Estado do Rio de Janeiro)  
**Finalidade**: Centralização, consolidação e acompanhamento operacional em tempo real das inscrições das Unidades Policiais Militares (OPMs e CPAs) para o ciclo de capacitações do Instituto de Segurança Pública (ISP-RJ).

---

## 1. Visão Geral do Sistema

O sistema foi desenvolvido como uma Single Page Application (SPA) moderna, responsiva e de alta performance construída em **React 18 + TypeScript + Tailwind CSS**, otimizada para visualização rápida no ambiente de trabalho operacional e móvel.

### Principais Recursos
1. **Sincronização em Tempo Real com o Google Sheets**: Consumo direto via link CSV publicado da planilha do Google Forms/Sheets, garantindo que novas respostas enviadas pelas OPMs entrem no painel imediatamente ao clicar em *Atualizar Dados* ou a cada ciclo de polling.
2. **Ordenação Cronológica e Espelhada**: Exibição ordenada por padrão pelo **Carimbo de data/hora (Envio)**, permitindo que a tabela reflita fielmente a sequência de preenchimento da planilha (com os registros mais recentes ao final).
3. **Múltiplas Visões Padronizadas**:
   - **Tabela Operacional**: Cabeçalhos fixos (*sticky*), colunas redimensionadas, numeração sequencial, ordenação interativa por clique em coluna e barra de rolagem suave com altura controlada (`max-h-[620px]`).
   - **Modo Cartões**: Visualização em cards responsivos para dispositivos móveis ou telas panorâmicas, padronizada com o mesmo limite de altura e scroll da tabela.
4. **Filtros Dinâmicos**:
   - Busca global textual (filtra por OPM, CPA, nome do militar, RG, e-mail, telefone, carimbo, etc.).
   - Filtro por Data de Capacitação (18/08, 19/08, 20/08).
   - Filtro por Comando Intermediário (1° CPA a 8° CPA).
   - Filtro por OPM.
5. **Relatórios e Exportação**:
   - Exportação em **PDF profissional** (via `jspdf` e `jspdf-autotable`) com coluna de `#`, `Envio (Carimbo)` em ordem sequencial (1 a N), `Data de Capacitação`, cabeçalho PMERJ/EMG-PM/3, data/hora de emissão e quantitativo total de efetivo.
   - Visão de Impressão Direta otimizada para papel A4 em modo paisagem.
   - Botão de cópia rápida formatada para compartilhamento via WhatsApp e despacho.

---

## 2. Arquitetura e Fluxo de Dados

```
[ Google Forms / Respostas ]
              │
              ▼
[ Google Sheets (Planilha Publicada em CSV) ]
              │
              ▼ (Fetch direto / CORS Proxy / Fallback Integrado)
[ csvParser.ts (Sanitização e Parsing Inteligente) ]
              │
              ├─ Separação de Posto/Graduação, RG e Nome
              ├─ Normalização de CPA e OPM
              ├─ Extração de Telefones e Link WhatsApp
              ├─ Conversão de Carimbo em Epoch para Ordenação
              │
              ▼
[ Estado Global da Aplicação (App.tsx) ]
  ├── Filtros e Ordenação (FiltersBar.tsx)
  ├── Cards de Indicadores (StatsOverview.tsx)
  ├── Tabela Operacional (InscricoesTable.tsx)
  ├── Cartões de OPMs (InscricoesCards.tsx)
  ├── Ficha Detalhada / Modal (InscricaoModal.tsx)
  └── Exportadores (pdfExport.ts / PrintReport.tsx)
```

---

## 3. Estrutura de Arquivos

```
/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Cabeçalho EMG-PM/3, status de sincronização e ações
│   │   ├── StatsOverview.tsx    # Cards de indicadores (Total Inscrições, Efetivo, Distribuição por Data)
│   │   ├── FiltersBar.tsx       # Barra de busca textual, seletores de CPA/Data/OPM e ordenação
│   │   ├── InscricoesTable.tsx  # Tabela detalhada com scroll fixo e ordenação interativa
│   │   ├── InscricoesCards.tsx  # Grid de cartões padronizado com scroll de mesma altura
│   │   ├── InscricaoModal.tsx   # Modal com a ficha completa e contatos da OPM
│   │   ├── PrintReport.tsx      # Componente de relatório de impressão nativa A4
│   │   └── GoogleSyncModal.tsx  # Modal com instruções de sincronização e link da planilha
│   ├── data/
│   │   └── sampleData.ts        # URL do Google Sheets e fallback resiliente offline
│   ├── utils/
│   │   ├── csvParser.ts         # Parser de CSV com regex de patentes e parsing de data
│   │   └── pdfExport.ts         # Geração de PDF vetorial formatado
│   ├── types.ts                 # Interfaces TypeScript do modelo de dados
│   ├── App.tsx                  # Ponto de entrada, estados de filtro e controle de dados
│   └── main.tsx                 # Renderização do React no DOM
├── DOCUMENTACAO.md              # Este manual técnico e operacional
├── README.md                    # Resumo do projeto e guia de inicialização rápida
└── package.json                 # Dependências e scripts do projeto
```

---

## 4. Detalhamento dos Componentes e Lógica

### 4.1 Parser de Dados (`src/utils/csvParser.ts`)
- **`parseCsv(csvText)`**: Processa as linhas do CSV respeitando campos entre aspas e delimitadores de vírgula.
- **`parseDateTimestamp(ts)`**: Converte datas no formato brasileiro `DD/MM/YYYY HH:mm:ss` em *epoch milliseconds* para permitir ordenação numérica perfeita.
- **`parseMilitarInfo(raw)`**: Utiliza expressões regulares para identificar postos/graduações (Cel, Ten Cel, Maj, Cap, Ten, Subten, Sgt, Cb, Sd), números de RG (formatados ou simples) e o nome completo do militar.
- **`parsePhoneNumbers(phoneRaw)`**: Extrai números de telefone válidos de DDD + dígitos para habilitar links diretos para o WhatsApp (`https://wa.me/55...`).

### 4.2 Ordenação e Filtragem (`src/App.tsx`)
- A ordenação padrão é definida como `sortBy = 'timestamp'` e `sortOrder = 'asc'`.
- Permite alternar ordenação por:
  1. **Carimbo / Envio**: Segue a cronologia da planilha do Google.
  2. **Data de Capacitação**: Agrupa 18/08, 19/08 e 20/08 cronologicamente.
  3. **Comando (CPA)**: Ordenação numérica dos comandos (1° CPA a 8° CPA).
  4. **OPM / Unidade**: Ordem alfabética das unidades policiais.
  5. **Qtd. Efetivo**: Quantidade total de policiais cadastrados na inscrição.

### 4.3 Exportação em PDF (`src/utils/pdfExport.ts`)
- Documento configurado em orientação Paisagem (Landscape) para acomodar todas as colunas.
- Estilização em tons de azul marinho militar e cinza profissional.
- Totalizadores automáticos com contagem do efetivo.

---

## 5. Como Atualizar ou Trocar a Planilha Google Sheets

Caso a planilha do Google Forms mude no futuro:
1. Abra a nova planilha no Google Sheets.
2. Acesse o menu **Arquivo** > **Compartilhar** > **Publicar na Web**.
3. Selecione a aba desejada (ex: `Form_Responses` ou `Respostas ao formulário 1`).
4. Altere o formato de *Página da Web* para **Valores separados por vírgula (.csv)**.
5. Copie o link gerado e atualize a constante `GOOGLE_SHEET_CSV_URL` em `src/data/sampleData.ts`.

---

## 6. Comandos de Desenvolvimento e Produção

- **Instalar Dependências**: `npm install`
- **Iniciar Servidor Local**: `npm run dev`
- **Verificação de Tipos e Lint**: `npm run lint`
- **Build de Produção**: `npm run build`

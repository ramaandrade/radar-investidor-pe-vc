# Passo 6 - Radar do Investidor: Private Equity e Venture Capital (PE & VC)

**Aplicação Web Mobile (*Fast Page*) de Alto Impacto para Fechamento de Módulo e Pré-Avaliação.**

🌐 **Acesse a Aplicação Online (Produção):** [https://ramaandrade.github.io/radar-investidor-pe-vc/](https://ramaandrade.github.io/radar-investidor-pe-vc/)  
📦 **Repositório GitHub:** [https://github.com/ramaandrade/radar-investidor-pe-vc](https://github.com/ramaandrade/radar-investidor-pe-vc)

---

## 📱 Visão Geral da Solução

Esta aplicação foi desenvolvida em conformidade estrita com o **Documento de Requisitos de Produto (PRD)**. Trata-se de uma *Single-Page Application* (SPA) mobile ultrarrápida, desenhada para fornecer um choque de realidade sobre o mercado de capital privado antes de direcionar os alunos para a prova avaliativa de Investimentos Alternativos.

### 🌟 Destaques de Arquitetura & UX:
1. **Performance Máxima (Lighthouse 95+):** Código limpo em Vanilla HTML5, CSS3 moderno e JavaScript puro, sem bibliotecas pesadas.
2. **Cards Modulares (Acordeão):** Divididos em 4 pilares essenciais:
   - **Card A:** O Mindset do Capital Fechado (Power Law, Iliquidez de 5-10 anos e Assimetria de Informação).
   - **Card B:** Entendendo o Jogo (Venture Capital vs. Private Equity - Top-line & Burn Rate vs. EBITDA).
   - **Card C:** Como Começar Sem Ser Milionário (Equity Crowdfunding via Resolução CVM 88 e FIPs).
   - **Card D:** Toolkit da Internet (Bancos de dados, mídias especializadas e plataformas de captação).
3. **Microinterações:** Botões de links externos com feedback tátil, badge visual de "sair do app" (`↗`) e abertura segura em nova aba.
4. **Sticky Footer CTA:** Botão fixo vibrante *"Estou Pronto: Ir para a Prova"* com checagem de progresso e modal de revisão rápida.
5. **Offline Ready (PWA Completo):** Service Worker com estratégia de cache e `manifest.json` com ícones vetoriais. Funciona 100% offline (ex: no metrô).
6. **Analytics de Leitura & Scroll Tracking:** Rastreamento de marcos de rolagem (25%, 50%, 75%, 100%), tempo de leitura por card e painel de telemetria embutido para o professor auditar o engajamento da turma.

---

## 📂 Estrutura de Arquivos

```
radar-investidor-pe-vc/
├── index.html            # Estrutura semântica e acessível (SPA)
├── manifest.json         # Manifesto PWA com temas e ícones
├── sw.js                 # Service worker de cache offline
├── css/
│   └── styles.css        # Estilos modernos, alto contraste e safe-area
├── js/
│   ├── analytics.js      # Motor de telemetria, scroll tracking e eventos
│   └── app.js            # Interações, acordeão, PWA e modal
└── assets/
    ├── icon-192.svg      # Ícone do app (192px)
    └── icon-512.svg      # Ícone do app (512px)
```

---

## 🚀 Como Executar Localmente

### Opção 1: Via Python
```bash
cd C:\Users\ramal\.gemini\antigravity\scratch\radar-investidor-pe-vc
python -m http.server 8080
```
Acesse no navegador móvel ou desktop: `http://localhost:8080`

### Opção 2: Via Node.js (npx serve)
```bash
cd C:\Users\ramal\.gemini\antigravity\scratch\radar-investidor-pe-vc
npx serve .
```

---

## 📊 Telemetria & Integração com LMS

A aplicação despacha eventos customizados que podem ser capturados por plataformas como Moodle, Hotmart, Canvas ou Google Analytics:

```javascript
window.addEventListener('pevc_analytics', (event) => {
  console.log('Evento recebido:', event.detail);
  // event.detail.event -> "scroll_depth_reached", "card_expanded", "cta_ready_for_exam_click"
});
```

Para inspecionar os eventos em tempo real, basta tocar no botão **Scroll** no topo da tela do aplicativo.

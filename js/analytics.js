/**
 * Módulo de Analytics & Telemetria de Leitura
 * Rastreador de profundidade de scroll (25%, 50%, 75%, 100%),
 * engajamento por card, cliques em ferramentas e tempo de leitura.
 */

class ReadingAnalytics {
  constructor() {
    this.sessionStartTime = Date.now();
    this.scrollMilestones = {
      25: false,
      50: false,
      75: false,
      100: false
    };
    this.eventsLog = [];
    this.cardReadingTimes = {};
    this.activeCard = null;
    this.activeCardStartTime = null;

    this.initScrollTracking();
    this.initVisibilityTracking();
  }

  /**
   * Registra um evento de telemetria
   */
  logEvent(eventName, eventData = {}) {
    const timeOnPage = Math.round((Date.now() - this.sessionStartTime) / 1000);
    const event = {
      timestamp: new Date().toISOString(),
      timeOnPageSeconds: timeOnPage,
      event: eventName,
      data: eventData
    };

    this.eventsLog.push(event);

    // Salva em sessionStorage para persistência no ciclo da página
    try {
      sessionStorage.setItem('pevc_analytics_events', JSON.stringify(this.eventsLog));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }

    // Exibe no console formatado para inspeção
    console.info(
      `%c[RADAR PE&VC ANALYTICS]%c ${eventName} (+${timeOnPage}s)`,
      'background: #0ea5e9; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #38bdf8; font-weight: bold;',
      eventData
    );

    // Dispara evento global customizado para integração com LMS / Plataformas externas
    window.dispatchEvent(new CustomEvent('pevc_analytics', { detail: event }));

    // Atualiza o painel visual de métricas do professor se estiver aberto
    this.updateInspectorUI();
  }

  /**
   * Monitora scroll tracking (25%, 50%, 75%, 100%)
   */
  initScrollTracking() {
    let ticking = false;

    const checkScrollDepth = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));

      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !this.scrollMilestones[milestone]) {
          this.scrollMilestones[milestone] = true;
          this.logEvent('scroll_depth_reached', {
            milestone: `${milestone}%`,
            actualPercent: scrollPercent,
            viewportY: Math.round(scrollTop),
            totalHeight: Math.round(docHeight)
          });
        }
      });

      // Atualiza badge de scroll no UI
      const scrollBadge = document.getElementById('telemetry-scroll-badge');
      if (scrollBadge) {
        scrollBadge.textContent = `${scrollPercent}%`;
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScrollDepth);
        ticking = true;
      }
    }, { passive: true });

    // Verificação inicial após carregamento completo
    window.addEventListener('DOMContentLoaded', () => {
      checkScrollDepth();
    });
  }

  /**
   * Pausa / retoma contagem de tempo de leitura ao trocar de aba
   */
  initVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logEvent('user_inactive_tab_hidden');
      } else {
        this.logEvent('user_returned_tab_visible');
      }
    });
  }

  /**
   * Registra abertura / fechamento de card modular
   */
  trackCardToggle(cardId, cardTitle, isOpen) {
    if (isOpen) {
      this.activeCard = cardId;
      this.activeCardStartTime = Date.now();
      this.logEvent('card_expanded', { cardId, cardTitle });
    } else {
      let durationSeconds = 0;
      if (this.activeCard === cardId && this.activeCardStartTime) {
        durationSeconds = Math.round((Date.now() - this.activeCardStartTime) / 1000);
        this.cardReadingTimes[cardId] = (this.cardReadingTimes[cardId] || 0) + durationSeconds;
      }
      this.logEvent('card_collapsed', { cardId, cardTitle, readingTimeSeconds: durationSeconds });
      this.activeCard = null;
    }
  }

  /**
   * Registra clique em link externo do toolkit
   */
  trackExternalLink(toolName, category, url) {
    this.logEvent('external_toolkit_click', {
      toolName,
      category,
      url
    });
  }

  /**
   * Registra clique no botão final "Estou Pronto: Ir para a Prova"
   */
  trackCtaClick(cardsExploredCount, totalCards) {
    this.logEvent('cta_ready_for_exam_click', {
      cardsExplored: cardsExploredCount,
      totalCards: totalCards,
      exploredAll: cardsExploredCount >= totalCards,
      maxScrollMilestone: this.getMaxMilestone()
    });
  }

  getMaxMilestone() {
    if (this.scrollMilestones[100]) return '100%';
    if (this.scrollMilestones[75]) return '75%';
    if (this.scrollMilestones[50]) return '50%';
    if (this.scrollMilestones[25]) return '25%';
    return '<25%';
  }

  /**
   * Atualiza a interface do modal/gaveta do professor
   */
  updateInspectorUI() {
    const listEl = document.getElementById('inspector-events-list');
    const countBadge = document.getElementById('inspector-events-count');
    const scrollMaxBadge = document.getElementById('inspector-max-scroll');
    const sessionTimeBadge = document.getElementById('inspector-session-time');

    if (countBadge) countBadge.textContent = this.eventsLog.length;
    if (scrollMaxBadge) scrollMaxBadge.textContent = this.getMaxMilestone();
    if (sessionTimeBadge) {
      sessionTimeBadge.textContent = `${Math.round((Date.now() - this.sessionStartTime) / 1000)}s`;
    }

    if (!listEl) return;

    // Renderiza os últimos 15 eventos
    const recentEvents = [...this.eventsLog].reverse().slice(0, 15);
    listEl.innerHTML = recentEvents.map(evt => {
      const dataPreview = Object.keys(evt.data).length 
        ? Object.entries(evt.data).map(([k, v]) => `<span class="tag-metric">${k}: ${v}</span>`).join(' ')
        : '';
      return `
        <div class="event-item">
          <div class="event-header">
            <span class="event-name">${evt.event}</span>
            <span class="event-time">+${evt.timeOnPageSeconds}s</span>
          </div>
          <div class="event-data">${dataPreview}</div>
        </div>
      `;
    }).join('');
  }
}

// Instância singleton global
window.pevcAnalytics = new ReadingAnalytics();

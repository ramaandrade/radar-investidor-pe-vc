/**
 * Lógica da Aplicação Fast Page - Radar do Investidor PE & VC
 * Controle de Acordeão, Progresso de Leitura, PWA e Microinterações
 */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.modular-card');
  const toggleAllBtn = document.getElementById('toggle-all-btn');
  const progressFill = document.getElementById('reading-progress-fill');
  const progressText = document.getElementById('reading-progress-text');
  const stickyCta = document.getElementById('sticky-cta-btn');
  const examModal = document.getElementById('exam-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal-trigger');
  const offlineStatusPill = document.getElementById('offline-status-pill');
  const inspectorModal = document.getElementById('inspector-modal');
  const openInspectorBtn = document.getElementById('open-inspector-btn');
  const closeInspectorBtn = document.getElementById('close-inspector-btn');
  const copyMetricsBtn = document.getElementById('copy-metrics-btn');

  // Estado dos cartões explorados
  const exploredCards = new Set();
  const totalCardsCount = cards.length;

  /**
   * Vibração tátil sutil para dispositivos móveis
   */
  const triggerHaptic = (duration = 15) => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Ignora se não for suportado
      }
    }
  };

  /**
   * Atualiza a barra de progresso de leitura
   */
  const updateProgress = () => {
    const count = exploredCards.size;
    const percent = Math.round((count / totalCardsCount) * 100);

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.textContent = `${count}/${totalCardsCount} explorados`;
      if (count === totalCardsCount) {
        progressText.classList.add('completed');
      }
    }

    // Atualiza estado do Sticky CTA
    const ctaBadge = document.getElementById('cta-progress-indicator');
    if (ctaBadge) {
      if (count === totalCardsCount) {
        ctaBadge.textContent = '100% Revisado';
        ctaBadge.classList.add('badge-success');
      } else {
        ctaBadge.textContent = `${count}/${totalCardsCount} tópicos`;
      }
    }
  };

  /**
   * Inicializa comportamento de acordeão
   */
  cards.forEach((card) => {
    const header = card.querySelector('.card-header');
    const content = card.querySelector('.card-content');
    const cardId = card.getAttribute('data-card-id') || 'unknown';
    const cardTitle = card.querySelector('.card-title')?.textContent?.trim() || '';

    // Se o card já começar com a classe 'open', marca como explorado
    if (card.classList.contains('is-open')) {
      exploredCards.add(cardId);
      updateProgress();
    }

    header.addEventListener('click', () => {
      triggerHaptic(12);
      const isOpen = card.classList.contains('is-open');

      if (isOpen) {
        card.classList.remove('is-open');
        header.setAttribute('aria-expanded', 'false');
        window.pevcAnalytics.trackCardToggle(cardId, cardTitle, false);
      } else {
        card.classList.add('is-open');
        header.setAttribute('aria-expanded', 'true');
        exploredCards.add(cardId);
        updateProgress();
        window.pevcAnalytics.trackCardToggle(cardId, cardTitle, true);
      }
    });

    // Acessibilidade via teclado (Enter / Espaço)
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  /**
   * Botão "Expandir Tudo" / "Recolher Tudo"
   */
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      triggerHaptic(15);
      const allOpen = Array.from(cards).every((c) => c.classList.contains('is-open'));

      cards.forEach((card) => {
        const header = card.querySelector('.card-header');
        const cardId = card.getAttribute('data-card-id');
        const cardTitle = card.querySelector('.card-title')?.textContent?.trim();

        if (allOpen) {
          card.classList.remove('is-open');
          header.setAttribute('aria-expanded', 'false');
          window.pevcAnalytics.trackCardToggle(cardId, cardTitle, false);
        } else {
          card.classList.add('is-open');
          header.setAttribute('aria-expanded', 'true');
          exploredCards.add(cardId);
          window.pevcAnalytics.trackCardToggle(cardId, cardTitle, true);
        }
      });

      updateProgress();
      toggleAllBtn.textContent = allOpen ? 'Expandir todos' : 'Recolher todos';
      window.pevcAnalytics.logEvent('toggle_all_cards_clicked', { action: allOpen ? 'collapse_all' : 'expand_all' });
    });
  }

  /**
   * Monitora links externos do Toolkit com microinterações
   */
  const externalLinks = document.querySelectorAll('.toolkit-link-btn, .external-badge-link');
  externalLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      triggerHaptic(10);
      const toolName = link.getAttribute('data-tool-name') || link.innerText.trim();
      const category = link.getAttribute('data-category') || 'Geral';
      const url = link.getAttribute('href');

      window.pevcAnalytics.trackExternalLink(toolName, category, url);
    });
  });

  /**
   * Abertura do Modal de Avaliação via Sticky CTA
   */
  if (stickyCta) {
    stickyCta.addEventListener('click', () => {
      triggerHaptic(25);
      const count = exploredCards.size;
      window.pevcAnalytics.trackCtaClick(count, totalCardsCount);

      // Preenche os alertas no modal caso falte algum card
      const modalNotice = document.getElementById('exam-modal-notice');
      if (modalNotice) {
        if (count < totalCardsCount) {
          modalNotice.innerHTML = `
            <div class="modal-alert-box alert-warning">
              <span class="alert-icon">⚠️</span>
              <div>
                <strong>Atenção ao conteúdo!</strong>
                <p>Você explorou <strong>${count} de ${totalCardsCount}</strong> cards essenciais. Recomendamos revisar todos os tópicos para garantir nota máxima na avaliação.</p>
              </div>
            </div>
          `;
        } else {
          modalNotice.innerHTML = `
            <div class="modal-alert-box alert-success">
              <span class="alert-icon">🎯</span>
              <div>
                <strong>Revisão 100% Concluída!</strong>
                <p>Você cobriu todos os 4 pilares: Mindset, VC vs PE, Ações Práticas e Toolkit.</p>
              </div>
            </div>
          `;
        }
      }

      // Abre o modal
      if (examModal) {
        examModal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  /**
   * Fechamento de modais
   */
  closeModalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (examModal) examModal.classList.remove('is-active');
      if (inspectorModal) inspectorModal.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });

  // Fecha modal ao clicar no backdrop escuro
  window.addEventListener('click', (e) => {
    if (e.target === examModal) {
      examModal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
    if (e.target === inspectorModal) {
      inspectorModal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });

  /**
   * Botão de Iniciar Prova no Modal
   */
  const startExamFinalBtn = document.getElementById('start-exam-final-btn');
  if (startExamFinalBtn) {
    startExamFinalBtn.addEventListener('click', () => {
      triggerHaptic(30);
      window.pevcAnalytics.logEvent('start_exam_confirmed', {
        status: 'redirecting_to_evaluation'
      });
      // Simulação de transição para o LMS ou avaliação
      const btnOriginalText = startExamFinalBtn.innerHTML;
      startExamFinalBtn.disabled = true;
      startExamFinalBtn.innerHTML = `
        <span class="spinner"></span> Carregando avaliação...
      `;

      setTimeout(() => {
        alert('🎉 Transição realizada com sucesso!\nO aluno foi direcionado para a prova de Investimentos Alternativos.');
        startExamFinalBtn.disabled = false;
        startExamFinalBtn.innerHTML = btnOriginalText;
        examModal.classList.remove('is-active');
        document.body.style.overflow = '';
      }, 700);
    });
  }

  /**
   * Painel de Telemetria do Professor
   */
  if (openInspectorBtn && inspectorModal) {
    openInspectorBtn.addEventListener('click', () => {
      window.pevcAnalytics.updateInspectorUI();
      inspectorModal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeInspectorBtn && inspectorModal) {
    closeInspectorBtn.addEventListener('click', () => {
      inspectorModal.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  }

  if (copyMetricsBtn) {
    copyMetricsBtn.addEventListener('click', () => {
      const summary = {
        sessionStart: new Date(window.pevcAnalytics.sessionStartTime).toISOString(),
        totalSessionSeconds: Math.round((Date.now() - window.pevcAnalytics.sessionStartTime) / 1000),
        cardsExplored: Array.from(exploredCards),
        scrollMilestones: window.pevcAnalytics.scrollMilestones,
        eventsCount: window.pevcAnalytics.eventsLog.length,
        events: window.pevcAnalytics.eventsLog
      };

      navigator.clipboard.writeText(JSON.stringify(summary, null, 2)).then(() => {
        const originalText = copyMetricsBtn.innerHTML;
        copyMetricsBtn.innerHTML = '✅ Copiado com Sucesso!';
        setTimeout(() => {
          copyMetricsBtn.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  /**
   * Monitoramento de Conexão Online/Offline (Modo Metrô)
   */
  const updateNetworkStatus = () => {
    if (!offlineStatusPill) return;

    if (!navigator.onLine) {
      offlineStatusPill.classList.remove('is-online');
      offlineStatusPill.classList.add('is-offline');
      offlineStatusPill.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">Modo Metrô: Leitura 100% Offline</span>
      `;
      window.pevcAnalytics.logEvent('network_status_changed', { status: 'offline' });
    } else {
      offlineStatusPill.classList.remove('is-offline');
      offlineStatusPill.classList.add('is-online');
      offlineStatusPill.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">Online • Cache Ativo</span>
      `;
    }
  };

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  /**
   * Registro do Service Worker (PWA Offline)
   */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado com escopo:', registration.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Falha ao registrar Service Worker:', err);
      });
  }
});

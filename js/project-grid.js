/**
 * project-grid.js — Selected Projects interactive grid & Yan Holtz style modal
 */
(function () {
  'use strict';

  var GRID_SELECTOR = '#project-grid';
  var CARD_SELECTOR = '.project-card';
  var MODAL_ID = 'project-modal';

  /**
   * Project metadata store used to populate the modal on card click.
   * Can also fall back to data-* attributes on the card if an unknown ID is passed.
   */
  var PROJECTS_DATA = {
    'revenue-command-center': {
      title: 'Bike-buyers_customer-insights',
      subtitle: 'Analyzing customer demographic data and purchasing behavior for a bike retail business.',
      image: 'assets/projects/bike-customer_insight-dashboard.png',
      repoUrl: 'https://github.com/shiyannn/Bike-buyers_customer-insights',
      visitLabel: 'View GitHub Repo',
      description: 'This project focuses on analyzing customer demographic data and purchasing behavior for a bike retail business. Using Microsoft Excel (Pivot Tables, Advanced Formulas, and Data Visualization), an interactive dashboard was built to identify key customer segments, evaluate purchasing patterns, and uncover growth opportunities.',
      badges: ['Excel', 'Pivot Tables', 'Advanced Formulas', 'Data Visualization']
    },
    'sales-data-cleanroom': {
      title: 'Naga City Dengue Surveillance-Outbreak Control Insights',
      subtitle: 'Analyzing dengue cases in Naga City to identify patterns, trends, and risk factors for early outbreak detection and control.',
      image: 'assets/projects/Naga_Dengue_Dashboard.png',
      repoUrl: 'https://github.com/shiyannn/Naga-City-Dengue-Surveillance-Outbreak-Control-Insights',
      visitLabel: 'View GitHub Repo',
      description: 'This report presents key data insights and action plans based on the Naga City Dengue Dashboard. The goal is to lower dengue cases, protect high-risk age groups, and keep community health systems strong.',
      badges: ['Power BI', 'Excel', 'Data Cleaning', 'SQL']
    },
    'support-ops-scorecard': {
      title: 'Support Ops Scorecard',
      subtitle: 'Real-time operational scorecard tracking SLA adherence, agent load, and queue backlogs.',
      image: 'assets/projects/Naga_Dengue_Dashboard.png',
      repoUrl: 'https://github.com/shiyannn/Naga-City-Dengue-Surveillance-Outbreak-Control-Insights',
      visitLabel: 'View GitHub Repo',
      description: 'This report presents key data insights and action plans based on the Naga City Dengue Dashboard. The goal is to lower dengue cases, protect high-risk age groups, and keep community health systems strong.',
      badges: ['SQL', 'Power BI', 'Excel', 'Ops Analytics']
    },
  };

  var activeModal = null;
  var previousActiveElement = null;

  /**
   * Opens and populates the project modal
   * @param {string} projectId 
   */
  function openProjectModal(projectId) {
    if (!projectId) return;

    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    var card = document.querySelector('.project-card[data-project-id="' + projectId + '"]');
    var data = PROJECTS_DATA[projectId] || {};

    // Fallback info from card attributes if not found in data dictionary
    var title = data.title || (card && card.getAttribute('data-title')) || 'Project Details';
    var subtitle = data.subtitle || (card && card.getAttribute('data-summary')) || '';
    var description = data.description || (card && card.getAttribute('data-summary')) || 'Detailed case overview available upon request.';
    var image = data.image || (card && card.querySelector('img') && card.querySelector('img').src) || '';

    // Direct GitHub repository link from card data-repo / data-github or data dictionary
    var repoUrl = (card && (card.getAttribute('data-repo') || card.getAttribute('data-github'))) ||
      data.repoUrl ||
      data.visitUrl ||
      ('https://github.com/sh1yan/' + projectId);

    var visitLabel = (card && card.getAttribute('data-btn-label')) || data.visitLabel || 'View GitHub Repo';
    var badges = data.badges || (card && card.getAttribute('data-tech') ? card.getAttribute('data-tech').split(',').map(function (s) { return s.trim(); }) : []);

    // Populate modal DOM elements
    var imgEl = modal.querySelector('#modal-img');
    var titleEl = modal.querySelector('#modal-title');
    var subtitleEl = modal.querySelector('#modal-subtitle');
    var visitEl = modal.querySelector('#modal-visit');
    var visitTextEl = modal.querySelector('#modal-visit-text');
    var descEl = modal.querySelector('#modal-description');
    var badgesEl = modal.querySelector('#modal-badges');

    if (imgEl) {
      imgEl.src = image;
      imgEl.alt = title + ' preview';
    }
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    if (visitEl) {
      visitEl.href = repoUrl;
      visitEl.setAttribute('target', '_blank');
      visitEl.setAttribute('rel', 'noopener noreferrer');
      visitEl.setAttribute('aria-label', 'Open ' + title + ' repository on GitHub in a new tab');
      if (visitTextEl) {
        visitTextEl.textContent = visitLabel;
      }
    }

    if (descEl) {
      descEl.innerHTML = '<p>' + description.replace(/\n\n/g, '</p><p>') + '</p>';
    }
    if (badgesEl) {
      badgesEl.innerHTML = '';
      badges.forEach(function (badge) {
        var li = document.createElement('li');
        li.textContent = badge;
        badgesEl.appendChild(li);
      });
    }

    // Save previous active element for accessibility focus restoration
    previousActiveElement = document.activeElement;

    // Show modal & lock background scrolling
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    // Focus close button
    var closeBtn = modal.querySelector('#modal-close');
    if (closeBtn) {
      closeBtn.focus();
    }

    // Dispatch custom event for external hooks
    document.dispatchEvent(new CustomEvent('openProjectModal', {
      detail: { projectId: projectId, data: data, repoUrl: repoUrl },
      bubbles: true
    }));
  }

  /**
   * Closes the active project modal
   */
  function closeProjectModal() {
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeModal = null;

    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  /**
   * Initializes click, keyboard, and backdrop event listeners
   */
  function initProjectGridAndModal() {
    var grid = document.querySelector(GRID_SELECTOR);
    var modal = document.getElementById(MODAL_ID);

    // Grid card click delegation
    if (grid) {
      grid.addEventListener('click', function (event) {
        var card = event.target.closest(CARD_SELECTOR);
        if (!card || !grid.contains(card)) return;

        var projectId = card.getAttribute('data-project-id');
        openProjectModal(projectId);
      });

      grid.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;

        var card = event.target.closest(CARD_SELECTOR);
        if (!card || !grid.contains(card)) return;

        event.preventDefault();
        var projectId = card.getAttribute('data-project-id');
        openProjectModal(projectId);
      });
    }

    // Modal close button & backdrop click
    if (modal) {
      modal.addEventListener('click', function (event) {
        if (event.target === modal || event.target.closest('#modal-close')) {
          closeProjectModal();
        }
      });
    }

    // Global Escape key handler
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && activeModal) {
        closeProjectModal();
      }
    });
  }

  // Expose methods globally for external scripting/testing
  window.openProjectModal = openProjectModal;
  window.closeProjectModal = closeProjectModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectGridAndModal);
  } else {
    initProjectGridAndModal();
  }
})();

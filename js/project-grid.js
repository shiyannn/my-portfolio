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
      title: 'Naga City Crime Surveillance and Prevention',
      subtitle: '',
      image: 'assets/projects/1st.png',
      images: [
        'assets/projects/1st.png',
        'assets/projects/2.png',
        'assets/projects/3.png'
      ],
      repoUrl: 'https://github.com/shiyannn/',
      visitLabel: 'View GitHub Repo',
      description: 'This report presents key data insights and action plans based on the Naga City Crime Dashboard. The goal is to lower crime cases, protect high-risk age groups, and keep community health systems strong.',
      badges: ['Power BI', 'Excel', 'Data Cleaning', 'SQL']
    },
    'support-ops-scorecard': {
      title: 'Naga City Dengue Surveillance-Outbreak Control Insights',
      subtitle: 'Analyzing dengue cases in Naga City to identify patterns, trends, and risk factors for early outbreak detection and control.',
      image: 'assets/projects/Naga_Dengue_Dashboard.png',
      repoUrl: 'https://github.com/shiyannn/Naga-City-Dengue-Surveillance-Outbreak-Control-Insights',
      visitLabel: 'View GitHub Repo',
      description: 'This report presents key data insights and action plans based on the Naga City Dengue Dashboard. The goal is to lower dengue cases, protect high-risk age groups, and keep community health systems strong.',
      badges: ['SQL', 'Power BI', 'Excel', 'Ops Analytics']
    },
  };

  var activeModal = null;
  var previousActiveElement = null;

  // Modal image carousel state
  var carouselImages = [];
  var carouselIndex = 0;
  var carouselTitle = '';
  var carouselFadeTimer = null;

  /**
   * Renders the current carousel slide (with a short crossfade).
   * @param {HTMLElement} modal
   * @param {number} index
   * @param {boolean} [immediate]
   */
  function showSlide(modal, index, immediate) {
    var imgEl = modal.querySelector('#modal-img');
    if (!imgEl || !carouselImages.length) return;

    var total = carouselImages.length;
    carouselIndex = ((index % total) + total) % total;

    var apply = function () {
      imgEl.src = carouselImages[carouselIndex];
      imgEl.alt = carouselTitle + ' dashboard preview, image ' + (carouselIndex + 1) + ' of ' + total;
      imgEl.classList.remove('is-fading');
    };

    if (carouselFadeTimer) {
      window.clearTimeout(carouselFadeTimer);
      carouselFadeTimer = null;
    }

    if (immediate) {
      apply();
    } else {
      imgEl.classList.add('is-fading');
      carouselFadeTimer = window.setTimeout(function () {
        carouselFadeTimer = null;
        apply();
      }, 120);
    }

    var dots = modal.querySelectorAll('.carousel-dot');
    for (var i = 0; i < dots.length; i++) {
      var isActive = i === carouselIndex;
      dots[i].classList.toggle('is-active', isActive);
      dots[i].setAttribute('aria-current', isActive ? 'true' : 'false');
    }
  }

  /**
   * Builds the carousel for the given image list and shows the first slide.
   * @param {HTMLElement} modal
   * @param {string[]} images
   * @param {string} title
   */
  function setupCarousel(modal, images, title) {
    var dotsEl = modal.querySelector('#modal-dots');
    var prevBtn = modal.querySelector('#modal-prev');
    var nextBtn = modal.querySelector('#modal-next');

    carouselImages = images;
    carouselTitle = title;
    carouselIndex = 0;

    if (dotsEl) {
      dotsEl.innerHTML = '';
      images.forEach(function (src, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Show image ' + (i + 1) + ' of ' + images.length);
        dot.addEventListener('click', function () {
          showSlide(modal, i);
        });
        dotsEl.appendChild(dot);
      });
    }

    var hasMany = images.length > 1;
    if (prevBtn) prevBtn.hidden = !hasMany;
    if (nextBtn) nextBtn.hidden = !hasMany;
    if (dotsEl) dotsEl.hidden = !hasMany;

    showSlide(modal, 0, true);
  }

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
    var images = (data.images && data.images.length ? data.images : [image]).filter(Boolean);

    // Direct GitHub repository link from card data-repo / data-github or data dictionary
    var repoUrl = (card && (card.getAttribute('data-repo') || card.getAttribute('data-github'))) ||
      data.repoUrl ||
      data.visitUrl ||
      ('https://github.com/sh1yan/' + projectId);

    var visitLabel = (card && card.getAttribute('data-btn-label')) || data.visitLabel || 'View GitHub Repo';
    var badges = data.badges || (card && card.getAttribute('data-tech') ? card.getAttribute('data-tech').split(',').map(function (s) { return s.trim(); }) : []);

    // Populate modal DOM elements
    var titleEl = modal.querySelector('#modal-title');
    var subtitleEl = modal.querySelector('#modal-subtitle');
    var visitEl = modal.querySelector('#modal-visit');
    var visitTextEl = modal.querySelector('#modal-visit-text');
    var descEl = modal.querySelector('#modal-description');
    var badgesEl = modal.querySelector('#modal-badges');

    setupCarousel(modal, images, title);
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

      // Carousel arrows
      var prevBtn = modal.querySelector('#modal-prev');
      var nextBtn = modal.querySelector('#modal-next');
      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          showSlide(modal, carouselIndex - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          showSlide(modal, carouselIndex + 1);
        });
      }

      // Carousel swipe (touch)
      var preview = modal.querySelector('#modal-carousel');
      var touchStartX = null;
      if (preview) {
        preview.addEventListener('touchstart', function (event) {
          if (event.touches.length !== 1) return;
          touchStartX = event.touches[0].clientX;
        }, { passive: true });

        preview.addEventListener('touchend', function (event) {
          if (touchStartX === null) return;
          var dx = event.changedTouches[0].clientX - touchStartX;
          touchStartX = null;
          if (Math.abs(dx) < 40 || carouselImages.length < 2) return;
          showSlide(modal, carouselIndex + (dx < 0 ? 1 : -1));
        }, { passive: true });
      }
    }

    // Global Escape + carousel arrow keys
    document.addEventListener('keydown', function (event) {
      if (!activeModal) return;

      if (event.key === 'Escape') {
        closeProjectModal();
        return;
      }

      if (carouselImages.length < 2) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(activeModal, carouselIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(activeModal, carouselIndex + 1);
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

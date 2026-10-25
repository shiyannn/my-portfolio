/**
 * certificates.js — Credential rows open a detail modal (same design as projects)
 */
(function () {
  'use strict';

  var SECTION_SELECTOR = '#certificates';
  var BUTTON_SELECTOR = '.readmore';
  var MODAL_ID = 'cert-modal';

  var activeModal = null;
  var previousActiveElement = null;

  function getCard(button) {
    return button.closest('.certificate');
  }

  function getText(card, selector) {
    var el = card.querySelector(selector);
    return el ? el.textContent.trim() : '';
  }

  function openCertModal(card) {
    if (!card) return;

    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    var title = getText(card, 'h3') || 'Certification';
    var issuer = getText(card, '.issuer');
    var summary = getText(card, 'p');
    var image = card.getAttribute('data-cert-image') || '';
    var url = card.getAttribute('data-cert-url') || '';
    var badges = (card.getAttribute('data-cert-badges') || '')
      .split(',')
      .map(function (badge) { return badge.trim(); })
      .filter(Boolean);

    var previewEl = modal.querySelector('#cert-modal-preview');
    var imgEl = modal.querySelector('#cert-modal-img');
    var titleEl = modal.querySelector('#cert-modal-title');
    var subtitleEl = modal.querySelector('#cert-modal-subtitle');
    var visitEl = modal.querySelector('#cert-modal-visit');
    var descEl = modal.querySelector('#cert-modal-description');
    var badgesEl = modal.querySelector('#cert-modal-badges');

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = issuer ? issuer : 'Verified credential';

    if (previewEl && imgEl) {
      if (image) {
        imgEl.onerror = function () {
          previewEl.hidden = true;
        };
        imgEl.src = image;
        imgEl.alt = title + ' certificate';
        previewEl.hidden = false;
      } else {
        imgEl.onerror = null;
        imgEl.removeAttribute('src');
        imgEl.alt = '';
        previewEl.hidden = true;
      }
    }

    if (visitEl) {
      if (url) {
        visitEl.href = url;
        visitEl.classList.remove('is-disabled');
        visitEl.removeAttribute('aria-disabled');
        visitEl.setAttribute('aria-label', 'Verify ' + title + ' in a new tab');
      } else {
        visitEl.href = '#';
        visitEl.classList.add('is-disabled');
        visitEl.setAttribute('aria-disabled', 'true');
        visitEl.setAttribute('aria-label', 'Credential link coming soon');
      }
    }

    if (descEl) {
      descEl.innerHTML = '<p>' + summary + '</p>';
    }

    if (badgesEl) {
      badgesEl.innerHTML = '';
      badges.forEach(function (badge) {
        var li = document.createElement('li');
        li.textContent = badge;
        badgesEl.appendChild(li);
      });
    }

    previousActiveElement = document.activeElement;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    var closeBtn = modal.querySelector('#cert-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeCertModal() {
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

  function initCertificates() {
    var section = document.querySelector(SECTION_SELECTOR);
    var modal = document.getElementById(MODAL_ID);

    if (section) {
      section.addEventListener('click', function (event) {
        var button = event.target.closest(BUTTON_SELECTOR);
        if (!button || !section.contains(button)) return;
        openCertModal(getCard(button));
      });
    }

    if (modal) {
      modal.addEventListener('click', function (event) {
        if (event.target.closest('#cert-modal-visit.is-disabled')) {
          event.preventDefault();
          return;
        }
        if (event.target === modal || event.target.closest('#cert-modal-close')) {
          closeCertModal();
        }
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && activeModal) {
        closeCertModal();
      }
    });
  }

  window.openCertModal = openCertModal;
  window.closeCertModal = closeCertModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCertificates);
  } else {
    initCertificates();
  }
})();


(function () {
  'use strict';

  function initHeaderState() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function update() {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initFooterYear() {
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function init() {
    initHeaderState();
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

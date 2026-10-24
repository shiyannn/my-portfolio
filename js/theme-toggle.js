/**
 * theme-toggle.js — dark/light mode switcher
 *
 * Reads the user's saved preference from localStorage,
 * falls back to system preference (prefers-color-scheme),
 * and persists choice on toggle. Also updates the
 * background canvas particle colors and <meta theme-color>.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var DARK = 'dark';
  var LIGHT = 'light';

  /** Detect system preference. */
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /** Read stored preference or fall back to system. */
  function getPreferred() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (_) { /* no-op */ }
    if (stored === DARK || stored === LIGHT) return stored;
    return systemPrefersDark() ? DARK : LIGHT;
  }

  /** Apply theme to <html> and update meta theme-color. */
  function applyTheme(theme, animate) {
    var root = document.documentElement;

    // Add a transition class briefly so the swap is smooth
    if (animate) {
      root.classList.add('theme-transitioning');
      setTimeout(function () { root.classList.remove('theme-transitioning'); }, 500);
    }

    root.setAttribute('data-theme', theme);

    // Update <meta name="theme-color">
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === DARK ? '#0f1117' : '#FAFAFA');
    }

    // Persist
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* no-op */ }
  }

  /** Wire up the toggle button. */
  function initToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === DARK ? LIGHT : DARK;
      applyTheme(next, true);
    });
  }

  // Apply immediately (before paint) — no flash of wrong theme
  applyTheme(getPreferred(), false);

  // Wire toggle once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      // Only react if user hasn't explicitly chosen
      var stored = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch (_) { /* no-op */ }
      if (!stored) {
        applyTheme(e.matches ? DARK : LIGHT, true);
      }
    });
  }
})();

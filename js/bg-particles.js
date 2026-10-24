/**
 * bg-particles.js — constellation background
 *
 * Hand-rolled canvas network: drifting nodes, distance-faded links,
 * and cursor-linked nodes on hover. No third-party dependency.
 */
(function () {
  'use strict';

  /* Shared (non-color) settings */
  var SHARED = {
    linkDistance: 140,
    cursorDistance: 150,
    minParticles: 50,
    maxParticles: 80,
    areaPerParticle: 17000,
    maxDrift: 0.35,
    radiusMin: 1.2,
    radiusMax: 2.6,
    hubRatio: 0.14,
    hubScale: 1.9,
    glowRadius: 5,
    bounceDamping: 0.6
  };

  /* Theme-specific palettes */
  var THEMES = {
    light: {
      nodeColor: '#888888',
      linkColor: '#888888',
      cursorLinkColor: '#2E8B57',
      nodeOpacity: 0.72,
      baseLinkOpacity: 0.27,
      cursorLinkOpacity: 0.5,
      glowColor: '136, 136, 136',
      glowOpacity: 0.22
    },
    dark: {
      nodeColor: '#5ee89c',
      linkColor: '#3fbc73',
      cursorLinkColor: '#5ee89c',
      nodeOpacity: 0.6,
      baseLinkOpacity: 0.18,
      cursorLinkOpacity: 0.45,
      glowColor: '94, 232, 156',
      glowOpacity: 0.16
    }
  };

  /** Return merged config for the current theme. */
  function getConfig() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var palette = isDark ? THEMES.dark : THEMES.light;
    var cfg = {};
    var key;
    for (key in SHARED) { cfg[key] = SHARED[key]; }
    for (key in palette) { cfg[key] = palette[key]; }
    return cfg;
  }

  var CONFIG = getConfig();

  function createBackground(canvas) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var width = 0;
    var height = 0;
    var pointer = { x: -9999, y: -9999, active: false };
    var animationFrame = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function randomBetween(min, max) {
      return min + Math.random() * (max - min);
    }

    /** Scale particle count with viewport area, clamped to a sane range. */
    function particleCount() {
      var area = width * height;
      var count = Math.round(area / CONFIG.areaPerParticle);
      return Math.max(CONFIG.minParticles, Math.min(CONFIG.maxParticles, count));
    }

    function seedNodes(count) {
      nodes = [];
      for (var i = 0; i < count; i++) {
        var r = randomBetween(CONFIG.radiusMin, CONFIG.radiusMax);
        var isHub = Math.random() < CONFIG.hubRatio;
        if (isHub) r *= CONFIG.hubScale;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: randomBetween(-CONFIG.maxDrift, CONFIG.maxDrift),
          vy: randomBetween(-CONFIG.maxDrift, CONFIG.maxDrift),
          r: r,
          hub: isHub,
          tone: randomBetween(0.75, 1.15)
        });
      }
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      seedNodes(particleCount());
    }

    function update() {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= node.r) {
          node.x = node.r;
          node.vx = Math.abs(node.vx) * CONFIG.bounceDamping;
        } else if (node.x >= width - node.r) {
          node.x = width - node.r;
          node.vx = -Math.abs(node.vx) * CONFIG.bounceDamping;
        }

        if (node.y <= node.r) {
          node.y = node.r;
          node.vy = Math.abs(node.vy) * CONFIG.bounceDamping;
        } else if (node.y >= height - node.r) {
          node.y = height - node.r;
          node.vy = -Math.abs(node.vy) * CONFIG.bounceDamping;
        }
      }
    }

    function drawLink(x1, y1, x2, y2, color, opacity, width) {
      if (opacity <= 0.01) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = width || 1;
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Node-to-node links, opacity driven by distance
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i];
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > CONFIG.linkDistance) continue;

          var falloff = 1 - distance / CONFIG.linkDistance;
          drawLink(a.x, a.y, b.x, b.y, CONFIG.linkColor, CONFIG.baseLinkOpacity * falloff, 0.6 + falloff * 0.8);
        }
      }

      // Cursor links
      if (pointer.active) {
        for (var k = 0; k < nodes.length; k++) {
          var node = nodes[k];
          var cdx = pointer.x - node.x;
          var cdy = pointer.y - node.y;
          var cursorDistance = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cursorDistance > CONFIG.cursorDistance) continue;

          var cursorFalloff = 1 - cursorDistance / CONFIG.cursorDistance;
          drawLink(node.x, node.y, pointer.x, pointer.y, CONFIG.cursorLinkColor, CONFIG.cursorLinkOpacity * cursorFalloff);
        }
      }

      // Nodes — uniform green glow ring + varied core opacity
      for (var n = 0; n < nodes.length; n++) {
        var p = nodes[n];
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(' + CONFIG.glowColor + ', ' + CONFIG.glowOpacity + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, CONFIG.glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = CONFIG.nodeOpacity * p.tone;
        ctx.fillStyle = CONFIG.nodeColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      update();
      draw();
      animationFrame = window.requestAnimationFrame(frame);
    }

    function start() {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(frame);
    }

    function stop() {
      if (animationFrame === null) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    function drawStatic() {
      draw();
    }

    function onPointerMove(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (reduceMotion) drawStatic();
    }

    function onPointerLeave() {
      pointer.active = false;
      if (reduceMotion) drawStatic();
    }

    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else if (!reduceMotion) {
        start();
      }
    });

    if (reduceMotion) {
      drawStatic();
    } else {
      start();
    }

    // Live-update particle colors when theme changes
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-theme') {
          CONFIG = getConfig();
          if (reduceMotion) drawStatic();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function init() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas || !canvas.getContext) return;
    createBackground(canvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

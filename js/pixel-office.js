/**
 * pixel-office.js — decorative pixel-art office for the contact section.
 * Hand-drawn sprites, CSS-variable palette, no dependencies.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('pixel-office-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var FONT = {
    ' ': ['000', '000', '000', '000', '000'],
    '/': ['001', '001', '010', '100', '100'],
    '!': ['010', '010', '010', '000', '010'],
    '?': ['110', '001', '010', '000', '010'],
    '.': ['000', '000', '000', '000', '010'],
    '-': ['000', '000', '111', '000', '000'],
    A: ['111', '101', '111', '101', '101'],
    B: ['110', '101', '110', '101', '110'],
    C: ['111', '100', '100', '100', '111'],
    D: ['110', '101', '101', '101', '110'],
    E: ['111', '100', '110', '100', '111'],
    F: ['111', '100', '110', '100', '100'],
    G: ['111', '100', '101', '101', '111'],
    H: ['101', '101', '111', '101', '101'],
    I: ['111', '010', '010', '010', '111'],
    J: ['001', '001', '001', '101', '010'],
    K: ['101', '110', '100', '110', '101'],
    L: ['100', '100', '100', '100', '111'],
    M: ['101', '111', '101', '101', '101'],
    N: ['101', '111', '111', '101', '101'],
    O: ['111', '101', '101', '101', '111'],
    P: ['111', '101', '111', '100', '100'],
    Q: ['111', '101', '101', '111', '001'],
    R: ['110', '101', '110', '101', '101'],
    S: ['111', '100', '111', '001', '111'],
    T: ['111', '010', '010', '010', '010'],
    U: ['101', '101', '101', '101', '111'],
    V: ['101', '101', '101', '101', '010'],
    W: ['101', '101', '101', '111', '101'],
    X: ['101', '101', '010', '101', '101'],
    Y: ['101', '101', '010', '010', '010'],
    Z: ['111', '001', '010', '100', '111']
  };

  var BODY = [
    '..HHHH....',
    '.HHHHHH...',
    '.HHKKHH...',
    '..KKKK....',
    '..KEKE....',
    '..KKKK....',
    '...KK.....',
    '..CCCC....',
    '.CCCCCC...',
    'DCCCCCCD..',
    'DCCCCCCD..',
    '.CCCCCC...',
    '.GGGGGG...',
    '.GG..GG...',
    '.GG..GG...',
    '.OO..OO...'
  ];

  var WALK_A = BODY.slice(0, 12).concat([
    '.GGGGGG...',
    'GG....GG..',
    '.G....G...',
    'OO....OO..'
  ]);

  var WALK_B = BODY.slice(0, 12).concat([
    '.GGGGGG...',
    '..GGGG....',
    '..G..G....',
    '.OO..OO...'
  ]);

  // Shiyan: Mafia boss attire — all black suit, sleek jet hair, and dark shades with reflection shine
  var SHIYAN_BODY = [
    '..HHHH....', // 0: Hair
    '.HHHHHH...', // 1: Hair
    '.HHKKHH...', // 2: Hair & Forehead skin
    '.SSSSSS...', // 3: Sunglasses top frame
    '.SLSSLS...', // 4: Sunglasses lenses (S = black shade, L = shine glint)
    '..KKKK....', // 5: Jaw / Chin
    '...KK.....', // 6: Neck
    '..CCCC....', // 7: Suit collar
    '.CCTCC....', // 8: Suit chest (T = lapel/tie accent)
    'DCCCCCCD..', // 9: Suit arms
    'DCCCCCCD..', // 10: Suit arms
    '.CCCCCC...', // 11: Suit waist
    '.GGGGGG...', // 12: Tailored black trousers
    '.GG..GG...', // 13: Legs
    '.GG..GG...', // 14: Legs
    '.OO..OO...'  // 15: Polished black shoes
  ];

  var SHIYAN_WALK_A = SHIYAN_BODY.slice(0, 12).concat([
    '.GGGGGG...',
    'GG....GG..',
    '.G....G...',
    'OO....OO..'
  ]);

  var SHIYAN_WALK_B = SHIYAN_BODY.slice(0, 12).concat([
    '.GGGGGG...',
    '..GGGG....',
    '..G..G....',
    '.OO..OO...'
  ]);

  var SHIYAN_COLORS = {
    H: '#090a0d', // Jet black hair
    K: '#f6d5b0', // Skin tone
    S: '#000000', // Jet black shades
    L: '#dbeafe', // Cool glass reflection shine
    C: '#111317', // Mafia black suit jacket
    D: '#07080b', // Suit cuff / shadows
    T: '#252932', // Dark charcoal lapel / tie
    G: '#14171e', // Black tailored pants
    O: '#07080a'  // Polished black dress shoes
  };

  var AGENT_DEFS = [
    { label: 'EXCEL', shirt: '#2e8b57', shade: '#257347', hair: '#2f2119', skin: '#f0c8a0' },
    { label: 'SQL', shirt: '#3f6fa8', shade: '#325a89', hair: '#1d1712', skin: '#c98d63' },
    { label: 'OPENCODE', shirt: '#0f0d0bff', shade: '#a15f2b', hair: '#4a3324', skin: '#8d5a3b' },
    { label: 'BI', shirt: '#7c5c9e', shade: '#64487f', hair: '#241b16', skin: '#e6b98e' }
  ];

  var layout = {
    w: 0, h: 0, p: 3, fy: 0, wallBase: 0,
    desks: [], coffeeX: 0, coffeeSpotX: 0,
    plantX: 0, plantSpotX: 0, windowSpotX: 0
  };

  var palette = null;
  var agents = [];
  var shiyan = {
    x: 0,
    destX: 0,
    state: 'observe', // 'walk' | 'observe'
    timer: 3.5,
    facing: 1, // 1 = right, -1 = left
    walkPhase: 0,
    hovered: false,
    spotIndex: 2
  };
  var particles = [];
  var elapsed = 0;
  var lastTime = 0;
  var raf = null;
  var running = false;
  var inView = true;
  var confettiTimer = 9;
  var night = false;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function rand(lo, hi) {
    return lo + Math.random() * (hi - lo);
  }

  function box(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function readPalette() {
    var cs = window.getComputedStyle(document.documentElement);
    function v(name, fallback) {
      var value = cs.getPropertyValue(name).trim();
      return value || fallback;
    }
    night = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      wall: v('--office-wall', '#efe8da'),
      wallShade: v('--office-wall-shade', '#e7ded0'),
      trim: v('--office-trim', '#d9cdb9'),
      floor: v('--office-floor', '#c9a26b'),
      floorShade: v('--office-floor-shade', '#c0965d'),
      desk: v('--office-desk', '#8a6a45'),
      deskDark: v('--office-desk-dark', '#6a4f33'),
      paper: v('--office-paper', '#f8f2e4'),
      plant: v('--office-plant', '#3f7d4f'),
      plantDark: v('--office-plant-dark', '#2f6340'),
      sky: v('--office-sky', '#bcdcef'),
      sun: v('--office-sun', '#f2c14e'),
      screen: v('--office-screen', '#1e2530'),
      chartA: v('--office-chart-a', '#2e8b57'),
      chartB: v('--office-chart-b', '#4d8fc4'),
      chartC: v('--office-chart-c', '#d9a441'),
      bubbleBg: v('--office-bubble-bg', '#fffdf6'),
      bubbleBorder: v('--office-bubble-border', '#2b2219'),
      bubbleText: v('--office-bubble-text', '#23272f')
    };
  }

  function computeLayout() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (!w || !h) return false;

    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    var p = clamp(Math.round(w / 170), 2, 4);
    layout.w = w;
    layout.h = h;
    layout.p = p;
    layout.fy = h - p * 6;
    layout.wallBase = Math.round(h * 0.5);
    layout.desks = [0.16, 0.385, 0.615, 0.845].map(function (f) {
      return Math.round(w * f);
    });
    layout.coffeeX = p * 10;
    layout.coffeeSpotX = p * 17;
    layout.plantX = w - p * 10;
    layout.plantSpotX = w - p * 17;
    layout.windowSpotX = Math.round((layout.desks[1] + layout.desks[2]) / 2);
    return true;
  }

  function getShiyanSpots() {
    if (!layout.desks || !layout.desks.length) return [];
    var p = layout.p;
    return [
      { x: Math.round(layout.desks[0] - p * 6), face: 1 },                 // Left of Desk 0 (DATA)
      { x: Math.round((layout.desks[0] + layout.desks[1]) / 2), face: 1 }, // Between Desk 0 & 1 (SQL)
      { x: layout.windowSpotX, face: -1 },                                 // Center under sign / window
      { x: Math.round((layout.desks[1] + layout.desks[2]) / 2), face: 1 }, // Between Desk 1 & 2 (ETL)
      { x: Math.round((layout.desks[2] + layout.desks[3]) / 2), face: 1 }, // Between Desk 2 & 3 (BI)
      { x: layout.plantSpotX, face: -1 },                                  // Right near plant & wall chart
      { x: layout.coffeeSpotX, face: 1 }                                   // Left near coffee station
    ];
  }

  function resetShiyan() {
    var spots = getShiyanSpots();
    shiyan.spotIndex = 2;
    shiyan.x = spots.length ? spots[2].x : Math.round(layout.w * 0.5);
    shiyan.destX = shiyan.x;
    shiyan.state = 'observe';
    shiyan.timer = rand(3, 5);
    shiyan.facing = -1;
    shiyan.walkPhase = 0;
    shiyan.hovered = false;
  }

  function resetAgents() {
    for (var i = 0; i < agents.length; i++) {
      var a = agents[i];
      a.homeX = layout.desks[i];
      a.x = a.homeX;
      a.desk = i;
      a.state = 'work';
      a.timer = rand(4, 9);
      a.bubbleTimer = rand(1.5, 4);
      a.bubbleTtl = 0;
      a.destX = a.homeX;
      a.returnHome = false;
      a.walkPhase = 0;
    }
    resetShiyan();
  }

  function createAgents() {
    agents = AGENT_DEFS.map(function (def, i) {
      return {
        def: def,
        desk: i,
        x: 0,
        homeX: 0,
        state: 'work',
        timer: rand(4, 9),
        bubbleTimer: rand(1.5, 4),
        bubbleTtl: 0,
        bubbleText: '',
        destX: 0,
        returnHome: false,
        walkPhase: 0
      };
    });
    resetAgents();
  }

  function updateShiyan(dt) {
    var p = layout.p;
    var spots = getShiyanSpots();
    if (!spots.length) return;

    if (shiyan.state === 'observe') {
      shiyan.timer -= dt;
      if (shiyan.timer <= 0) {
        var nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * spots.length);
        } while (nextIdx === shiyan.spotIndex && spots.length > 1);
        shiyan.spotIndex = nextIdx;
        shiyan.destX = spots[nextIdx].x;
        shiyan.state = 'walk';
        shiyan.facing = shiyan.destX > shiyan.x ? 1 : -1;
      }
      return;
    }

    if (shiyan.state === 'walk') {
      var step = p * 20 * dt;
      var dx = shiyan.destX - shiyan.x;
      if (Math.abs(dx) <= step) {
        shiyan.x = shiyan.destX;
        shiyan.state = 'observe';
        shiyan.timer = rand(3, 5);
        shiyan.facing = spots[shiyan.spotIndex].face;
      } else {
        shiyan.x += (dx > 0 ? step : -step);
        shiyan.walkPhase += dt * 8.5;
        shiyan.facing = dx > 0 ? 1 : -1;
      }
    }
  }

  function startBreak(a) {
    var spots = [layout.coffeeSpotX, layout.plantSpotX, layout.windowSpotX];
    a.destX = spots[Math.floor(Math.random() * spots.length)];
    a.returnHome = false;
    a.state = 'walk';
    a.bubbleTtl = 0;
  }

  function updateAgent(a, dt) {
    var p = layout.p;

    if (a.bubbleTtl > 0) a.bubbleTtl -= dt;

    if (a.state === 'work') {
      a.bubbleTimer -= dt;
      if (a.bubbleTimer <= 0) {
        a.bubbleText = a.def.label;
        a.bubbleTtl = 1.8;
        a.bubbleTimer = rand(4, 8);
      }
      a.timer -= dt;
      if (a.timer <= 0) {
        if (Math.random() < 0.45) {
          startBreak(a);
        } else {
          a.timer = rand(5, 9);
        }
      }
      return;
    }

    if (a.state === 'walk') {
      var step = p * 26 * dt;
      var dx = a.destX - a.x;
      if (Math.abs(dx) <= step) {
        a.x = a.destX;
        if (a.returnHome) {
          a.returnHome = false;
          a.state = 'work';
          a.timer = rand(5, 9);
        } else {
          a.state = 'break';
          a.timer = rand(2, 3.5);
        }
      } else {
        a.x += (dx > 0 ? step : -step);
        a.walkPhase += dt * 9;
      }
      return;
    }

    if (a.state === 'break') {
      a.timer -= dt;
      if (a.timer <= 0) {
        a.destX = a.homeX;
        a.returnHome = true;
        a.state = 'walk';
      }
    }
  }

  function spawnConfetti(a) {
    var p = layout.p;
    var colors = [palette.chartA, palette.chartB, palette.chartC, palette.sun, palette.plant];
    for (var i = 0; i < 14; i++) {
      particles.push({
        x: a.x + rand(-p * 5, p * 5),
        y: layout.fy - p * 19 + rand(-p * 2, p * 2),
        vx: rand(-p * 20, p * 20),
        vy: rand(-p * 34, -p * 8),
        g: p * 95,
        life: rand(0.8, 1.4),
        color: colors[i % colors.length]
      });
    }
  }

  function update(dt) {
    elapsed += dt;

    for (var i = 0; i < agents.length; i++) updateAgent(agents[i], dt);
    updateShiyan(dt);

    confettiTimer -= dt;
    if (confettiTimer <= 0) {
      var working = agents.filter(function (a) { return a.state === 'work'; });
      if (working.length) {
        var chosen = working[Math.floor(Math.random() * working.length)];
        chosen.bubbleText = 'SHIP';
        chosen.bubbleTtl = 1.8;
        chosen.bubbleTimer = rand(4, 7);
        spawnConfetti(chosen);
      }
      confettiTimer = rand(9, 17);
    }

    for (var k = particles.length - 1; k >= 0; k--) {
      var pt = particles[k];
      pt.life -= dt;
      if (pt.life <= 0) {
        particles.splice(k, 1);
        continue;
      }
      pt.vy += pt.g * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
    }
  }

  function drawText(text, x, y, p, color) {
    ctx.fillStyle = color;
    for (var i = 0; i < text.length; i++) {
      var glyph = FONT[text.charAt(i).toUpperCase()];
      if (!glyph) continue;
      var gx = Math.round(x + i * 4 * p);
      for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 3; c++) {
          if (glyph[r].charAt(c) === '1') {
            ctx.fillRect(gx + c * p, Math.round(y + r * p), p, p);
          }
        }
      }
    }
  }

  function paintSprite(map, colors, p) {
    for (var r = 0; r < map.length; r++) {
      var row = map[r];
      for (var c = 0; c < row.length; c++) {
        var color = colors[row.charAt(c)];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(c * p, r * p, p, p);
      }
    }
  }

  function drawSprite(map, colors, x, y, p, flip) {
    ctx.save();
    if (flip) {
      ctx.translate(Math.round(x) + map[0].length * p, Math.round(y));
      ctx.scale(-1, 1);
    } else {
      ctx.translate(Math.round(x), Math.round(y));
    }
    paintSprite(map, colors, p);
    ctx.restore();
  }

  function drawAgent(a, x, feetY, walking) {
    var p = layout.p;
    var map = BODY;
    var flip = false;
    if (walking) {
      flip = a.destX < a.x;
      map = (Math.floor(a.walkPhase) % 2 === 0) ? WALK_A : WALK_B;
    }
    drawSprite(map, {
      H: a.def.hair,
      K: a.def.skin,
      C: a.def.shirt,
      D: a.def.shade,
      G: '#2b2f3a',
      O: '#1b1e26',
      E: '#20242c'
    }, x - 5 * p, feetY - 16 * p, p, flip);
  }

  function drawBackground(time) {
    var L = layout;
    var p = L.p;
    var w = L.w;
    var h = L.h;

    box(0, 0, w, L.wallBase, palette.wall);
    for (var band = 0; band < w; band += p * 12) {
      box(band, 0, p * 2, L.wallBase, palette.wallShade);
    }
    box(0, L.wallBase - p * 2, w, p * 2, palette.trim);

    box(0, L.wallBase, w, h - L.wallBase, palette.floor);
    var tile = p * 5;
    var row = 0;
    for (var ty = L.wallBase; ty < h; ty += tile, row++) {
      var col = 0;
      for (var tx = 0; tx < w; tx += tile, col++) {
        if ((row + col) % 2 === 0) {
          box(tx, ty, Math.min(tile, w - tx), Math.min(tile, h - ty), palette.floorShade);
        }
      }
    }

    var ww = p * 26;
    var wh = p * 16;
    var wX = p * 3;
    var wY = p * 5;
    box(wX, wY, ww, wh, palette.deskDark);
    box(wX + p, wY + p, ww - 2 * p, wh - 2 * p, palette.sky);
    if (night) {
      box(wX + ww - p * 8, wY + p * 3, p * 2, p * 2, palette.paper);
      box(wX + p * 5, wY + p * 3, p, p, palette.paper);
      box(wX + p * 10, wY + p * 6, p, p, palette.paper);
      box(wX + p * 18, wY + p * 4, p, p, palette.paper);
    } else {
      box(wX + ww - p * 8, wY + p * 3, p * 3, p * 3, palette.sun);
    }
    box(wX + p * 3, wY + wh - p * 6, p * 5, p, palette.paper);
    box(wX + p * 4, wY + wh - p * 7, p * 3, p, palette.paper);
    box(wX + Math.round(ww / 2), wY + p, p, wh - 2 * p, palette.deskDark);
    box(wX + p, wY + Math.round(wh / 2), ww - 2 * p, p, palette.deskDark);

    var sign = 'SHIYAN // DATA OPS';
    var textW = sign.length * 4 * p - p;
    var sx = Math.round((w - textW) / 2);
    var sy = p * 6;
    box(sx - p * 2, sy - p * 2, textW + p * 4, p * 9, palette.deskDark);
    drawText(sign, sx, sy, p, palette.paper);

    var pw = p * 20;
    var ph = p * 13;
    var pX = w - p * 3 - pw;
    var pY = p * 6;
    box(pX, pY, pw, ph, palette.deskDark);
    box(pX + p, pY + p, pw - 2 * p, ph - 2 * p, palette.bubbleBg);
    var bars = [p * 3, p * 6, p * 4];
    var barColors = [palette.chartA, palette.chartB, palette.chartC];
    for (var b = 0; b < 3; b++) {
      box(pX + p * 3 + b * p * 5, pY + ph - p * 2 - bars[b], p * 3, bars[b], barColors[b]);
    }

    var cw = p * 9;
    var ch = p * 12;
    var cX = L.coffeeX - Math.round(cw / 2);
    var cY = L.fy - ch;
    box(cX, cY, cw, ch, palette.desk);
    box(cX + p, cY + p, cw - 2 * p, p * 4, palette.screen);
    box(cX + p * 2, cY + p * 2, p * 2, p, palette.chartA);
    box(cX + p * 2, cY + p * 4, p * 3, p, palette.chartB);
    box(cX + p * 2, L.fy - p * 4, p * 4, p, palette.deskDark);

    var steamH = p * 8;
    var steamY = cY - ((time * p * 14) % steamH);
    ctx.globalAlpha = 0.65;
    box(cX + p * 3, steamY, p, p * 2, palette.paper);
    box(cX + p * 5, steamY - p * 3, p, p * 2, palette.paper);
    ctx.globalAlpha = 1;

    var potW = p * 7;
    var potH = p * 4;
    var plX = L.plantX - Math.round(potW / 2);
    box(plX, L.fy - potH, potW, potH, palette.desk);
    box(plX + p, L.fy - potH, p, p, palette.deskDark);
    box(plX + p * 2, L.fy - potH - p * 6, p * 3, p * 6, palette.plantDark);
    box(plX + p * 3, L.fy - potH - p * 9, p * 2, p * 9, palette.plant);
    box(plX, L.fy - potH - p * 5, p * 3, p * 4, palette.plant);
    box(plX + p * 4, L.fy - potH - p * 6, p * 3, p * 5, palette.plantDark);
  }

  function drawDesk(cx, time, index) {
    var p = layout.p;
    var deskW = 20 * p;
    var topY = layout.fy - 9 * p;

    box(cx - deskW / 2, topY, deskW, 2 * p, palette.desk);
    box(cx - deskW / 2 + p, topY + 2 * p, deskW - 2 * p, 5 * p, palette.deskDark);
    box(cx - deskW / 2 + p, layout.fy - 2 * p, 2 * p, 2 * p, palette.deskDark);
    box(cx + deskW / 2 - 3 * p, layout.fy - 2 * p, 2 * p, 2 * p, palette.deskDark);

    box(cx - p * 8, topY - p * 2, p * 2, p * 2, palette.paper);

    var mw = 6 * p;
    var mh = 4 * p;
    var mx = cx + p * 3;
    var my = topY - mh;
    box(mx - p, my - p, mw + 2 * p, mh + p, palette.deskDark);
    box(mx, my, mw, mh, palette.screen);
    var charts = [palette.chartA, palette.chartB];
    for (var b = 0; b < 2; b++) {
      var hgt = p * (1 + ((Math.floor(time * 2 + b + index) % 2)));
      box(mx + p + b * 2 * p, my + mh - p - hgt, p, hgt, charts[b]);
    }
  }

  function drawBubble(a, still) {
    var text = still ? a.def.label : (a.bubbleTtl > 0 ? a.bubbleText : '');
    if (!text) return;

    var p = layout.p;
    var tp = Math.max(1, p <= 2 ? 1 : 2); // delicate font scale (not chunky/bold)
    var borderSize = 1;

    var textW = text.length * 4 * tp - tp;
    var bw = textW + 4 * tp + 2;
    var bh = 5 * tp + 4;
    var headTop = layout.fy - p - 16 * p;
    var bx = Math.round(a.homeX - bw / 2);
    var by = Math.round(headTop - bh - 2 * p);

    box(bx, by, bw, bh, palette.bubbleBorder);
    box(bx + borderSize, by + borderSize, bw - 2 * borderSize, bh - 2 * borderSize, palette.bubbleBg);
    drawText(text, bx + 2 * tp + 1, by + 2, tp, palette.bubbleText);

    // Subtle pointer
    var tipX = Math.round(a.homeX);
    box(tipX - 1, by + bh, 2, 2, palette.bubbleBorder);
  }

  function drawParticles() {
    var p = layout.p;
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      ctx.globalAlpha = clamp(pt.life * 1.4, 0, 1);
      box(pt.x, pt.y, p, p, pt.color);
    }
    ctx.globalAlpha = 1;
  }

  function drawScene(time, still) {
    drawBackground(time);

    var p = layout.p;
    for (var i = 0; i < layout.desks.length; i++) {
      var agent = agents[i];
      var seated = !!agent && (still || agent.state === 'work');
      if (seated) drawAgent(agent, agent.homeX, layout.fy - p, false);
      drawDesk(layout.desks[i], time, i);
      if (seated) drawBubble(agent, still);
    }

    if (!still) {
      for (var k = 0; k < agents.length; k++) {
        var a = agents[k];
        if (a.state !== 'work') {
          drawAgent(a, a.x, layout.fy - p, a.state === 'walk');
        }
      }
    }

    // Shiyan: Mafia Boss observing the office
    drawShiyan(still, time);

    drawParticles();
  }

  function drawShiyan(still, time) {
    var p = layout.p;
    var feetY = layout.fy - p;
    var walking = !still && shiyan.state === 'walk';
    var map = SHIYAN_BODY;
    if (walking) {
      map = (Math.floor(shiyan.walkPhase) % 2 === 0) ? SHIYAN_WALK_A : SHIYAN_WALK_B;
    }
    var flip = shiyan.facing < 0;
    drawSprite(map, SHIYAN_COLORS, shiyan.x - 5 * p, feetY - 16 * p, p, flip);

    // Speech bubble "CLICK ME" — sleek, non-bold font scale
    var text = 'CLICK ME';
    var tp = Math.max(1, p <= 2 ? 1 : 2);
    var borderSize = 1;

    var textW = text.length * 4 * tp - tp;
    var bw = textW + 4 * tp + 4;
    var bh = 5 * tp + 4;
    var headTop = feetY - 16 * p;
    var floatOffset = still ? 0 : Math.sin(time * 3.5) * (p * 0.7);
    var bx = Math.round(shiyan.x - bw / 2);
    bx = clamp(bx, p * 2, layout.w - bw - p * 2);
    var by = Math.round(headTop - bh - 3 * p + floatOffset);

    // Hover effect highlight
    var borderCol = shiyan.hovered ? (night ? '#e8b95a' : '#d9a441') : palette.bubbleBorder;
    var bgCol = shiyan.hovered ? (night ? '#262d3d' : '#ffffff') : palette.bubbleBg;
    var textCol = shiyan.hovered ? (night ? '#ffd778' : '#b27715') : palette.bubbleText;

    box(bx, by, bw, bh, borderCol);
    box(bx + borderSize, by + borderSize, bw - 2 * borderSize, bh - 2 * borderSize, bgCol);
    drawText(text, bx + 2 * tp + 2, by + 2, tp, textCol);

    // Delicate pointer notch beneath bubble pointing to Shiyan
    var tipX = clamp(Math.round(shiyan.x), bx + 4, bx + bw - 5);
    box(tipX - 1, by + bh, 2, 2, borderCol);

    if (shiyan.hovered) {
      box(bx + bw - 3, by + 2, 2, 2, borderCol);
    }
  }

  function getShiyanHitBox() {
    var p = layout.p;
    var tp = Math.max(1, p <= 2 ? 1 : 2);
    var bw = ('CLICK ME'.length * 4 * tp - tp) + 4 * tp + 4;
    var bh = 5 * tp + 4;
    var headTop = layout.fy - p - 16 * p;
    var bx = Math.round(shiyan.x - bw / 2);
    bx = clamp(bx, p * 2, layout.w - bw - p * 2);
    var by = headTop - bh - 4 * p;

    return {
      minX: Math.min(bx - p * 2, shiyan.x - 7 * p),
      maxX: Math.max(bx + bw + p * 2, shiyan.x + 7 * p),
      minY: by - p * 2,
      maxY: layout.fy + p * 2
    };
  }

  function isOverShiyan(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var mx = clientX - rect.left;
    var my = clientY - rect.top;
    var box = getShiyanHitBox();
    return mx >= box.minX && mx <= box.maxX && my >= box.minY && my <= box.maxY;
  }

  var SHIYAN_MODAL_ID = 'shiyan-modal';

  function openShiyanModal() {
    var modal = document.getElementById(SHIYAN_MODAL_ID);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('#shiyan-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeShiyanModal() {
    var modal = document.getElementById(SHIYAN_MODAL_ID);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (canvas) canvas.focus();
  }

  function initShiyanInteractions() {
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('role', 'button');
    canvas.setAttribute('aria-label', "Interactive pixel office — Click Shiyan to view introduction");

    canvas.addEventListener('mousemove', function (e) {
      if (isOverShiyan(e.clientX, e.clientY)) {
        if (!shiyan.hovered) {
          shiyan.hovered = true;
          canvas.style.cursor = 'pointer';
        }
      } else {
        if (shiyan.hovered) {
          shiyan.hovered = false;
          canvas.style.cursor = 'default';
        }
      }
    });

    canvas.addEventListener('mouseleave', function () {
      if (shiyan.hovered) {
        shiyan.hovered = false;
        canvas.style.cursor = 'default';
      }
    });

    canvas.addEventListener('click', function (e) {
      if (isOverShiyan(e.clientX, e.clientY)) {
        openShiyanModal();
      }
    });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) {
        var t = e.touches[0];
        if (isOverShiyan(t.clientX, t.clientY)) {
          e.preventDefault();
          openShiyanModal();
        }
      }
    }, { passive: false });

    canvas.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openShiyanModal();
      }
    });

    var modal = document.getElementById(SHIYAN_MODAL_ID);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('#shiyan-modal-close')) {
          closeShiyanModal();
        }
      });

      var viewProjects = modal.querySelector('#shiyan-view-projects');
      if (viewProjects) {
        viewProjects.addEventListener('click', function () {
          closeShiyanModal();
        });
      }

      var contactBtn = modal.querySelector('#shiyan-contact-btn');
      if (contactBtn) {
        contactBtn.addEventListener('click', function () {
          closeShiyanModal();
          setTimeout(function () {
            var nameField = document.getElementById('name');
            if (nameField) nameField.focus();
          }, 300);
        });
      }
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var m = document.getElementById(SHIYAN_MODAL_ID);
        if (m && m.classList.contains('is-open')) {
          closeShiyanModal();
        }
      }
    });

    window.openShiyanModal = openShiyanModal;
    window.closeShiyanModal = closeShiyanModal;
  }

  function render(time, still) {
    if (!palette || !layout.w) return;
    ctx.clearRect(0, 0, layout.w, layout.h);
    ctx.imageSmoothingEnabled = false;
    drawScene(time || 0, !!still);
  }

  function drawStatic() {
    render(0.4, true);
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - lastTime) / 1000, 0.06);
    lastTime = now;
    update(dt);
    render(elapsed, false);
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (reduceMotion || running) return;
    running = true;
    lastTime = window.performance.now();
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = null;
  }

  function sync() {
    if (!reduceMotion && inView && !document.hidden) start();
    else stop();
  }

  function handleResize() {
    if (!computeLayout()) return;
    resetAgents();
    particles.length = 0;
    if (reduceMotion) drawStatic();
    else render(elapsed, false);
  }

  function observe() {
    if ('ResizeObserver' in window) {
      new ResizeObserver(handleResize).observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', handleResize);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(canvas);
    }

    document.addEventListener('visibilitychange', sync);

    if (window.MutationObserver) {
      new MutationObserver(function () {
        palette = readPalette();
        if (reduceMotion) drawStatic();
        else render(elapsed, false);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
  }

  function init() {
    palette = readPalette();
    if (!computeLayout()) return;
    createAgents();
    initShiyanInteractions();
    if (reduceMotion) drawStatic();
    else render(elapsed, false);
    observe();
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

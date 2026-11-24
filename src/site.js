/* Private Chef website: motion engine and interactions.
   Motion: GSAP + ScrollTrigger, Lenis smooth scroll. Everything degrades:
   - reduce-motion: movement becomes a simple fade, no smooth scroll
   - low-end phone or data saver (.is-lite): no aurora drift, tilt, parallax or smooth scroll
   - motion library missing: all content shows, interactions still work */
(function () {
  'use strict';
  var d = document, h = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var conn = navigator.connection || {};
  var lite = !!(conn.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
    (!fine && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));
  if (lite) h.classList.add('is-lite');
  var G = window.gsap, ST = window.ScrollTrigger, lenis = null;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  /* ---------- Version switch (review only) ---------- */
  function setVer(v) {
    h.dataset.v = v;
    try { localStorage.setItem('pc-ver', v); } catch (e) {}
    $$('.review [data-ver]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.ver === v)); });
    if (ST) ST.refresh();
  }
  $$('.review [data-ver]').forEach(function (b) { b.addEventListener('click', function () { setVer(b.dataset.ver); }); });
  setVer(h.dataset.v || '1');

  /* ---------- Smooth scroll ---------- */
  if (G && ST) {
    G.registerPlugin(ST);
    if (!reduce && !lite && window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
      lenis.on('scroll', ST.update);
      G.ticker.add(function (t) { lenis.raf(t * 1000); });
      G.ticker.lagSmoothing(0);
    }
  }

  /* ---------- Nav: hide on scroll down, return on scroll up, darken over dark grounds ---------- */
  var nav = $('[data-nav]'), menuOpen = false, lastY = window.scrollY;
  var darks = $$('.g-cocoa, .g-palm, .g-ink, .band, [data-ground="dark"]').filter(function (el) { return !el.closest('.menu'); });
  function onScroll() {
    var y = window.scrollY;
    if (!menuOpen) {
      if (y > lastY + 4 && y > 140) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 140) nav.classList.remove('is-hidden');
    }
    lastY = y;
    var probe = 40, dark = false;
    for (var i = 0; i < darks.length; i++) {
      var r = darks[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) { dark = true; break; }
    }
    nav.classList.toggle('is-dark', dark || menuOpen);
  }
  if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Every page opens at the top, unless the link points at a section on it (e.g. chefs.html#apply).
     Browsers and the preview frame otherwise restore the previous scroll position. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (ST && ST.clearScrollMemory) ST.clearScrollMemory('manual');
  function startPosition() {
    var id = location.hash.slice(1), el = id && d.getElementById(id);
    if (el) { if (lenis) lenis.scrollTo(el, { offset: -90, immediate: true }); else el.scrollIntoView(); return; }
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0); h.scrollTop = 0; d.body.scrollTop = 0;
  }
  var moved = false; // don't jump back if the visitor already started scrolling
  ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, function () { moved = true; }, { once: true, passive: true }); });
  startPosition();
  window.addEventListener('load', function () { if (!moved) startPosition(); if (ST) ST.refresh(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) startPosition(); });

  /* Hover blob that slides between nav links */
  var links = $('.nav__links');
  if (links && fine) {
    var blob = d.createElement('span'); blob.className = 'nav__blob'; links.appendChild(blob);
    $$('.nav__link', links).forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        blob.style.width = a.offsetWidth + 'px'; blob.style.transform = 'translateX(' + a.offsetLeft + 'px)'; blob.style.opacity = '1';
      });
    });
    links.addEventListener('pointerleave', function () { blob.style.opacity = '0'; });
  }

  /* ---------- Mobile menu ---------- */
  var menu = $('#menu'), menuBtn = $('.nav__menu'), menuTimer;
  function setMenu(open) {
    menuOpen = open; clearTimeout(menuTimer);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    h.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false; nav.classList.remove('is-hidden');
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      if (lenis) lenis.stop(); else h.style.overflow = 'hidden';
      setTimeout(function () { var a = $('.menu__links a', menu); if (a) a.focus({ preventScroll: true }); }, 300);
    } else {
      menu.classList.remove('is-open');
      if (lenis) lenis.start(); else h.style.overflow = '';
      menuTimer = setTimeout(function () { menu.hidden = true; }, 650);
    }
    onScroll();
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); }
      if (e.key === 'Tab' && menuOpen) { // keep focus inside the nav button and the menu
        var f = [menuBtn].concat($$('a, button', menu)); var i = f.indexOf(d.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    matchMedia('(min-width: 981px)').addEventListener('change', function (m) { if (m.matches && menuOpen) setMenu(false); });
  }

  /* ---------- Page transitions: brief Ember wipe ---------- */
  if (h.classList.contains('is-arriving')) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-arrived'); }); });
    setTimeout(function () { h.classList.remove('is-arriving', 'is-arrived'); }, 1000);
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return; // internal pages only
    var here = location.pathname.split('/').pop() || 'index.html';
    if (href.split('#')[0] === here) { if (menuOpen) setMenu(false); return; }
    if (reduce) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    try { sessionStorage.setItem('pc-wipe', '1'); } catch (err) {}
    h.classList.add('is-leaving');
    setTimeout(function () { if (lenis) lenis.stop(); window.scrollTo(0, 0); location.href = href; }, 520);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) h.classList.remove('is-leaving'); });

  /* ---------- Split headlines into masked words ---------- */
  function split(el) {
    var out = d.createDocumentFragment();
    function words(text, cls) {
      text.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { out.appendChild(d.createTextNode(' ')); return; }
        var o = d.createElement('span'); o.className = 'w';
        var i = d.createElement('span'); i.className = 'w__i' + (cls ? ' ' + cls : ''); i.textContent = w;
        o.appendChild(i); out.appendChild(o);
      });
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) words(n.textContent);
      else if (n.nodeName === 'BR') out.appendChild(n.cloneNode());
      else if (n.nodeType === 1) words(n.textContent, n.className);
    });
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.textContent = ''; el.appendChild(out);
    $$('.w', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
  }

  /* ---------- Motion ---------- */
  var arriving = h.classList.contains('is-arriving');
  function inFirstScreen(el) { return el.getBoundingClientRect().top < window.innerHeight * 0.9; }

  function initMotion() {
    $$('[data-split]').forEach(split);
    h.classList.add('motion-ready');

    $$('[data-split]').forEach(function (el) {
      var first = inFirstScreen(el);
      if (reduce) { G.from(el, { opacity: 0, duration: 0.6 }); return; }
      G.from($$('.w__i', el), {
        yPercent: 115, rotate: 4, duration: 1.15, ease: 'expo.out', stagger: 0.055,
        delay: first ? (arriving ? 0.45 : 0.1) : 0,
        scrollTrigger: first ? null : { trigger: el, start: 'top 88%', once: true }
      });
    });

    var rv = $$('[data-reveal]');
    G.set(rv, { opacity: 0, y: reduce ? 0 : 28 });
    ST.batch(rv, {
      start: 'top 92%', once: true,
      onEnter: function (b) { G.to(b, { opacity: 1, y: 0, duration: reduce ? 0.6 : 1.1, ease: 'expo.out', stagger: 0.09, delay: arriving && inFirstScreen(b[0]) ? 0.5 : 0 }); }
    });

    $$('[data-unmask]').forEach(function (el) {
      var img = $('img', el), first = inFirstScreen(el);
      if (reduce) { el.style.clipPath = 'none'; G.from(el, { opacity: 0, duration: 0.8 }); return; }
      var tl = G.timeline({ delay: first ? (arriving ? 0.5 : 0.15) + (+el.dataset.delay || 0) : 0, scrollTrigger: first ? null : { trigger: el, start: 'top 85%', once: true } });
      tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', onComplete: function () { el.style.clipPath = 'none'; } });
      if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.1);
    });

    if (!reduce && !lite) $$('[data-speed]').forEach(function (el) {
      var s = parseFloat(el.dataset.speed);
      G.to(el, { y: function () { return -s * window.innerHeight * 0.4; }, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });

    $$('[data-count]').forEach(function (el) {
      var to = parseFloat(el.dataset.count), o = { v: 0 }, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      var fmt = function (v) { return pre + Math.round(v).toLocaleString('en-NG') + suf; };
      el.textContent = fmt(reduce ? to : 0);
      if (reduce) return;
      G.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });

    if (fine && !reduce) $$('.js-magnet').forEach(function (b) {
      var x = G.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), y = G.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.25); y((e.clientY - r.top - r.height / 2) * 0.35); });
      b.addEventListener('pointerleave', function () { x(0); y(0); });
    });

    if (fine && !reduce && !lite) $$('.js-tilt').forEach(function (c) {
      var rx = G.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = G.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3' });
      G.set(c, { transformPerspective: 900 });
      if (!$('.sheen', c)) { var s = d.createElement('span'); s.className = 'sheen'; c.appendChild(s); }
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        rx((0.5 - py) * 10); ry((px - 0.5) * 12);
        c.style.setProperty('--sx', px * 100 + '%'); c.style.setProperty('--sy', py * 100 + '%');
      });
      c.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });

    // Fonts change line heights; recalculate trigger positions once they're in
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ST.refresh(); });
    window.addEventListener('load', function () { ST.refresh(); });
  }

  /* ---------- First-visit intro: the chef loader ----------
     The client's logo spins in -> plays while the page loads (spinner arcs, steam and spice from
     the cloche, a coin-flip every few seconds, badge orbits, pointer tilts her, a tap spins her and
     throws spice) -> "Dinner is served": a double spin, spice explodes, the panel lifts away on a
     curve and the hero animates in underneath. */
  var Intro = (function () {
    var L = $('[data-loader]');
    if (!L) return null;
    var chef = $('.loader__chef', L), canvas = $('.loader__spice', L), ctx = canvas && canvas.getContext('2d');
    var num = $('[data-ld-num]', L), line = $('[data-ld-line]', L), skip = $('[data-ld-skip]', L);
    var flt = $('.loader__float', L), steam = $('.loader__steam', L), ringEl = $('.loader__ring', L);
    var arcA = $('.loader__arc--a', L), arcB = $('.loader__arc--b', L);
    var LINES = ['Warming up the kitchen', 'Grinding fresh ata rodo', 'Sharpening the knives', 'Stirring the jollof', 'Tasting for salt', 'Plating up'];
    var COLORS = ['#E5683F', '#C8431A', '#F2B441', '#8E2A0B', '#1F6B4A', '#F3E9DD'];

    /* spice particles on a canvas: round flecks, chilli slivers and little leaves */
    var parts = [], raf = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { if (!canvas) return; canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; }
    function burst(x, y, n, power) {
      if (!ctx) return;
      n = lite ? Math.round(n / 2) : n;
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5, v = (0.35 + Math.random()) * power;
        parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 2 + Math.random() * 4.5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
          kind: Math.random() < 0.3 ? 1 : (Math.random() < 0.15 ? 2 : 0), c: COLORS[(Math.random() * COLORS.length) | 0], life: 1 });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(function (p) { return p.life > 0 && p.y < innerHeight + 40; });
      parts.forEach(function (p) {
        p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.0085;
        ctx.save(); ctx.globalAlpha = Math.max(p.life, 0); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
        ctx.beginPath();
        if (p.kind === 1) ctx.ellipse(0, 0, p.r * 2.4, p.r * 0.8, 0, 0, Math.PI * 2);          // chilli sliver
        else if (p.kind === 2) { ctx.moveTo(0, -p.r * 2); ctx.quadraticCurveTo(p.r * 1.6, 0, 0, p.r * 2); ctx.quadraticCurveTo(-p.r * 1.6, 0, 0, -p.r * 2); } // leaf
        else ctx.arc(0, 0, p.r, 0, Math.PI * 2);                                                  // fleck
        ctx.fill(); ctx.restore();
      });
      raf = parts.length ? requestAnimationFrame(tick) : 0;
      if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    // a point on the logo, as fractions of its width and height (the cloche sits at about 0.80, 0.42)
    function pt(nx, ny) { var r = chef.getBoundingClientRect(); return { x: r.left + nx * r.width, y: r.top + ny * r.height }; }

    var loops = [], tl = null, done = null, running = false, leaving = false, shown = 0, t0 = 0, lastT = 0, lineI = 0, lineT = 0, onTick = null;

    function progress() {
      // real progress: first-screen images and fonts; time keeps it honest (min 2.6 s, max 6 s)
      var imgs = $$('img').filter(function (i) { return i.loading !== 'lazy'; });
      var ok = imgs.filter(function (i) { return i.complete; }).length;
      var real = d.readyState === 'complete' ? 1 : 0.2 + 0.7 * (imgs.length ? ok / imgs.length : 1);
      var t = (performance.now() - t0) / 1000;
      if (t > 6) real = 1;
      return Math.min(real, t / 2.6);
    }

    function play(cb) {
      if (running) return; running = true; leaving = false; done = cb || function () {};
      h.classList.add('intro'); L.classList.remove('is-fading'); L.style.removeProperty('--curve');
      try { sessionStorage.setItem('pc-intro', '1'); } catch (e) {}
      if (lenis) lenis.stop();
      skip.tabIndex = 0; t0 = performance.now(); lastT = 0; shown = 0; lineI = 0; lineT = 0; num.textContent = '0'; line.textContent = LINES[0];
      size();

      if (!G || reduce) { // simple and calm: count up, then fade
        var iv = setInterval(function () {
          shown = Math.min(100, Math.round(progress() * 100)); num.textContent = shown;
          if (shown >= 100) { clearInterval(iv); line.textContent = 'Dinner is served'; L.classList.add('is-fading'); setTimeout(finish, 520); }
        }, 80);
        return;
      }
      tl = G.timeline();
      tl.from('.loader__aura', { opacity: 0, scale: 0.5, duration: 1.4, ease: 'expo.out' }, 0)
        .from(flt, { scale: 0.15, rotation: -540, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.1)   // she spins in
        .from(ringEl, { scale: 0.5, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.35)
        .from('.loader__orbit', { opacity: 0, scale: 0.7, rotation: -60, duration: 1.4, ease: 'expo.out' }, 0.3)
        .from('.loader__meta > *', { y: 24, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out' }, 0.5)
        .from(skip, { opacity: 0, duration: 0.6 }, 0.8);

      loops = [
        G.to('.loader__orbit', { rotation: 360, duration: 16, ease: 'none', repeat: -1 }),
        // spinner arcs lap around her while the page loads
        G.to(arcA, { rotation: 360, svgOrigin: '100 100', duration: 1.1, ease: 'none', repeat: -1 }),
        G.to(arcB, { rotation: -360, svgOrigin: '100 100', duration: 7, ease: 'none', repeat: -1 }),
        G.to(flt, { y: -14, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 }),
        G.to(chef, { rotation: 3.5, transformOrigin: '50% 90%', duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 }),
        // a coin-flip every few seconds
        G.timeline({ repeat: -1, repeatDelay: 2.2, delay: 2.4 }).to(chef, { rotationY: 360, duration: 0.9, ease: 'power3.inOut' }).set(chef, { rotationY: 0 }),
        // steam and a pinch of spice from the cloche
        G.timeline({ repeat: -1, repeatDelay: 0.5, delay: 1.7 })
          .call(function () { var p = pt(0.8, 0.42); burst(p.x, p.y, 12, 6.5); })
          .fromTo(steam, { opacity: 0, y: 10 }, { opacity: 0.9, y: -10, duration: 0.5 })
          .to(steam, { opacity: 0, y: -36, duration: 0.8 })
      ];

      // pointer: she leans towards you in 3D; a tap anywhere throws spice
      var tilt = $('.loader__tilt', L);
      if (fine && !lite) {
        var rx = G.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = G.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'power3' });
        L.onpointermove = function (e) { ry((e.clientX / innerWidth - 0.5) * 26); rx(-(e.clientY / innerHeight - 0.5) * 18); };
      }
      L.onpointerdown = function (e) {
        if (e.target.closest('[data-ld-skip]')) return;
        burst(e.clientX, e.clientY, 34, 11);
        if (!G.isTweening(flt)) G.to(flt, { rotation: '+=360', duration: 0.8, ease: 'back.out(1.6)' }); // a tap spins her
        G.fromTo('.loader__center', { scale: 1 }, { scale: 1.05, duration: 0.12, yoyo: true, repeat: 1 });
      };

      onTick = function () {
        if (leaving) return;
        var now = performance.now(), dt = Math.min((now - (lastT || now)) / 1000, 0.1); lastT = now;
        var target = progress() * 100;
        // time-based, so slow phones still finish on time: ease towards the target, never slower than 45% a second
        shown = Math.min(target, shown + Math.max((target - shown) * 5 * dt, 45 * dt));
        if (now - t0 > 7000) shown = 100;
        num.textContent = Math.floor(shown);
        var lt = Math.floor((performance.now() - t0) / 650) % LINES.length;
        if (lt !== lineT) { lineT = lt; line.textContent = LINES[lt]; G.fromTo(line, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }); }
        if (shown >= 100) leave();
      };
      G.ticker.add(onTick);
    }

    function leave() {
      if (leaving || !running) return; leaving = true;
      G.ticker.remove(onTick);
      num.textContent = '100'; line.textContent = 'Dinner is served';
      loops.forEach(function (l) { l.kill(); }); loops = [];
      if (tl) tl.progress(1);
      G.timeline({ onComplete: finish })
        .to(flt, { rotation: '+=720', scale: 1.12, duration: 1, ease: 'power3.inOut' }, 0)    // a big double spin
        .call(function () { var p = pt(0.8, 0.42); burst(p.x, p.y, 90, 15); }, null, 0.35)
        .fromTo(steam, { opacity: 0, y: 0 }, { opacity: 1, y: -30, duration: 0.5 }, 0.3)
        .to(ringEl, { scale: 1.5, opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.2)
        .to('.loader__center', { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }, 0.3)
        .to(line, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 }, 0)
        .call(function () { var cb = done; done = null; if (cb) cb(); }, null, 1) // hero starts as the panel lifts
        .to(L, { yPercent: -108, '--curve': '24vh', duration: 1, ease: 'expo.inOut' }, 0.9);
    }

    function finish() {
      running = false;
      h.classList.remove('intro'); skip.tabIndex = -1;
      if (G) G.set([L, '.loader__center', '.loader__tilt', '.loader__orbit', '.loader__meta > *', skip, flt, chef, steam, ringEl, arcA, arcB], { clearProps: 'all' });
      L.classList.remove('is-fading'); L.onpointermove = L.onpointerdown = null;
      if (lenis) lenis.start();
      if (done) { var cb = done; done = null; cb(); }
    }

    skip.addEventListener('click', function () { if (!G || reduce) { L.classList.add('is-fading'); setTimeout(finish, 400); } else leave(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && running) skip.click(); });
    window.addEventListener('resize', size);
    return { play: play, active: function () { return h.classList.contains('intro'); } };
  })();

  /* ---------- Market map (For chefs): tap a market to see its route and details ---------- */
  $$('[data-mmap]').forEach(function (m) {
    var chips = $$('.mm-chip', m), body = $('.mm-sheet__body', m), auto = null, cur = null;
    function show(k, user) {
      if (user && auto) { clearInterval(auto); auto = null; }
      if (k === cur) return; cur = k;
      chips.forEach(function (c) { c.setAttribute('aria-checked', String(c.dataset.mm === k)); });
      $$('[data-mm-pin]', m).forEach(function (p) { p.classList.toggle('is-on', p.dataset.mmPin === k); });
      $$('[data-mm-route]', m).forEach(function (r) {
        r.classList.remove('is-on');
        if (r.dataset.mmRoute === k) { void r.getBoundingClientRect(); r.classList.add('is-on'); }
      });
      var t = $('[data-mm-info="' + k + '"]', m);
      body.innerHTML = t ? t.innerHTML : '';
      body.classList.remove('is-swap'); void body.offsetWidth; body.classList.add('is-swap');
    }
    chips.forEach(function (c, i) {
      c.addEventListener('click', function () { show(c.dataset.mm, true); });
      c.addEventListener('keydown', function (e) { // arrow keys move between markets, like a radio group
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = chips[(i + d + chips.length) % chips.length]; n.focus(); show(n.dataset.mm, true);
      });
    });
    $$('[data-mm-pin]', m).forEach(function (p) { p.addEventListener('click', function () { show(p.dataset.mmPin, true); }); });
    show(chips[0].dataset.mm);
    // gently tour the markets until someone taps one, only while the map is on screen
    if (!reduce && 'IntersectionObserver' in window) {
      var touched = false;
      m.addEventListener('pointerdown', function () { touched = true; if (auto) { clearInterval(auto); auto = null; } });
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !auto && !touched) {
          auto = setInterval(function () {
            var i = chips.findIndex(function (c) { return c.dataset.mm === cur; });
            show(chips[(i + 1) % chips.length].dataset.mm);
          }, 4200);
        } else if (!es[0].isIntersecting && auto) { clearInterval(auto); auto = null; }
      }, { threshold: 0.4 }).observe(m);
    }
  });

  /* ---------- Spicy footer ----------
     Heat lamp over the giant wordmark, a burst of spice on tap (only then: no ambient
     flying spice, by request), magnetic social icons. Runs only while the footer is on screen. */
  (function () {
    var F = $('[data-spicy]'); if (!F) return;
    var word = $('.foot__word', F), cv = $('.foot__spice', F), cx = cv && cv.getContext('2d');
    var COLORS = ['#E5683F', '#C8431A', '#F2B441', '#8E2A0B', '#21A06A'];
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, parts = [], on = false, raf = 0;
    var heat = { x: -0.5, y: 0.5, r: 0, tx: -0.5, ty: 0.5, tr: 0 }, lastMove = 0, sweepT = 0;

    function size() { if (!cv) return; var r = F.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; }
    function add(x, y, vx, vy, kind, life, r) {
      parts.push({ x: x, y: y, vx: vx, vy: vy, kind: kind, life: life, max: life, r: r || 1.5 + Math.random() * 3,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, c: COLORS[(Math.random() * COLORS.length) | 0], seed: Math.random() * 10 });
    }
    function burst(x, y, n, power) {
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6, v = (0.4 + Math.random()) * power;
        add(x, y, Math.cos(a) * v, Math.sin(a) * v, Math.random() < 0.35 ? 1 : 0, 90 + Math.random() * 50, 2 + Math.random() * 4);
      }
    }
    function local(e) { var r = F.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

    function frame(t) {
      raf = on ? requestAnimationFrame(frame) : 0;
      // heat lamp: follow the pointer, or sweep slowly when nobody is pointing (touch, idle)
      if (performance.now() - lastMove > 2600 && !reduce) {
        sweepT += 0.0045; heat.tx = 0.5 + Math.sin(sweepT) * 0.55; heat.ty = 0.5 + Math.sin(sweepT * 2.3) * 0.15; heat.tr = 220;
      }
      heat.x += (heat.tx - heat.x) * 0.08; heat.y += (heat.ty - heat.y) * 0.08; heat.r += (heat.tr - heat.r) * 0.08;
      word.style.setProperty('--hx', (heat.x * 100).toFixed(2) + '%');
      word.style.setProperty('--hy', (heat.y * 100).toFixed(2) + '%');
      word.style.setProperty('--hr', heat.r.toFixed(1) + 'px');
      if (!cx || reduce) return;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      parts = parts.filter(function (p) { return p.life > 0 && p.y > -20 && p.y < H + 30; });
      parts.forEach(function (p) {
        p.life--;
        if (p.kind === 2) { p.vx += Math.sin((t / 600) + p.seed) * 0.02; } else { p.vy += 0.22; p.vx *= 0.985; }
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        var k = p.life / p.max;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
        if (p.kind === 2) { // glowing ember
          var flick = 0.55 + 0.45 * Math.sin(t / 90 + p.seed * 7);
          cx.globalAlpha = Math.min(1, k * 1.6) * flick; cx.fillStyle = p.c;
          cx.shadowColor = '#E5683F'; cx.shadowBlur = 10;
          cx.beginPath(); cx.arc(0, 0, p.r, 0, Math.PI * 2); cx.fill();
        } else {            // spice: flecks and chilli slivers
          cx.globalAlpha = Math.min(1, k * 2); cx.fillStyle = p.c; cx.beginPath();
          if (p.kind === 1) cx.ellipse(0, 0, p.r * 2.3, p.r * 0.75, 0, 0, Math.PI * 2); else cx.arc(0, 0, p.r, 0, Math.PI * 2);
          cx.fill();
        }
        cx.restore();
      });
    }
    function start() { if (on) return; on = true; size(); raf = requestAnimationFrame(frame); }
    function stop() { on = false; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { rootMargin: '80px' }).observe(F);
    else start();
    window.addEventListener('resize', function () { if (on) size(); });

    // pointer: the heat lamp follows
    F.addEventListener('pointermove', function (e) {
      lastMove = performance.now();
      var r = word.getBoundingClientRect();
      heat.tx = (e.clientX - r.left) / r.width; heat.ty = (e.clientY - r.top) / r.height;
      heat.tr = e.clientY > r.top - 140 ? 280 : 170;   // bigger lamp when you are over the letters
    });
    F.addEventListener('pointerleave', function () { heat.tr = 0; lastMove = performance.now(); });
    // tap anywhere that is not a link: a burst of spice (and a flare of heat)
    F.addEventListener('pointerdown', function (e) {
      if (reduce || e.target.closest('a, button, input')) return;
      var p = local(e); burst(p.x, p.y, 40, 9); heat.r = 420;
    });
    // the footer chef: spins on hover (CSS) and throws a little spice
    var chef = $('.logo__chef', F);
    if (chef) chef.closest('a').addEventListener('pointerenter', function () {
      if (reduce) return; var r = chef.getBoundingClientRect(), f = F.getBoundingClientRect();
      burst(r.left - f.left + r.width / 2, r.top - f.top + r.height / 3, 18, 6);
    });
    // social icons pull towards the pointer
    if (fine && !reduce && G) $$('.socials a', F).forEach(function (a) {
      var mx = G.quickTo(a, 'x', { duration: 0.4, ease: 'power3' }), my = G.quickTo(a, 'y', { duration: 0.4, ease: 'power3' });
      a.addEventListener('pointermove', function (e) { var r = a.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.45); my((e.clientY - r.top - r.height / 2) * 0.45); });
      a.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  })();

  $$('[data-replay-intro]').forEach(function (b) {
    b.addEventListener('click', function () { if (!Intro) return; window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true }); Intro.play(); });
  });

  if (G && ST) {
    if (Intro && Intro.active()) { arriving = true; Intro.play(initMotion); } // hero animates in as the loader lifts
    else initMotion();
  } else {
    if (Intro && Intro.active()) Intro.play();
    h.classList.add('motion-off');
    $$('[data-count]').forEach(function (el) { el.textContent = (el.dataset.prefix || '') + (+el.dataset.count).toLocaleString('en-NG') + (el.dataset.suffix || ''); });
  }

  /* ---------- Accordions: smooth open, plus turns into a cross ---------- */
  $$('details.qa').forEach(function (q) {
    var sum = $('summary', q), body = $('.qa__a', q);
    sum.addEventListener('click', function (e) {
      if (reduce || !G) return;
      e.preventDefault();
      if (q.open) {
        q.classList.remove('is-open');
        G.to(body, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete: function () { q.open = false; G.set(body, { clearProps: 'all' }); if (ST) ST.refresh(); } });
      } else {
        var group = q.closest('[data-accordion]');
        if (group) $$('details.qa[open]', group).forEach(function (o) { if (o !== q) $('summary', o).click(); });
        q.open = true; q.classList.add('is-open');
        G.fromTo(body, { height: 0, opacity: 0 }, { height: body.scrollHeight, opacity: 1, duration: 0.5, ease: 'power3.out', onComplete: function () { G.set(body, { clearProps: 'all' }); if (ST) ST.refresh(); } });
      }
    });
    if (q.open) q.classList.add('is-open');
    q.addEventListener('toggle', function () { q.classList.toggle('is-open', q.open); });
  });

  /* ---------- Forms: waitlist, chef application, contact ---------- */
  function check(f) {
    var wrap = f.closest('.pc-field'); if (!wrap) return true;
    var help = $('.pc-field__help', wrap), box = $('.pc-input', wrap), msg = '', v = f.value.trim();
    if (f.required && !v) msg = wrap.dataset.empty || 'Fill this in';
    else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Add the end of the address, like .com';
    else if (f.type === 'tel' && v && v.replace(/\D/g, '').length < 10) msg = 'Enter the 10 digits after +234';
    else if (f.tagName === 'TEXTAREA' && f.required && v.length < 10) msg = 'Tell us a little more, at least 10 characters';
    if (box) { box.classList.remove('is-error'); if (msg) { void box.offsetWidth; box.classList.add('is-error'); } }
    if (help) {
      if (msg) { help.hidden = false; help.classList.add('is-error'); help.lastChild.textContent = msg; f.setAttribute('aria-invalid', 'true'); }
      else { help.hidden = true; f.removeAttribute('aria-invalid'); }
    }
    return !msg;
  }
  $$('[data-form]').forEach(function (root) {
    var form = $('form', root), done = $('.done', root), seg = $('.pc-seg', root);
    var opts = $$('.pc-seg__opt', root);
    function setPath(p) {
      var i = p === 'chef' ? 1 : 0; root.dataset.path = p;
      opts.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === i)); });
      if (seg) seg.style.setProperty('--i', i);
      $$('[data-for="chef"]', root).forEach(function (el) { el.hidden = !i; $$('input,select', el).forEach(function (f) { f.required = !!i; }); });
      $$('[data-for="client"]', root).forEach(function (el) { el.hidden = !!i; });
      var t = $('[data-title]', root); if (t) t.textContent = i ? t.dataset.chef : t.dataset.client;
      var s = $('.js-submit', root); if (s && s.dataset.chef) s.firstChild.textContent = (i ? s.dataset.chef : s.dataset.client) + ' ';
      updateProgress();
    }
    opts.forEach(function (o, i) { o.addEventListener('click', function () { setPath(i ? 'chef' : 'client'); }); });
    var bar = $('.progress i', root);
    function updateProgress() {
      if (!bar) return;
      var fs = $$('input,select,textarea', form).filter(function (f) { return f.required && !f.closest('[hidden]'); });
      var n = fs.filter(function (f) { return f.value.trim(); }).length;
      bar.style.transform = 'scaleX(' + (fs.length ? n / fs.length : 0) + ')';
    }
    $$('input,select,textarea', form).forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) check(f); updateProgress(); });
      f.addEventListener('change', updateProgress);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      $$('input,select,textarea', form).forEach(function (f) { if (f.closest('[hidden]')) return; if (!check(f)) { ok = false; first = first || f; } });
      if (!ok) { first.focus(); return; }
      var btn = $('.js-submit', form); btn.classList.add('is-loading');
      setTimeout(function () {
        btn.classList.remove('is-loading');
        var nm = $('[name=name]', form), name = nm ? (nm.value.trim().split(/\s+/)[0] || 'there') : 'there';
        var chef = root.dataset.path === 'chef', kind = root.dataset.form;
        var t = $('h3', done), p = $('p', done), share = $('.share', done);
        if (kind === 'contact') { t.textContent = 'Thanks, ' + name + '. Message received.'; p.textContent = 'We reply within 2 hours in support hours. Check your email for a copy.'; }
        else if (chef) { t.textContent = 'Thanks, ' + name + '. We’ll be in touch.'; p.textContent = 'Our team will reach out to start your verification. Your 30 free days begin when your profile goes live.'; }
        else { t.textContent = 'You’re on the list, ' + name + '.'; p.textContent = 'We’ll email you the moment bookings open in Lagos. Share your link to move up the list.'; }
        if (share) share.hidden = chef || kind === 'contact';
        form.hidden = true; if (seg) seg.hidden = true; done.hidden = false;
        if (bar) bar.style.transform = 'scaleX(1)';
        done.setAttribute('tabindex', '-1'); done.focus({ preventScroll: true });
        if (ST) ST.refresh();
      }, 900);
    });
    var copy = $('.js-copy', root);
    if (copy) copy.addEventListener('click', function () {
      var t = $('.share span', root).textContent, label = copy.lastChild;
      var after = function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(after, after); else after();
    });
    var again = $('.js-again', root);
    if (again) again.addEventListener('click', function () { form.reset(); form.hidden = false; if (seg) seg.hidden = false; done.hidden = true; updateProgress(); });
    var start = new URLSearchParams(location.search).get('as') || (location.hash === '#chef' ? 'chef' : null);
    if (opts.length) setPath(start === 'chef' ? 'chef' : 'client');
  });

  /* App buttons: in v1 the apps aren't live yet, so they lead to the waitlist */
  $$('[data-app]').forEach(function (a) {
    a.addEventListener('click', function (e) { if (h.dataset.v === '1') { e.preventDefault(); location.href = 'join.html'; } else e.preventDefault(); });
  });

  window.PC = { G: G, ST: ST, lenis: lenis, reduce: reduce, fine: fine, lite: lite, $: $, $$: $$ };

  /* ===================== Pages ===================== */

  /* Service switch: Chef at Home / Cook & Deliver (Home, How it works) */
  $$('[data-svc]').forEach(function (stage) {
    var sec = stage.closest('section'), seg = $('.pc-seg', sec), tabs = $$('[role="tab"]', seg);
    function show(i) {
      seg.style.setProperty('--i', i);
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      $$('[role="tabpanel"]', stage).forEach(function (p, j) { p.hidden = j !== i; });
      $$('[data-i]', stage).forEach(function (el) { el.classList.toggle('is-on', +el.dataset.i === i); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length; show(n); tabs[n].focus(); }
      });
    });
    show(0);
  });

  /* Curved marquee: glides along the curve; speed follows scroll speed */
  $$('.mq').forEach(function (mq) {
    var tp = $('textPath', mq), text = $('text', mq), run = 0, off = 0, boost = 0, visible = false, last = 0;
    function measure() { run = text.getComputedTextLength() / 3; }
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure); measure();
    if (reduce) return;
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(mq);
    var lastY = window.scrollY;
    function frame(t) {
      var dt = Math.min(64, t - (last || t)); last = t;
      var y = window.scrollY, v = y - lastY; lastY = y;
      boost += (Math.min(Math.abs(v), 80) * 0.6 - boost) * 0.08;
      if (visible && run) {
        off -= (0.05 + boost * 0.02) * dt * (v < 0 ? -1 : 1);
        if (off < -run) off += run; if (off > 0) off -= run;
        tp.setAttribute('startOffset', off.toFixed(1));
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  /* Dish list: the dish photo follows the cursor */
  var dl = $('[data-dishes]'), fl = $('.dish-float');
  if (dl && fl && fine && !reduce && G) {
    var fimg = $('img', fl), fx = G.quickTo(fl, 'x', { duration: 0.6, ease: 'power3' }), fy = G.quickTo(fl, 'y', { duration: 0.6, ease: 'power3' });
    dl.addEventListener('pointermove', function (e) { fx(e.clientX); fy(e.clientY); });
    $$('.dish', dl).forEach(function (row) {
      row.addEventListener('pointerenter', function (e) {
        if (!fl.classList.contains('is-on')) { G.set(fl, { x: e.clientX, y: e.clientY }); }
        fimg.src = row.dataset.img; fl.classList.toggle('is-photo', row.dataset.cut === '0'); fl.classList.add('is-on');
      });
    });
    dl.addEventListener('pointerleave', function () { fl.classList.remove('is-on'); });
    window.addEventListener('scroll', function () { fl.classList.remove('is-on'); }, { passive: true });
  }

  /* Trust: cards stack, the ones underneath settle back */
  var stack = $('[data-stack]');
  if (stack && G && ST && !reduce) {
    var cards = $$('.tcard', stack);
    cards.forEach(function (c, i) {
      var next = cards[i + 1]; if (!next) return;
      G.fromTo(c, { scale: 1, filter: 'brightness(1)' }, { scale: 0.94 - (cards.length - i) * 0.01, filter: 'brightness(0.88)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true } });
    });
  }

  /* Chef gallery: vertical scroll moves the row sideways (desktop) */
  var rail = $('.chefs__rail'), track = $('[data-ctrack]');
  if (rail && track && G && ST && !reduce) {
    ST.matchMedia({
      '(min-width: 861px)': function () {
        var bar = $('.chefs__progress i');
        var dist = function () { return Math.max(0, track.scrollWidth + parseFloat(getComputedStyle(rail).paddingLeft) - window.innerWidth + 40); };
        G.to(track, { x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: rail, start: 'center 55%', end: function () { return '+=' + dist() * 1.2; }, pin: '.chefs', scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: function (s) { if (bar) bar.style.transform = 'scaleX(' + s.progress + ')'; } } });
      }
    });
  }

  /* How it works: the phone stays put while the screens follow the steps */
  var ps = $('[data-pscene]');
  if (ps) {
    var steps = $$('.pstep', ps), scrs = $$('.scr', ps), bar = $('.pscene__track i', ps);
    var showStep = function (i) {
      steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      scrs.forEach(function (s, j) { s.classList.toggle('is-on', j === i); });
      if (bar) bar.style.transform = 'scaleY(' + (i + 1) / steps.length + ')';
    };
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) showStep(+e.target.dataset.step); }); }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { sio.observe(s); });
    steps.forEach(function (s, i) {
      s.tabIndex = 0;
      var go = function () { showStep(i); if (lenis) lenis.scrollTo(s, { offset: -window.innerHeight * 0.25 }); else s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  /* How it works: money moves from you, to held, to the chef */
  var flow = $('[data-flow]');
  if (flow) {
    var fill = $('.flow__fill', flow), nodes = $$('.fnode', flow);
    var setFlow = function (p) {
      fill.style.strokeDashoffset = String(1 - p);
      nodes.forEach(function (n) { n.classList.toggle('is-on', p >= +n.dataset.at - 0.02); });
    };
    if (ST && !reduce) ST.create({ trigger: flow, start: 'top 75%', end: 'bottom 45%', scrub: 0.6, onUpdate: function (s) { setFlow(s.progress); } });
    else setFlow(1);
    setFlow(ST && !reduce ? 0 : 1);
  }

  /* For chefs: the week timeline draws as you scroll */
  $$('[data-draw]').forEach(function (line) {
    if (!ST || reduce) { line.style.transform = 'none'; return; }
    var v = matchMedia('(max-width: 1020px)');
    ST.create({ trigger: line.closest('.week'), start: 'top 75%', end: 'bottom 60%', scrub: 0.6,
      onUpdate: function (s) { line.style.transform = (v.matches ? 'scaleY(' : 'scaleX(') + s.progress + ')'; } });
  });

  /* For chefs: earnings calculator. Chefs type their own numbers; nothing is capped or preset. */
  var calc = $('[data-calc]');
  if (calc) {
    var num = $('.bento__num'), ngn = function (v) { return '₦' + Math.round(v).toLocaleString('en-NG'); };
    var cur = 864000;
    var read = function (f) { var n = parseInt(String(f.value).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; };
    var upd = function () {
      var v = {};
      $$('input', calc).forEach(function (f) { v[f.dataset.k] = Math.min(read(f), +f.dataset.max); });
      var to = v.d * 4 * v.g * v.p;
      num.removeAttribute('data-count');
      if (G && !reduce) { var o = { v: cur }; G.to(o, { v: to, duration: 0.5, ease: 'power3.out', overwrite: true, onUpdate: function () { num.textContent = ngn(o.v); } }); }
      else num.textContent = ngn(to);
      cur = to;
      var p = num.nextElementSibling;
      if (p) p.textContent = 'a month from ' + v.d + (v.d === 1 ? ' dinner' : ' dinners') + ' a week for ' + v.g + (v.g === 1 ? ' guest' : ' guests') + ' at ' + ngn(v.p) + ' a guest.';
    };
    $$('input', calc).forEach(function (f) {
      f.addEventListener('input', function () {
        if (f.dataset.k === 'p') { var n = read(f); f.value = n ? n.toLocaleString('en-NG') : ''; }
        else f.value = f.value.replace(/[^0-9]/g, '');
        upd();
      });
      f.addEventListener('blur', function () { if (!f.value) { f.value = f.dataset.min; upd(); } });
      f.addEventListener('focus', function () { f.select(); });
    });
    $$('.calc__step', calc).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = $('input', b.parentNode), by = (+f.dataset.stepby || 1) * +b.dataset.step;
        var n = Math.max(+f.dataset.min, Math.min(+f.dataset.max, read(f) + by));
        f.value = f.dataset.k === 'p' ? n.toLocaleString('en-NG') : n; upd();
      });
    });
  }

  /* FAQ: topic chips and search with highlighted matches */
  var faq = $('[data-faq]');
  if (faq) {
    var q = $('#faq-q'), chips = $$('.faq__chips .pc-chip', faq), items = $$('.qa', faq), cat = 'all';
    var count = $('.faq__count', faq), empty = $('.faq__empty', faq);
    items.forEach(function (it) { it._q = $('summary span', it).textContent; it._a = $('.qa__a p', it).textContent; });
    var esc = function (s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
    var mark = function (text, term) {
      if (!term) return esc(text);
      var i = text.toLowerCase().indexOf(term); if (i < 0) return esc(text);
      return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>' + esc(text.slice(i + term.length));
    };
    var apply = function () {
      var term = (q.value || '').trim().toLowerCase(), n = 0;
      items.forEach(function (it) {
        var hit = (cat === 'all' || it.dataset.cat === cat) && (!term || (it._q + ' ' + it._a).toLowerCase().indexOf(term) > -1);
        it.hidden = !hit; if (hit) n++;
        $('summary span', it).innerHTML = mark(it._q, term); $('.qa__a p', it).innerHTML = mark(it._a, term);
        if (term && hit && it._a.toLowerCase().indexOf(term) > -1 && !it.open) { it.open = true; it.classList.add('is-open'); }
      });
      count.textContent = (term || cat !== 'all') ? n + (n === 1 ? ' question' : ' questions') + (term ? ' match "' + q.value.trim() + '"' : ' in ' + cat) : '';
      empty.hidden = n > 0;
      if (ST) ST.refresh();
    };
    chips.forEach(function (c) { c.addEventListener('click', function () {
      cat = c.dataset.cat; chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); }); apply();
    }); });
    q.addEventListener('input', apply);
  }

  /* Contact: copy details, show whether support is open now (Lagos time) */
  $$('.js-copyv').forEach(function (b) {
    b.addEventListener('click', function () {
      var label = b.lastChild, done = function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.v).then(done, function () {
        var r = d.createRange(); r.selectNodeContents(b.parentNode.querySelector('.way__v')); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      }); else done();
    });
  });
  var live = $('.hours__live');
  if (live) {
    var now = new Date(), lag = new Date(now.getTime() + (now.getTimezoneOffset() + 60) * 60000);
    var open = lag.getDay() !== 0 && lag.getHours() >= 8 && lag.getHours() < 20;
    live.classList.toggle('is-closed', !open);
    $('[data-open]', live).textContent = open ? 'Open now' : 'Closed, back at 8am';
  }

  /* About: map pins drop in when the map is in view */
  $$('[data-map]').forEach(function (m) {
    new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { m.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.3 }).observe(m);
  });

  /* Legal: highlight the section you're reading */
  var toc = $$('.legal__toc a');
  if (toc.length) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    $$('.legal__sec').forEach(function (s) { io.observe(s); });
  }

  /* In-page anchors scroll smoothly with Lenis */
  if (lenis) $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { var t = a.getAttribute('href'); if (t.length < 2) return; var el = d.getElementById(t.slice(1)); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { offset: -90 }); });
  });

  /*PAGES*/
})();

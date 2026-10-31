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

  if (G && ST) initMotion();
  else {
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

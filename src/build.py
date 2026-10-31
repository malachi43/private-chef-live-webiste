"""Builds the Private Chef website (v2 rebuild) from src/pages/*.html.

Every page shares one layout: head, glass nav, full-screen mobile menu, closing band and footer.
Each page file starts with a JSON header comment:  <!--{"file": "about.html", "nav": "about", ...}-->

Outputs (in 07-website/):
  *.html                    one full document per page, for local review (open index.html)
  assets/site.css           tokens + design system components + site styles
  assets/site.js            motion engine and interactions
  _publish/index.html       Home as a fragment, for publishing as a Claude artifact
  single-file/*.html        self-contained copies that open anywhere (see single_file.py)

Rebuild after edits:  python3 07-website/src/build.py
"""
import json, re, os, glob, html, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
ROOT = os.path.dirname(SITE)
DS = os.path.join(ROOT, '06-design-system')
ICONS = os.path.join(HERE, 'icons')
PH = os.environ.get('PHOSPHOR', '/tmp/claude-0/-home-user/fc19798d-eeda-5b99-9445-1c620c561e80/scratchpad/ph/package/assets')

tokens = json.load(open(os.path.join(DS, 'tokens.json')))

# Placeholder contact details (approved as placeholders until the client confirms)
CONTACT = {
    'email': 'hello@privatechef.ng',
    'phone': '+234 800 000 0000',
    'whatsapp': '+234 800 000 0001',
    'hours': 'Monday to Saturday, 8am to 8pm',
    'response': 'We reply within 2 hours in support hours',
    'instagram': '@privatechef.ng', 'x': '@privatechefng', 'tiktok': '@privatechef.ng',
}

NAV = [('how', 'How it works', 'how-it-works.html'), ('chefs', 'For chefs', 'chefs.html'),
       ('about', 'About', 'about.html'), ('faq', 'FAQ', 'faq.html'), ('contact', 'Contact', 'contact.html')]


# ---------- helpers ----------

def tokens_css():
    out = [':root {']
    for t in tokens['color']['tokens']:
        out.append(f"  --{t['name']}: {t['value']['light']};")
    for t in tokens['shadow']['tokens']:
        out.append(f"  --{t['name']}: {t['value']['light']};")
    for fam in ['spacing', 'radius', 'blur', 'size', 'duration', 'easing']:
        for t in tokens[fam]['tokens']:
            out.append(f"  --{t['name']}: {t['value']};")
    for k, v in tokens['type']['families'].items():
        out.append(f"  --font-{k}: {v};")
    out.append('}')
    return '\n'.join(out)


def icon(name, fill=False, cls=''):
    """Inline a Phosphor icon. Icons are cached in src/icons so the build works without the package."""
    os.makedirs(ICONS, exist_ok=True)
    fname = f"{name}{'-fill' if fill else ''}.svg"
    cached = os.path.join(ICONS, fname)
    if not os.path.exists(cached):
        s = open(f"{PH}/{'fill' if fill else 'regular'}/{fname}").read()
        open(cached, 'w').write(s)
    inner = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', open(cached).read(), flags=re.S)
    c = ('pc-i ' + cls).strip()
    return f'<svg class="{c}" viewBox="0 0 256 256" aria-hidden="true">{inner}</svg>'


def icons(s):
    s = re.sub(r'\{\{i:([a-z-]+)(?:\|([^}]*))?\}\}', lambda m: icon(m.group(1), False, m.group(2) or ''), s)
    s = re.sub(r'\{\{f:([a-z-]+)(?:\|([^}]*))?\}\}', lambda m: icon(m.group(1), True, m.group(2) or ''), s)
    return s


LOCKUP = open(os.path.join(ROOT, '05-brand-assets', 'logos', 'svg', 'pc-lockup.svg')).read()
WORD_PATHS = re.search(r'<g fill="#1A1613">(.*?)</g>', LOCKUP, re.S).group(1)
MARK = ('<path d="M24 4a11 11 0 0 1 10.4 7.4A9 9 0 0 1 35 29.3V33H13v-3.7a9 9 0 0 1 .6-17.9A11 11 0 0 1 24 4Z"/>'
        '<rect x="13" y="36" width="22" height="7" rx="2.5"/>')


def logo(cls='logo'):
    """Lockup with the wordmark in currentColor, so it follows light and dark grounds."""
    return (f'<svg class="{cls}" viewBox="0 0 220.4 48" role="img" aria-label="Private Chef">'
            f'<g class="logo__mark">{MARK}</g><g fill="currentColor">{WORD_PATHS}</g></svg>')


def wordmark(cls='wordmark'):
    return f'<svg class="{cls}" viewBox="60 4 160.4 40" aria-hidden="true"><g fill="currentColor">{WORD_PATHS}</g></svg>'


def mark(cls='mark'):
    return f'<svg class="{cls}" viewBox="0 0 48 48" aria-hidden="true"><g fill="currentColor">{MARK}</g></svg>'


def app_buttons(extra=''):
    return f'''<div class="apps {extra}">
  <a class="appbtn" href="#" data-app aria-label="Download on the App Store">{{{{f:apple-logo}}}}<span><small>Download on the</small>App Store</span><em class="v1">Soon</em></a>
  <a class="appbtn" href="#" data-app aria-label="Get it on Google Play">{{{{f:google-play-logo}}}}<span><small>Get it on</small>Google Play</span><em class="v1">Soon</em></a>
</div>'''


def socials():
    return f'''<div class="socials">
  <a href="#" aria-label="Instagram {CONTACT['instagram']}">{{{{i:instagram-logo}}}}</a>
  <a href="#" aria-label="X {CONTACT['x']}">{{{{i:x-logo}}}}</a>
  <a href="#" aria-label="TikTok {CONTACT['tiktok']}">{{{{i:tiktok-logo}}}}</a>
  <a href="#" aria-label="WhatsApp {CONTACT['whatsapp']}">{{{{i:whatsapp-logo}}}}</a>
</div>'''


def cta(size='', block=False, hero=False):
    """The main action, which differs between v1 (waitlist) and v2 (launch)."""
    s = f' pc-btn--{size}' if size else ''
    b = ' pc-btn--block' if block else ''
    h = ' pc-btn--hero' if hero else ''
    return (f'<a class="pc-btn pc-btn--primary{s}{b}{h} js-magnet v1" href="join.html">Join the waitlist {{{{i:arrow-right}}}}</a>'
            f'<a class="pc-btn pc-btn--primary{s}{b}{h} js-magnet v2" href="join.html">Get started {{{{i:arrow-right}}}}</a>')


# ---------- layout ----------

def nav(active):
    links = ''.join(f'<li><a class="nav__link{" is-active" if k == active else ""}" href="{href}"'
                    f'{" aria-current=page" if k == active else ""}>{label}</a></li>' for k, label, href in NAV)
    return f'''<header class="nav" data-nav>
  <div class="nav__pill">
    <a class="nav__home" href="index.html" aria-label="Private Chef home">{logo()}</a>
    <nav aria-label="Main"><ul class="nav__links">{links}</ul></nav>
    <div class="nav__actions">
      <a class="pc-btn pc-btn--ghost pc-btn--sm nav__login v2" href="join.html#login">Log in</a>
      <a class="pc-btn pc-btn--primary pc-btn--sm js-magnet v1" href="join.html">Join the waitlist</a>
      <a class="pc-btn pc-btn--primary pc-btn--sm js-magnet v2" href="join.html">Get started</a>
    </div>
    <button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span></button>
  </div>
</header>
<div class="menu g-cocoa grain" id="menu" hidden>
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <nav class="menu__inner" aria-label="Menu">
    <ul class="menu__links">
      <li><a href="index.html"{' aria-current="page"' if active == 'home' else ''}><span>Home</span></a></li>
      {''.join(f'<li><a href="{href}"{" aria-current=page" if k == active else ""}><span>{label}</span></a></li>' for k, label, href in NAV)}
    </ul>
    <div class="menu__foot">
      <div class="menu__cta">{cta('lg', block=True)}<a class="pc-btn pc-btn--glass pc-btn--lg pc-btn--block v2" href="join.html#login">Log in</a></div>
      {app_buttons('apps--menu')}
      <div class="menu__meta">{socials()}<a href="mailto:{CONTACT['email']}">{CONTACT['email']}</a></div>
    </div>
  </nav>
</div>'''


def band(p):
    t = p.get('band_title', 'Your table, <span class="grad-text--light">your chef.</span>')
    s = p.get('band_text', 'Be first to book when we open in Lagos. It takes 30 seconds.')
    s2 = p.get('band_text_v2', 'Book a verified chef in Lagos in a few taps.')
    return f'''<section class="band" aria-labelledby="band-title">
  <div class="band__inner">
    <div class="band__badge" aria-hidden="true">{badge_svg('JOIN · BOOK · ENJOY · ')}</div>
    <h2 id="band-title" data-split>{t}</h2>
    <p class="v1">{s}</p><p class="v2">{s2}</p>
    <div class="band__actions">
      <a class="pc-btn pc-btn--lg btn-ink js-magnet v1" href="join.html">Join the waitlist {{{{i:arrow-right}}}}</a>
      <a class="pc-btn pc-btn--lg btn-ink js-magnet v2" href="join.html">Get the app {{{{i:arrow-right}}}}</a>
      <a class="pc-btn pc-btn--lg btn-onband" href="chefs.html">{{{{i:chef-hat}}}}I'm a chef</a>
    </div>
  </div>
</section>'''


def badge_svg(text, cls='badge-ring'):
    rid = 'ring-' + str(zlib.crc32(text.encode()) % 99999)
    return (f'<svg class="{cls}" viewBox="0 0 120 120"><defs><path id="{rid}" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs>'
            f'<text><textPath href="#{rid}" textLength="289">{text * 2}</textPath></text></svg>')


def footer():
    cols = [('Explore', [('Home', 'index.html'), ('How it works', 'how-it-works.html'), ('For chefs', 'chefs.html'), ('About', 'about.html')]),
            ('Help', [('FAQ', 'faq.html'), ('Contact', 'contact.html'), ('Join', 'join.html')]),
            ('Legal', [('Terms', 'terms.html'), ('Privacy', 'privacy.html')])]
    colhtml = ''.join(f'<div class="foot__col"><h3>{h}</h3><ul>' + ''.join(f'<li><a href="{u}">{t}</a></li>' for t, u in links) + '</ul></div>' for h, links in cols)
    return f'''<footer class="foot g-cocoa grain" data-ground="dark">
  <div class="foot__inner">
    <div class="foot__top">
      <div class="foot__brand">
        <a href="index.html" aria-label="Private Chef home">{logo('logo logo--foot')}</a>
        <p>Verified private chefs in Lagos, at your home or delivered to your door.</p>
        {socials()}
      </div>
      <div class="foot__cols">{colhtml}</div>
      <div class="foot__app">
        <h3>Get the app</h3>
        <p class="v1">The app launches with bookings. Join the waitlist to get the link first.</p>
        <p class="v2">Book, pay and chat with your chef in one place.</p>
        {app_buttons()}
        <dl class="foot__contact">
          <div><dt>Email</dt><dd><a href="mailto:{CONTACT['email']}">{CONTACT['email']}</a></dd></div>
          <div><dt>Phone</dt><dd><a href="tel:{CONTACT['phone'].replace(' ', '')}">{CONTACT['phone']}</a></dd></div>
        </dl>
      </div>
    </div>
    <div class="foot__base"><span>© 2026 Private Chef. Made in Lagos.</span><span class="foot__legal"><a href="terms.html">Terms</a><a href="privacy.html">Privacy</a></span></div>
  </div>
  <div class="foot__word" aria-hidden="true">{wordmark()}</div>
</footer>'''


REVIEW = '''<div class="review" role="group" aria-label="Review: choose the site version">
  <span class="review__label">Review</span>
  <button type="button" data-ver="1" aria-pressed="true">v1 Waitlist</button>
  <button type="button" data-ver="2" aria-pressed="false">v2 Launch</button>
</div>'''

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..700&family=Geist:wght@400..700&display=swap">')
LIBS = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>'
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>'
        '<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>'
        '<script src="assets/site.js" defer></script>')
BOOT = ("<script>(function(d){var h=d.documentElement,v='1';try{v=localStorage.getItem('pc-ver')||'1'}catch(e){}"
        "h.dataset.v=v;h.classList.add('js');try{if(sessionStorage.getItem('pc-wipe')){h.classList.add('is-arriving');sessionStorage.removeItem('pc-wipe')}}catch(e){}"
        "setTimeout(function(){if(!h.classList.contains('motion-ready'))h.classList.add('motion-off')},3000)})(document)</script>")


def head(p):
    t = p['title'] + (' · Private Chef' if p['file'] != 'index.html' else '')
    return (f'<title>{t}</title>\n<meta name="description" content="{html.escape(p["desc"])}">\n'
            f'<meta property="og:title" content="{html.escape(p["title"])}"><meta property="og:description" content="{html.escape(p["desc"])}">'
            f'<meta property="og:image" content="img/hero-chef-1100.webp"><meta name="theme-color" content="#2A1C16">\n'
            f'{FONTS}\n<link rel="stylesheet" href="assets/site.css">\n{BOOT}\n{LIBS}')


def body(p, content):
    return (f'<a class="skip" href="#main">Skip to content</a>\n{nav(p["nav"])}\n<main id="main" class="page page--{p["nav"]}">\n{content}\n</main>\n'
            + (band(p) if p.get('band', True) else '') + f'\n{footer()}\n{REVIEW}\n<div class="wipe" aria-hidden="true">{mark("wipe__mark")}</div>')


# ---------- page-level components used by page files ----------

def expand_components(s):
    s = s.replace('<!--CTA-->', cta('lg', hero=True)).replace('<!--APPS-->', app_buttons())
    s = re.sub(r'<!--BADGE:([^>]*)-->', lambda m: badge_svg(m.group(1)), s)
    s = re.sub(r'<!--LOGO-->', logo(), s)
    for k, v in CONTACT.items():
        s = s.replace('{{c:' + k + '}}', v)
    s = s.replace('{{c:phone-tel}}', CONTACT['phone'].replace(' ', ''))
    return s


def pic(name, alt='', sizes='100vw', cls='', w=(640, 1000), eager=False):
    """Responsive WebP picture with JPEG fallback."""
    srcset = ', '.join(f'img/{name}-{x}.webp {x}w' for x in w)
    load = 'eager" fetchpriority="high' if eager else 'lazy'
    return (f'<picture><source type="image/webp" srcset="{srcset}" sizes="{sizes}">'
            f'<img class="{cls}" src="img/{name}.jpg" alt="{alt}" loading="{load}" decoding="async"></picture>')


def expand_pics(s):
    def r(m):
        a = dict(x.split('=', 1) for x in m.group(1).split('|')[1:])
        name = m.group(1).split('|')[0]
        w = tuple(int(x) for x in a.get('w', '640,1000').split(','))
        return pic(name, a.get('alt', ''), a.get('sizes', '100vw'), a.get('cls', ''), w, a.get('eager') == '1')
    return re.sub(r'\{\{pic:([^}]*)\}\}', r, s)


# ---------- build ----------

def build():
    bundle = open(os.path.join(DS, 'components', 'bundle.css')).read()
    bundle = re.sub(r'^@import[^;]+;\s*', '', bundle)
    site_css = open(os.path.join(HERE, 'site.css')).read()
    os.makedirs(os.path.join(SITE, 'assets'), exist_ok=True)
    open(os.path.join(SITE, 'assets', 'site.css'), 'w').write(
        '/* Private Chef website. Generated by src/build.py: edit src/site.css, not this file. */\n'
        + tokens_css() + '\n' + bundle + '\n' + site_css)
    open(os.path.join(SITE, 'assets', 'site.js'), 'w').write(open(os.path.join(HERE, 'site.js')).read())

    pages = []
    for f in sorted(glob.glob(os.path.join(HERE, 'pages', '*.html'))):
        raw = open(f).read()
        m = re.match(r'\s*<!--(\{.*?\})-->\s*', raw, re.S)
        p = json.loads(m.group(1)); content = raw[m.end():]
        # Python-side generated blocks (forms, lists) live in pages.py
        import pages as gen
        content = gen.expand(content)
        content = expand_pics(expand_components(content))
        page = icons(body(p, content))
        hd = icons(head(p))
        assert '{{' not in page, (f, re.findall(r'\{\{[^}]*\}\}', page)[:5])
        doc = (f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
               f'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n{hd}\n</head>\n'
               f'<body class="pc">\n{page}\n</body>\n</html>\n')
        open(os.path.join(SITE, p['file']), 'w').write(doc)
        pages.append(p['file'])
        if p['file'] == 'index.html':
            os.makedirs(os.path.join(SITE, '_publish'), exist_ok=True)
            open(os.path.join(SITE, '_publish', 'index.html'), 'w').write(f'{hd}\n<div class="pc">\n{page}\n</div>\n')
    print('built', ', '.join(pages))


if __name__ == '__main__':
    import sys; sys.path.insert(0, HERE)
    build()
    import single_file; single_file.build()
    import package_zip; package_zip.build()

"""Makes a self-contained copy of every page in 07-website/single-file/.

Each file has its styles, scripts and photos built in, so it opens correctly on its own:
in a phone's file viewer, the Claude app, an email attachment or Google Drive's preview.
Fonts and the motion libraries still load from the internet; without a connection the page
shows the same content with system fonts and no motion.

Run after build.py:  python3 07-website/src/single_file.py
"""
import base64, os, re, mimetypes

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
OUT = os.path.join(SITE, 'single-file')
PAGES = ['index', 'how-it-works', 'chefs', 'about', 'faq', 'contact', 'join', 'terms', 'privacy', '404']
cache = {}


def data_uri(path):
    if path not in cache:
        mime = mimetypes.guess_type(path)[0] or ('image/webp' if path.endswith('.webp') else 'application/octet-stream')
        cache[path] = f'data:{mime};base64,' + base64.b64encode(open(os.path.join(SITE, path), 'rb').read()).decode()
    return cache[path]


def smallest(srcset):
    """From 'img/a-640.webp 640w, img/a-1000.webp 1000w' keep the first (smallest) file."""
    return srcset.split(',')[0].strip().split(' ')[0]


def build():
    os.makedirs(OUT, exist_ok=True)
    css = open(os.path.join(SITE, 'assets', 'site.css')).read()
    js = open(os.path.join(SITE, 'assets', 'site.js')).read()
    for name in PAGES:
        s = open(os.path.join(SITE, name + '.html')).read()
        s = s.replace('<link rel="stylesheet" href="assets/site.css">', f'<style>{css}</style>')
        s = s.replace('<script src="assets/site.js" defer></script>', '')
        # run after the deferred motion libraries, as the linked version does
        s = s.replace('</body>', f"<script>document.addEventListener('DOMContentLoaded', function () {{\n{js}\n}});</script>\n</body>")
        # the vector logo appears many times; embedding it at each use bloats the file, so offline copies use the sharp 192px PNG
        s = s.replace('img/logo-chef.svg', 'img/logo-chef-192.png')
        # responsive pictures: keep one WebP size and drop the JPEG fallback (every current browser reads WebP),
        # so each photo is embedded once instead of twice
        s = re.sub(r'<picture><source type="image/webp" srcset="([^"]+)"[^>]*>(<img [^>]*?)src="img/[^"]+"',
                   lambda m: f'<picture>{m.group(2)}src="{smallest(m.group(1))}"', s)
        s = re.sub(r'(src|content|data-img|href)="(img/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', s)
        # links between pages point at the other single files
        s = re.sub(r'href="([\w-]+)\.html', lambda m: f'href="{m.group(1)}.html', s)
        open(os.path.join(OUT, name + '.html'), 'w').write(s)
    print('single files:', ', '.join(PAGES))


if __name__ == '__main__':
    build()

"""Packs the playable website into one download: 07-website/Private-Chef-Website.zip

Inside the ZIP is a folder "Private-Chef-Website" with the ten pages, assets/, img/, the
double-click launchers and OPEN-ME.txt. Unzip it, then double-click index.html.

Run after build.py (build.py calls it automatically):  python3 07-website/src/package_zip.py
"""
import os, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
ZIP = os.path.join(SITE, 'Private-Chef-Website.zip')
TOP = 'Private-Chef-Website'
PAGES = ['index', 'how-it-works', 'chefs', 'about', 'faq', 'contact', 'join', 'terms', 'privacy', '404']
LAUNCHERS = ['start-website.command', 'start-website.bat', 'start-website.sh']

OPEN_ME = """PRIVATE CHEF WEBSITE
====================

To view it
----------
1. Keep everything in this folder together.
2. Double-click  index.html  -- it opens in your browser (Chrome, Safari or Edge).
   That's it. Every page, link and animation works.

To view it like a real website (optional)
-----------------------------------------
Mac:      double-click  start-website.command
          (first time: right-click it > Open > Open)
Windows:  double-click  start-website.bat
Then browse to  http://localhost:8000

Stay online: the fonts and animations load from the internet.
Use the small "Review" switch at the bottom of each page to flip between
v1 Waitlist (before launch) and v2 Launch (after launch).

Newest version, always:
https://github.com/Yungdinod/private-chef/raw/main/07-website/Private-Chef-Website.zip
"""


def build():
    if os.path.exists(ZIP):
        os.remove(ZIP)
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in PAGES:
            z.write(os.path.join(SITE, p + '.html'), f'{TOP}/{p}.html')
        for folder in ['assets', 'img']:
            for root, _, files in os.walk(os.path.join(SITE, folder)):
                for f in sorted(files):
                    full = os.path.join(root, f)
                    z.write(full, f'{TOP}/' + os.path.relpath(full, SITE))
        for f in LAUNCHERS:
            info = zipfile.ZipInfo(f'{TOP}/{f}')
            info.external_attr = 0o100755 << 16  # keep the launchers executable on Mac
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, open(os.path.join(SITE, f), 'rb').read())
        z.writestr(f'{TOP}/OPEN-ME.txt', OPEN_ME)
    print('zip:', os.path.relpath(ZIP, os.path.dirname(SITE)), round(os.path.getsize(ZIP) / 1e6, 1), 'MB')


if __name__ == '__main__':
    build()

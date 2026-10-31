#!/bin/sh
# Opens the Private Chef website in your browser at http://localhost:8000
# Mac and Linux. Run from Terminal:  sh 07-website/start-website.sh
# Stop it with Control + C.

cd "$(dirname "$0")" || exit 1
PORT=8000
URL="http://localhost:$PORT/index.html"

open_browser() {
  sleep 1
  if command -v open >/dev/null 2>&1; then open "$URL"        # Mac
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"  # Linux
  fi
}

echo ""
echo "  Private Chef website"
echo "  Opening $URL"
echo "  Keep this window open while you browse. Press Control + C to stop."
echo ""

if command -v python3 >/dev/null 2>&1; then
  open_browser & python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  open_browser & python -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  open_browser & npx --yes serve -l "$PORT" .
else
  echo "  Python or Node.js is needed to run a local server."
  echo "  Easiest fix: double-click 07-website/index.html to open it directly,"
  echo "  or install Python from https://www.python.org/downloads/"
  exit 1
fi

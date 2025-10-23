#!/usr/bin/env bash
set -euo pipefail
# Script to convert SVG sources into PNGs. Requires inkscape or rsvg-convert (librsvg) installed.
mkdir -p dist
if command -v inkscape >/dev/null 2>&1; then
  echo "Using inkscape to export PNGs"
  inkscape assets/images/mon-logo.svg --export-type=png --export-filename=dist/mon-logo.png -w 512 -h 512 || true
  inkscape assets/images/mon-logo.svg --export-type=png --export-filename=dist/mon-logo-1024.png -w 1024 -h 1024 || true
  inkscape assets/images/mon-logo-splash.svg --export-type=png --export-filename=dist/mon-logo-splash.png -w 2732 -h 2732 || true
  inkscape assets/images/mon-logo-foreground.svg --export-type=png --export-filename=dist/mon-logo-foreground.png -w 1024 -h 1024 || true
else
  echo "Inkscape not found, trying rsvg-convert"
  if command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w 512 -h 512 assets/images/mon-logo.svg -o dist/mon-logo.png || true
    rsvg-convert -w 1024 -h 1024 assets/images/mon-logo.svg -o dist/mon-logo-1024.png || true
    rsvg-convert -w 2732 -h 2732 assets/images/mon-logo-splash.svg -o dist/mon-logo-splash.png || true
    rsvg-convert -w 1024 -h 1024 assets/images/mon-logo-foreground.svg -o dist/mon-logo-foreground.png || true
  else
    echo "No SVG to PNG converter found. Please install inkscape or librsvg (rsvg-convert)."
    exit 1
  fi
fi

echo "Generated PNGs are in dist/"
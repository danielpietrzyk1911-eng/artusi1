#!/usr/bin/env bash
# Optimise une vidéo hero pour le web : MP4 (H.264), WebM (VP9), version mobile, posters.
# Usage : prepare-hero.sh <entree.mp4> <dossier_sortie> [nom=hero]
set -euo pipefail
IN="$1"; OUT="$2"; NAME="${3:-hero}"
mkdir -p "$OUT"
# Desktop : 1920 px max, sans audio, faststart pour lecture immédiate
ffmpeg -y -loglevel error -i "$IN" -an -vf "scale='min(1920,iw)':-2,fps=30" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -y -loglevel error -i "$IN" -an -vf "scale='min(1920,iw)':-2,fps=30" \
  -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 "$OUT/$NAME.webm"
# Mobile : 720 px, plus compressé
ffmpeg -y -loglevel error -i "$IN" -an -vf "scale='min(720,iw)':-2,fps=24" \
  -c:v libx264 -preset slow -crf 29 -pix_fmt yuv420p -movflags +faststart "$OUT/$NAME-mobile.mp4"
# Posters (première image)
ffmpeg -y -loglevel error -i "$IN" -frames:v 1 -vf "scale='min(1920,iw)':-2" -q:v 4 "$OUT/$NAME-poster.jpg"
ffmpeg -y -loglevel error -i "$IN" -frames:v 1 -vf "scale='min(1920,iw)':-2" -quality 72 "$OUT/$NAME-poster.webp"
echo "Fichiers produits :"
for f in "$OUT/$NAME".mp4 "$OUT/$NAME".webm "$OUT/$NAME"-mobile.mp4 "$OUT/$NAME"-poster.jpg "$OUT/$NAME"-poster.webp; do
  printf "  %-40s %6s Ko\n" "$(basename "$f")" "$(( $(stat -c%s "$f") / 1024 ))"
done
check(){ [ "$(stat -c%s "$1")" -le "$2" ] || echo "  ⚠ $(basename "$1") dépasse $(( $2/1024 )) Ko — augmenter le CRF ou raccourcir."; }
check "$OUT/$NAME.mp4" 3145728; check "$OUT/$NAME.webm" 3145728; check "$OUT/$NAME-mobile.mp4" 1258291; check "$OUT/$NAME-poster.webp" 153600

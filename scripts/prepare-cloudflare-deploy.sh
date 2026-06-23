#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
site_dir="$(cd "$script_dir/.." && pwd)"
output_dir="$site_dir/deploy/live-site"

rm -rf "$output_dir"
mkdir -p "$output_dir"

find "$site_dir" -maxdepth 1 -type f \
  \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.xml" -o -name "*.txt" -o -name "*.ico" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.svg" \) \
  ! -name ".DS_Store" \
  ! -name "*.zip" \
  ! -name "CLOUDFLARE_PAGES_DEPLOY.md" \
  ! -name "review-notes.md" \
  -exec cp -p {} "$output_dir/" \;

if [[ ! -f "$output_dir/index.html" ]]; then
  echo "ERROR: deploy/live-site/index.html was not created." >&2
  exit 1
fi

echo "Prepared Cloudflare Pages output:"
echo "$output_dir"

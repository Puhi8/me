#!/usr/bin/env bash

set -euo pipefail

dest_dir="public"
src_dir="src/img"
profile_src_dir="src"

if [ ! -d "$src_dir" ]; then
  echo "No img directory to copy."
  exit 0
fi

mkdir -p "$dest_dir"
mkdir -p "$dest_dir/img"

while IFS= read -r -d '' path; do
  rel_path="${path#"$src_dir"/}"
  dest_path="$dest_dir/img/$rel_path"
  if [ -d "$path" ]; then
    mkdir -p "$dest_path"
    continue
  fi
  if [ -f "$path" ]; then
    mkdir -p "$(dirname "$dest_path")"
    cp "$path" "$dest_path"
  fi
done < <(find "$src_dir" -mindepth 1 -print0)

echo "Images copied to $dest_dir/img"

if [ ! -f "$profile_src_dir/profile.png" ]; then
  echo "No profile.png found in $profile_src_dir."
  exit 0
fi

cp "$profile_src_dir/profile.png" "$dest_dir/profile.png"

echo "profile.png moved to $dest_dir/profile.png"

#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
repo_url='https://github.com/vsasanka/pausepilot-buildathon.git'
if [[ ! -f package.json || ! -f render.yaml || ! -d public ]]; then
  echo 'ERROR: Run this file from the extracted PausePilot project directory.' >&2
  exit 1
fi
if [[ -f .env ]]; then
  echo 'Local .env detected. It is excluded from Git by .gitignore.'
fi
if [[ ! -d .git ]]; then
  git init
fi
if git remote get-url origin >/dev/null 2>&1; then
  existing="$(git remote get-url origin)"
  if [[ "$existing" != "$repo_url" && "$existing" != 'git@github.com:vsasanka/pausepilot-buildathon.git' ]]; then
    echo "ERROR: origin points to $existing, not the approved repository. No changes made." >&2
    exit 1
  fi
else
  git remote add origin "$repo_url"
fi

git add -A
if git diff --cached --name-only | grep -E '^\.env($|\.|/)' | grep -v '^\.env\.example$' >/dev/null; then
  echo 'ERROR: A local .env file would be committed. Aborting.' >&2
  exit 1
fi

git branch -M main
if ! git diff --cached --quiet; then
  git commit -m 'Deploy PausePilot modular hackathon demo v0.6'
else
  echo 'No uncommitted changes.'
fi
printf '\nPushing to %s\n' "$repo_url"
git push -u origin main
printf '\nSUCCESS: Verify source at https://github.com/vsasanka/pausepilot-buildathon\n'

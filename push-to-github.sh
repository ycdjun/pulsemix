#!/bin/bash
# Run this in Ubuntu from: /home/yongchamp/projects/pulsemix
set -e
cd /home/yongchamp/projects/pulsemix
echo "Adding all files..."
git add -A
echo "Status:"
git status --short
echo "Committing..."
git commit -m "PulseMix: full app with Spotify, SoundCloud, playlist, deploy" || true
echo "Pushing to origin main..."
git push -u origin main
echo "Done."

#!/bin/sh
# Rebuilds index.html from the files in src/
cd "$(dirname "$0")/src" && cat head.html 01-graph.js 02-art-a.js 02-art-b.js 02-art-c.js 03-statues.js 04-live.js 05-game.js 05b-shortcuts.js 06-ui.js tail.html > ../index.html

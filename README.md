# Jungle Quest: The Cursed Board

A browser-based board game packaged for local development in Visual Studio Code.

## Requirements
- A modern browser (Chrome, Edge, or Firefox).
- Python 3 for the included local HTTP server, or the VS Code Live Server extension.
- Node.js is optional; it is used only for the JavaScript syntax validation described below.

## Run in VS Code on Windows
1. Extract the ZIP to a folder.
2. Open the `jungle-quest` folder in VS Code.
3. Double-click `run-local.bat`, or open a terminal in this folder and run:
   ```powershell
   python -m http.server 8000
   ```
4. Visit `http://localhost:8000`.
5. Stop the local server with `Ctrl+C` in the terminal.

If Python is unavailable, install the VS Code **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.

## Rebuild after editing source files
Edit the files under `src/`. Then run `build.bat` on Windows or `sh build.sh` on macOS/Linux. Both scripts concatenate the source fragments in the required order and regenerate `index.html`.

## Source file overview
- `src/head.html` — styles and HTML interface markup.
- `src/01-graph.js` — board/path graph and configuration.
- `src/02-art-a.js`, `02-art-b.js`, `02-art-c.js` — board drawing helpers and artwork.
- `src/03-statues.js` — board landmarks and statues.
- `src/04-live.js` — live canvas drawing and visual effects.
- `src/05-game.js` — turn flow and game rules.
- `src/05b-shortcuts.js` — route events, challenges, and shortcut/inside-route outcomes.
- `src/06-ui.js` — user interface interactions.
- `src/tail.html` — closing script and document fragment.

## Validation notes
The packaged `index.html` is rebuilt from the supplied source fragments. A JavaScript syntax check can be run by extracting the inline script and executing `node --check` on it. Passing syntax validation does not prove every gameplay outcome has been tested in a browser.

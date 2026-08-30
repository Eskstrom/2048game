# 2048 Game 🎮

A fast, modern, and responsive implementation of the classic **2048** puzzle game built with pure HTML5, CSS3, and JavaScript.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 🕹️ Game Rules
1. Use **Arrow Keys**, **WASD**, or **Touch Swipes** on mobile devices to slide tiles across the 4x4 grid.
2. When two tiles containing the same number collide during a move, they **merge into one** tile with double the value!
3. After every valid move, a new tile (valued 2 or 4) randomly spawns on an empty grid cell.
4. Score increases dynamically whenever tiles merge.
5. Reach the **2048** tile to win! You can also continue playing to beat your personal highest score.

---

## ✨ Features
- 📱 **Fully Responsive & Touch Enabled**: Seamless experience on desktops, tablets, and smartphones with gesture detection.
- 🌙 **Dark & Light Mode**: Built-in theme switcher saved to your local preferences.
- ↩️ **Undo Move**: Made a misstep? Revert your last move with the Undo button.
- 🔊 **Web Audio Synthesizer**: Zero-dependency procedural audio feedback for moves, merges, game over, and victory.
- 💾 **Local Storage Persistence**: Automatically remembers your Best High Score across browser sessions.

## ⌨️ Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move tiles | Arrow keys or `W` `A` `S` `D` | Swipe in any direction |
| Undo | **Undo** button | **Undo** button |
| Start over | **New Game** button | **New Game** button |
| Toggle sound or theme | Toolbar buttons | Toolbar buttons |

---

## 🚀 Getting Started

Simply clone the repository and open `index.html` in your favorite web browser:

```bash
git clone https://github.com/Eskstrom/2048game.git
cd 2048game
# Open in browser:
# On Windows:
start index.html
# On macOS:
open index.html
# On Linux:
xdg-open index.html
```

No build step or server is required—the game is a self-contained static site.
For the best mobile testing experience, serve the folder with any local static
web server and open it from a device on the same network.

## 📁 Project Structure

- `index.html` — page structure and game controls
- `style.css` — responsive layout, animations, and themes
- `game.js` — board logic, input handling, scoring, and persistence

---

## 📜 License
MIT License. Created by [Eskstrom](https://github.com/Eskstrom).
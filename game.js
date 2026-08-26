/**
 * 2048 Game Engine
 * Core grid mechanics, sliding algorithms, and input controllers.
 */

class Game2048 {
  constructor(size = 4) {
    this.size = size;
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('2048_bestScore') || '0', 10);
    this.won = false;
    this.over = false;
    this.keepPlaying = false;

    // DOM Elements
    this.tileContainer = document.getElementById('tile-container');
    this.scoreDisplay = document.getElementById('score');
    this.bestScoreDisplay = document.getElementById('best-score');
    this.messageContainer = document.getElementById('game-message');
    this.messageText = document.getElementById('game-message-text');
    this.keepGoingBtn = document.getElementById('keep-going-btn');
    this.retryBtn = document.getElementById('retry-btn');
    this.restartBtn = document.getElementById('restart-btn');

    this.init();
  }

  createEmptyGrid() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  init() {
    this.updateScore(0);
    this.bestScoreDisplay.textContent = this.bestScore;
    this.setupEventListeners();
    this.restart();
  }

  restart() {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.won = false;
    this.over = false;
    this.keepPlaying = false;
    this.updateScore(0);
    this.messageContainer.classList.remove('active');
    this.keepGoingBtn.classList.add('hidden');

    this.addRandomTile();
    this.addRandomTile();
    this.render();
  }

  addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
      return { r, c, val: this.grid[r][c] };
    }
    return null;
  }

  render() {
    this.tileContainer.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        if (val > 0) {
          const tile = document.createElement('div');
          tile.className = `tile tile-${val <= 2048 ? val : 'super'} pos-${r}-${c}`;
          tile.textContent = val;
          this.tileContainer.appendChild(tile);
        }
      }
    }
  }

  updateScore(addedScore) {
    this.score += addedScore;
    this.scoreDisplay.textContent = this.score;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreDisplay.textContent = this.bestScore;
      localStorage.setItem('2048_bestScore', this.bestScore.toString());
    }
  }

  // Slide and merge one row to the left
  slideRow(row) {
    const filtered = row.filter(val => val !== 0);
    const newRow = [];
    let scoreGain = 0;
    let wonGame = false;

    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        newRow.push(mergedVal);
        scoreGain += mergedVal;
        if (mergedVal === 2048 && !this.won && !this.keepPlaying) {
          wonGame = true;
        }
        i++; // skip next merged tile
      } else {
        newRow.push(filtered[i]);
      }
    }

    while (newRow.length < this.size) {
      newRow.push(0);
    }

    return { newRow, scoreGain, wonGame };
  }

  move(direction) {
    if (this.over || (this.won && !this.keepPlaying)) return false;

    let moved = false;
    let totalScoreGain = 0;
    let gameWonInMove = false;

    // 0: Up, 1: Right, 2: Down, 3: Left
    for (let i = 0; i < this.size; i++) {
      let line = [];
      for (let j = 0; j < this.size; j++) {
        if (direction === 3) line.push(this.grid[i][j]); // Left
        else if (direction === 1) line.push(this.grid[i][this.size - 1 - j]); // Right
        else if (direction === 0) line.push(this.grid[j][i]); // Up
        else if (direction === 2) line.push(this.grid[this.size - 1 - j][i]); // Down
      }

      const { newRow, scoreGain, wonGame } = this.slideRow(line);
      totalScoreGain += scoreGain;
      if (wonGame) gameWonInMove = true;

      for (let j = 0; j < this.size; j++) {
        let val = newRow[j];
        if (direction === 3 && this.grid[i][j] !== val) {
          this.grid[i][j] = val;
          moved = true;
        } else if (direction === 1 && this.grid[i][this.size - 1 - j] !== val) {
          this.grid[i][this.size - 1 - j] = val;
          moved = true;
        } else if (direction === 0 && this.grid[j][i] !== val) {
          this.grid[j][i] = val;
          moved = true;
        } else if (direction === 2 && this.grid[this.size - 1 - j][i] !== val) {
          this.grid[this.size - 1 - j][i] = val;
          moved = true;
        }
      }
    }

    if (moved) {
      if (totalScoreGain > 0) {
        this.updateScore(totalScoreGain);
      }
      this.addRandomTile();
      this.render();

      if (gameWonInMove && !this.won) {
        this.won = true;
        this.showMessage('You Won!', true);
      } else if (this.checkGameOver()) {
        this.over = true;
        this.showMessage('Game Over!', false);
      }
      return true;
    }

    return false;
  }

  checkGameOver() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return false;
        if (c + 1 < this.size && this.grid[r][c] === this.grid[r][c + 1]) return false;
        if (r + 1 < this.size && this.grid[r][c] === this.grid[r + 1][c]) return false;
      }
    }
    return true;
  }

  showMessage(text, isWin) {
    this.messageText.textContent = text;
    this.messageContainer.classList.add('active');
    if (isWin) {
      this.keepGoingBtn.classList.remove('hidden');
    }
  }

  setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        this.move(0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        this.move(1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        this.move(2);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        this.move(3);
      }
    });

    // Touch Swipe Controls
    let touchStartX = 0;
    let touchStartY = 0;
    const gameArea = document.getElementById('game-container');

    gameArea.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    gameArea.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const minSwipeDistance = 35;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) >= minSwipeDistance) {
            dx > 0 ? this.move(1) : this.move(3);
          }
        } else {
          if (Math.abs(dy) >= minSwipeDistance) {
            dy > 0 ? this.move(2) : this.move(0);
          }
        }
      }
    }, { passive: true });

    // Buttons
    this.restartBtn.addEventListener('click', () => this.restart());
    this.retryBtn.addEventListener('click', () => this.restart());
    this.keepGoingBtn.addEventListener('click', () => {
      this.keepPlaying = true;
      this.messageContainer.classList.remove('active');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game2048();
});

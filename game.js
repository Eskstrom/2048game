/**
 * 2048 Game Engine - Enhanced Edition
 * Features:
 * - Pure Web Audio API Sound Effects (zero external files required)
 * - Undo Move Functionality (history snapshot stack)
 * - Animated Score Indicators (+X floating animation)
 * - Theme Switcher (Dark / Light mode persistent state)
 * - Smooth Tile Merge & Spawn Animations
 */

class SoundEffects {
  constructor() {
    this.enabled = localStorage.getItem('2048_sound') !== 'false';
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('2048_sound', this.enabled.toString());
    return this.enabled;
  }

  playMove() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playMerge(val) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const baseFreq = 300 + Math.min(Math.log2(val || 4) * 50, 700);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playWin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.25);
    });
  }

  playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 415.30, 392.00, 349.23];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.12);
      osc.stop(this.ctx.currentTime + i * 0.12 + 0.2);
    });
  }
}

class Game2048 {
  constructor(size = 4) {
    this.size = size;
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('2048_bestScore') || '0', 10);
    this.won = false;
    this.over = false;
    this.keepPlaying = false;
    this.history = []; // Snapshot stack for undo

    // Audio & Theme
    this.sound = new SoundEffects();

    // DOM Elements
    this.tileContainer = document.getElementById('tile-container');
    this.scoreDisplay = document.getElementById('score');
    this.bestScoreDisplay = document.getElementById('best-score');
    this.scoreAddition = document.getElementById('score-addition');
    this.messageContainer = document.getElementById('game-message');
    this.messageText = document.getElementById('game-message-text');
    this.keepGoingBtn = document.getElementById('keep-going-btn');
    this.retryBtn = document.getElementById('retry-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.undoBtn = document.getElementById('undo-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.soundIcon = document.getElementById('sound-icon');
    this.themeBtn = document.getElementById('theme-btn');
    this.themeIcon = document.getElementById('theme-icon');

    this.init();
  }

  createEmptyGrid() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  init() {
    this.initTheme();
    this.initSoundUI();
    this.updateScore(0);
    this.bestScoreDisplay.textContent = this.bestScore;
    this.setupEventListeners();
    this.restart();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('2048_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('2048_theme', newTheme);
    this.themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  }

  initSoundUI() {
    this.soundIcon.textContent = this.sound.enabled ? '🔊' : '🔇';
  }

  toggleSound() {
    const enabled = this.sound.toggle();
    this.soundIcon.textContent = enabled ? '🔊' : '🔇';
  }

  saveSnapshot() {
    const snapshot = {
      grid: this.grid.map(row => [...row]),
      score: this.score,
      won: this.won,
      over: this.over,
      keepPlaying: this.keepPlaying
    };
    this.history.push(snapshot);
    if (this.history.length > 20) this.history.shift();
    this.undoBtn.disabled = false;
  }

  undo() {
    if (this.history.length === 0) return;
    const last = this.history.pop();
    this.grid = last.grid;
    this.score = last.score;
    this.won = last.won;
    this.over = last.over;
    this.keepPlaying = last.keepPlaying;

    this.scoreDisplay.textContent = this.score;
    this.messageContainer.classList.remove('active');
    this.undoBtn.disabled = this.history.length === 0;
    this.render();
  }

  restart() {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.won = false;
    this.over = false;
    this.keepPlaying = false;
    this.history = [];
    this.undoBtn.disabled = true;
    this.updateScore(0);
    this.messageContainer.classList.remove('active');
    this.keepGoingBtn.classList.add('hidden');

    this.addRandomTile(true);
    this.addRandomTile(true);
    this.render();
  }

  addRandomTile(isInitial = false) {
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
      return { r, c, val: this.grid[r][c], isNew: !isInitial };
    }
    return null;
  }

  render(mergedTiles = [], newlyAdded = null) {
    this.tileContainer.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        if (val > 0) {
          const tile = document.createElement('div');
          let extraClass = '';
          if (mergedTiles.some(m => m.r === r && m.c === c)) {
            extraClass = ' tile-merged';
          } else if (newlyAdded && newlyAdded.r === r && newlyAdded.c === c) {
            extraClass = ' tile-new';
          }
          tile.className = `tile tile-${val <= 2048 ? val : 'super'} pos-${r}-${c}${extraClass}`;
          tile.textContent = val;
          this.tileContainer.appendChild(tile);
        }
      }
    }
  }

  showFloatingScore(gain) {
    if (!this.scoreAddition || gain <= 0) return;
    this.scoreAddition.textContent = `+${gain}`;
    this.scoreAddition.classList.remove('active');
    void this.scoreAddition.offsetWidth; // trigger reflow
    this.scoreAddition.classList.add('active');
  }

  updateScore(addedScore) {
    this.score += addedScore;
    this.scoreDisplay.textContent = this.score;

    if (addedScore > 0) {
      this.showFloatingScore(addedScore);
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreDisplay.textContent = this.bestScore;
      localStorage.setItem('2048_bestScore', this.bestScore.toString());
    }
  }

  slideRow(row) {
    const filtered = [];
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== 0) filtered.push({ val: row[i], origIdx: i });
    }

    const newRow = [];
    const mergedIndices = [];
    let scoreGain = 0;
    let wonGame = false;
    let highestMerged = 0;

    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i].val === filtered[i + 1].val) {
        const mergedVal = filtered[i].val * 2;
        newRow.push(mergedVal);
        mergedIndices.push(newRow.length - 1);
        scoreGain += mergedVal;
        highestMerged = Math.max(highestMerged, mergedVal);

        if (mergedVal === 2048 && !this.won && !this.keepPlaying) {
          wonGame = true;
        }
        i++;
      } else {
        newRow.push(filtered[i].val);
      }
    }

    while (newRow.length < this.size) {
      newRow.push(0);
    }

    return { newRow, scoreGain, wonGame, mergedIndices, highestMerged };
  }

  move(direction) {
    if (this.over || (this.won && !this.keepPlaying)) return false;

    // Save state before attempting move
    const previousGrid = this.grid.map(row => [...row]);
    const previousScore = this.score;

    let moved = false;
    let totalScoreGain = 0;
    let gameWonInMove = false;
    let maxMergedVal = 0;
    const mergedPositions = [];

    // 0: Up, 1: Right, 2: Down, 3: Left
    for (let i = 0; i < this.size; i++) {
      let line = [];
      for (let j = 0; j < this.size; j++) {
        if (direction === 3) line.push(this.grid[i][j]);
        else if (direction === 1) line.push(this.grid[i][this.size - 1 - j]);
        else if (direction === 0) line.push(this.grid[j][i]);
        else if (direction === 2) line.push(this.grid[this.size - 1 - j][i]);
      }

      const { newRow, scoreGain, wonGame, mergedIndices, highestMerged } = this.slideRow(line);
      totalScoreGain += scoreGain;
      maxMergedVal = Math.max(maxMergedVal, highestMerged);
      if (wonGame) gameWonInMove = true;

      for (let mIdx of mergedIndices) {
        if (direction === 3) mergedPositions.push({ r: i, c: mIdx });
        else if (direction === 1) mergedPositions.push({ r: i, c: this.size - 1 - mIdx });
        else if (direction === 0) mergedPositions.push({ r: mIdx, c: i });
        else if (direction === 2) mergedPositions.push({ r: this.size - 1 - mIdx, c: i });
      }

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
      // Record snapshot to undo stack
      this.history.push({
        grid: previousGrid,
        score: previousScore,
        won: this.won,
        over: this.over,
        keepPlaying: this.keepPlaying
      });
      if (this.history.length > 20) this.history.shift();
      this.undoBtn.disabled = false;

      if (totalScoreGain > 0) {
        this.updateScore(totalScoreGain);
        this.sound.playMerge(maxMergedVal);
      } else {
        this.sound.playMove();
      }

      const added = this.addRandomTile();
      this.render(mergedPositions, added);

      if (gameWonInMove && !this.won) {
        this.won = true;
        this.sound.playWin();
        this.showMessage('You Win!', true);
      } else if (this.checkGameOver()) {
        this.over = true;
        this.sound.playGameOver();
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
    // Keyboard Controls
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
      } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.undo();
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
        const minSwipeDistance = 30;

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

    // Toolbar Buttons
    this.restartBtn.addEventListener('click', () => this.restart());
    this.retryBtn.addEventListener('click', () => this.restart());
    this.undoBtn.addEventListener('click', () => this.undo());
    this.soundBtn.addEventListener('click', () => this.toggleSound());
    this.themeBtn.addEventListener('click', () => this.toggleTheme());

    this.keepGoingBtn.addEventListener('click', () => {
      this.keepPlaying = true;
      this.messageContainer.classList.remove('active');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game2048();
});

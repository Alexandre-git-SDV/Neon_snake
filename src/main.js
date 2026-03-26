import {
  createGameState,
  restartGame,
  setNextDirection,
  stepGame,
  togglePause
} from "./snake-logic.js";

const DEFAULT_TICK_MS = 140;
const HIGH_SCORE_STORAGE_KEY = "neon-snake-high-score";

const boardElement = document.querySelector("#game-board");
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#high-score");
const statusElement = document.querySelector("#status");
const overlayElement = document.querySelector("#overlay");
const startButton = document.querySelector("#start-btn");
const restartButton = document.querySelector("#restart-btn");
const pauseButton = document.querySelector("#pause-btn");
const speedSelect = document.querySelector("#speed-select");
const directionButtons = Array.from(document.querySelectorAll("[data-direction]"));

let state = createGameState();
state = { ...state, isPaused: true };
let hasStarted = false;
let tickMs = DEFAULT_TICK_MS;
let highScore = readHighScore();
const cells = [];

function toIndex(x, y) {
  return y * state.gridWidth + x;
}

function readHighScore() {
  try {
    const value = Number(window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeHighScore(value) {
  try {
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(value));
  } catch {
    // Ignore storage errors so gameplay never breaks.
  }
}

function buildGrid() {
  boardElement.style.setProperty("--grid-size", String(state.gridWidth));
  boardElement.innerHTML = "";
  cells.length = 0;

  const fragment = document.createDocumentFragment();
  const totalCells = state.gridWidth * state.gridHeight;

  for (let i = 0; i < totalCells; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cells.push(cell);
    fragment.appendChild(cell);
  }

  boardElement.appendChild(fragment);
}

function getStatusLabel() {
  if (state.isGameOver) {
    return "Game Over";
  }

  if (!hasStarted) {
    return "Ready";
  }

  if (state.isPaused) {
    return "Paused";
  }

  return "Running";
}

function getOverlayMessage() {
  if (state.isGameOver) {
    return `Game Over\nScore ${state.score}\nPress Start or R`;
  }

  if (!hasStarted) {
    return "Press Start to play";
  }

  if (state.isPaused) {
    return "Paused";
  }

  return "";
}

function syncHighScore() {
  if (state.score <= highScore) {
    return;
  }

  highScore = state.score;
  writeHighScore(highScore);
}

function render() {
  for (const cell of cells) {
    cell.className = "cell";
  }

  if (state.food) {
    cells[toIndex(state.food.x, state.food.y)]?.classList.add("food");
  }

  state.snake.forEach((segment, index) => {
    const cell = cells[toIndex(segment.x, segment.y)];
    if (!cell) {
      return;
    }

    cell.classList.add("snake");
    cell.classList.add(index === 0 ? "snake-head" : "snake-body");
  });

  syncHighScore();
  scoreElement.textContent = String(state.score);
  highScoreElement.textContent = String(highScore);
  statusElement.textContent = getStatusLabel();
  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
  pauseButton.disabled = !hasStarted || state.isGameOver;
  startButton.disabled = hasStarted && !state.isPaused && !state.isGameOver;

  if (state.isGameOver) {
    startButton.textContent = "Play Again";
  } else if (!hasStarted) {
    startButton.textContent = "Start";
  } else if (state.isPaused) {
    startButton.textContent = "Resume";
  } else {
    startButton.textContent = "Running";
  }

  const overlayMessage = getOverlayMessage();
  overlayElement.textContent = overlayMessage;
  overlayElement.classList.toggle("is-visible", Boolean(overlayMessage));
}

function resetGame(autostart = false) {
  state = restartGame(state);
  hasStarted = autostart;
  state = {
    ...state,
    isPaused: !autostart
  };
  render();
}

function onDirectionInput(direction) {
  state = setNextDirection(state, direction);

  if (!hasStarted) {
    hasStarted = true;
    state = {
      ...state,
      isPaused: false
    };
    render();
  }
}

function startOrResume() {
  if (state.isGameOver) {
    resetGame(true);
    return;
  }

  if (!hasStarted) {
    hasStarted = true;
    state = {
      ...state,
      isPaused: false
    };
    render();
    return;
  }

  if (state.isPaused) {
    state = togglePause(state);
    render();
  }
}

function pauseOrResume() {
  if (!hasStarted || state.isGameOver) {
    return;
  }

  state = togglePause(state);
  render();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const directionMap = {
    arrowup: "UP",
    w: "UP",
    arrowdown: "DOWN",
    s: "DOWN",
    arrowleft: "LEFT",
    a: "LEFT",
    arrowright: "RIGHT",
    d: "RIGHT"
  };

  if (key in directionMap) {
    event.preventDefault();
    onDirectionInput(directionMap[key]);
    return;
  }

  if (key === " " || key === "p") {
    event.preventDefault();
    pauseOrResume();
    return;
  }

  if (key === "r") {
    event.preventDefault();
    resetGame(false);
    return;
  }

  if (key === "enter") {
    event.preventDefault();
    startOrResume();
  }
}

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.getAttribute("data-direction");
    onDirectionInput(direction);
  });
});

startButton.addEventListener("click", () => {
  startOrResume();
});

restartButton.addEventListener("click", () => {
  resetGame(false);
});

pauseButton.addEventListener("click", () => {
  pauseOrResume();
});

speedSelect.addEventListener("change", () => {
  const value = Number(speedSelect.value);
  tickMs = Number.isFinite(value) && value >= 70 && value <= 300 ? value : DEFAULT_TICK_MS;
});

window.addEventListener("keydown", onKeyDown);

buildGrid();
render();

function loop() {
  if (hasStarted && !state.isPaused && !state.isGameOver) {
    state = stepGame(state);
  }

  render();
  window.setTimeout(loop, tickMs);
}

loop();

export const DIRECTION_VECTORS = Object.freeze({
  UP: Object.freeze({ x: 0, y: -1 }),
  DOWN: Object.freeze({ x: 0, y: 1 }),
  LEFT: Object.freeze({ x: -1, y: 0 }),
  RIGHT: Object.freeze({ x: 1, y: 0 })
});

const DEFAULT_GRID_WIDTH = 20;
const DEFAULT_GRID_HEIGHT = 20;
const DEFAULT_SNAKE = Object.freeze([
  Object.freeze({ x: 10, y: 10 }),
  Object.freeze({ x: 9, y: 10 }),
  Object.freeze({ x: 8, y: 10 })
]);
const DEFAULT_DIRECTION = "RIGHT";

function cloneCell(cell) {
  return { x: cell.x, y: cell.y };
}

function cloneSnake(snake) {
  return snake.map(cloneCell);
}

function normalizeDirection(direction) {
  if (!direction) {
    return null;
  }

  const value = String(direction).toUpperCase();
  return DIRECTION_VECTORS[value] ? value : null;
}

function toCellKey(cell) {
  return `${cell.x},${cell.y}`;
}

export function isSameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function isOppositeDirection(current, next) {
  return (
    (current === "UP" && next === "DOWN") ||
    (current === "DOWN" && next === "UP") ||
    (current === "LEFT" && next === "RIGHT") ||
    (current === "RIGHT" && next === "LEFT")
  );
}

export function isOutsideGrid(cell, gridWidth, gridHeight) {
  return (
    cell.x < 0 ||
    cell.x >= gridWidth ||
    cell.y < 0 ||
    cell.y >= gridHeight
  );
}

export function spawnFood(state, rng = Math.random) {
  const occupied = new Set(state.snake.map(toCellKey));
  const freeCells = [];

  for (let y = 0; y < state.gridHeight; y += 1) {
    for (let x = 0; x < state.gridWidth; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const randomValue = Number(rng());
  const bounded = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 0.999999999999)
    : 0;
  const index = Math.floor(bounded * freeCells.length);
  return freeCells[index];
}

export function createGameState(options = {}, rng = Math.random) {
  const gridWidth = options.gridWidth ?? DEFAULT_GRID_WIDTH;
  const gridHeight = options.gridHeight ?? DEFAULT_GRID_HEIGHT;
  const initialSnake = cloneSnake(options.initialSnake ?? DEFAULT_SNAKE);
  const initialDirection =
    normalizeDirection(options.initialDirection) ?? DEFAULT_DIRECTION;

  const baseState = {
    gridWidth,
    gridHeight,
    snake: initialSnake,
    direction: initialDirection,
    nextDirection: initialDirection,
    food: null,
    score: 0,
    isGameOver: false,
    isPaused: false,
    initialSnake: cloneSnake(initialSnake),
    initialDirection
  };

  return {
    ...baseState,
    food: options.initialFood ? cloneCell(options.initialFood) : spawnFood(baseState, rng)
  };
}

export function setNextDirection(state, direction) {
  const nextDirection = normalizeDirection(direction);

  if (!nextDirection) {
    return state;
  }

  if (
    state.snake.length > 1 &&
    isOppositeDirection(state.direction, nextDirection)
  ) {
    return state;
  }

  return {
    ...state,
    nextDirection
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused
  };
}

export function restartGame(state, rng = Math.random) {
  return createGameState(
    {
      gridWidth: state.gridWidth,
      gridHeight: state.gridHeight,
      initialSnake: state.initialSnake,
      initialDirection: state.initialDirection
    },
    rng
  );
}

export function stepGame(state, rng = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = state.nextDirection ?? state.direction;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y
  };

  if (isOutsideGrid(nextHead, state.gridWidth, state.gridHeight)) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      isGameOver: true
    };
  }

  const willEat = state.food ? isSameCell(nextHead, state.food) : false;
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some((segment) => isSameCell(segment, nextHead));

  if (hitsSelf) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      isGameOver: true
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willEat) {
    nextSnake.pop();
  }

  let nextFood = state.food;
  let nextScore = state.score;

  if (willEat) {
    nextScore += 1;
    nextFood = spawnFood(
      {
        ...state,
        snake: nextSnake
      },
      rng
    );
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: direction,
    food: nextFood,
    score: nextScore
  };
}

import test from "node:test";
import assert from "node:assert/strict";

import {
  createGameState,
  setNextDirection,
  spawnFood,
  stepGame
} from "../src/snake-logic.js";

test("moves snake one cell in current direction", () => {
  const state = createGameState({
    gridWidth: 6,
    gridHeight: 6,
    initialSnake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    initialDirection: "RIGHT",
    initialFood: { x: 5, y: 5 }
  });

  const next = stepGame(state);

  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.equal(next.snake.length, 3);
  assert.equal(next.score, 0);
  assert.equal(next.isGameOver, false);
});

test("prevents immediate 180 turn", () => {
  let state = createGameState({
    gridWidth: 6,
    gridHeight: 6,
    initialSnake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    initialDirection: "RIGHT",
    initialFood: { x: 5, y: 5 }
  });

  state = setNextDirection(state, "LEFT");
  const next = stepGame(state);

  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.equal(next.direction, "RIGHT");
});

test("eating food grows snake and increments score", () => {
  const state = createGameState({
    gridWidth: 5,
    gridHeight: 5,
    initialSnake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    initialDirection: "RIGHT",
    initialFood: { x: 3, y: 2 }
  });

  const next = stepGame(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.ok(next.food);
  assert.equal(
    next.snake.some((segment) => segment.x === next.food.x && segment.y === next.food.y),
    false
  );
});

test("colliding with wall sets game over", () => {
  const state = createGameState({
    gridWidth: 4,
    gridHeight: 4,
    initialSnake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ],
    initialDirection: "RIGHT",
    initialFood: { x: 0, y: 0 }
  });

  const next = stepGame(state);

  assert.equal(next.isGameOver, true);
});

test("colliding with self sets game over", () => {
  const state = createGameState({
    gridWidth: 6,
    gridHeight: 6,
    initialSnake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    initialDirection: "DOWN",
    initialFood: { x: 5, y: 5 }
  });

  const next = stepGame(state);

  assert.equal(next.isGameOver, true);
});

test("spawnFood picks only from free cells", () => {
  const state = createGameState({
    gridWidth: 2,
    gridHeight: 2,
    initialSnake: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ],
    initialDirection: "RIGHT",
    initialFood: { x: 1, y: 1 }
  });

  const food = spawnFood(state, () => 0.7);

  assert.deepEqual(food, { x: 1, y: 1 });
});

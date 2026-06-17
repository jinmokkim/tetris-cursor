// 테트리스 보드 크기
const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL = 800; // 자동 낙하 간격 (ms)

// 한 번에 삭제한 줄 수에 따른 점수
const LINE_SCORES = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

// 테트로미노 블록 정의 (shape: 2차원 배열, 1 = 블록 칸)
const PIECES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "#00f0f0",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a000f0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00f000",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f00000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#f0a000",
  },
};

// DOM 요소
const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const gameOverElement = document.getElementById("game-over");

// 게임 상태
let board = createEmptyBoard();
let currentPiece = null;
let dropTimer = null;
let isPlaying = false;
let isGameOver = false;
let score = 0;
let isKeyboardBound = false;

/**
 * 빈 2차원 배열 보드를 만듭니다.
 */
function createEmptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 0)
  );
}

/**
 * 빈 보드 행 하나를 만듭니다.
 */
function createEmptyRow() {
  return Array.from({ length: COLS }, () => 0);
}

/**
 * 블록 shape의 가로 길이를 구합니다.
 */
function getShapeWidth(shape) {
  return Math.max(...shape.map((row) => row.length));
}

/**
 * 블록 shape의 각 채워진 칸을 순회합니다.
 */
function forEachFilledCell(piece, callback) {
  if (!piece) return;

  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (!piece.shape[row][col]) continue;
      callback(piece.row + row, piece.col + col);
    }
  }
}

/**
 * 보드 좌표가 유효한 범위인지 확인합니다.
 */
function isInsideBoard(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

/**
 * 새 블록을 생성합니다.
 * @param {string} [type] - 블록 종류 (I, O, T, S, Z, J, L). 생략 시 무작위.
 */
function createPiece(type) {
  const types = Object.keys(PIECES);

  if (!type || !PIECES[type]) {
    type = types[Math.floor(Math.random() * types.length)];
  }

  const pieceData = PIECES[type];
  const shape = pieceData.shape.map((row) => [...row]);
  const width = getShapeWidth(shape);

  return {
    type,
    shape,
    color: pieceData.color,
    row: 0,
    col: Math.floor((COLS - width) / 2),
  };
}

/**
 * 이동 후 블록이 유효한 위치인지 판정합니다.
 */
function canMove(piece, deltaCol, deltaRow, matrix) {
  if (!piece) return false;

  let canPlace = true;

  forEachFilledCell(piece, (boardRow, boardCol) => {
    const nextRow = boardRow + deltaRow;
    const nextCol = boardCol + deltaCol;

    if (!isInsideBoard(nextRow, nextCol) || matrix[nextRow][nextCol] !== 0) {
      canPlace = false;
    }
  });

  return canPlace;
}

/**
 * 보드 데이터 위에 블록을 합칩니다.
 */
function drawPiece(targetBoard, piece) {
  forEachFilledCell(piece, (boardRow, boardCol) => {
    if (isInsideBoard(boardRow, boardCol)) {
      targetBoard[boardRow][boardCol] = piece.type;
    }
  });
}

/**
 * 고정 보드와 현재 블록을 합친 표시용 보드를 만듭니다.
 */
function buildDisplayBoard() {
  const displayBoard = board.map((row) => [...row]);
  drawPiece(displayBoard, currentPiece);
  return displayBoard;
}

/**
 * 보드와 현재 블록을 화면에 그립니다.
 */
function renderBoard() {
  const displayBoard = buildDisplayBoard();

  boardElement.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const cellValue = displayBoard[row][col];
      if (cellValue) {
        cell.classList.add("filled", `piece-${cellValue}`);
      }

      boardElement.appendChild(cell);
    }
  }
}

/**
 * 점수를 화면에 표시합니다.
 */
function updateScoreDisplay() {
  scoreElement.textContent = score;
}

/**
 * 점수를 증가시킵니다.
 */
function addScore(points) {
  score += points;
  updateScoreDisplay();
}

/**
 * 삭제된 줄 수에 따른 점수를 계산합니다.
 */
function calculateLineScore(linesCleared) {
  return LINE_SCORES[linesCleared] || linesCleared * 100;
}

/**
 * 한 행이 가득 찼는지 확인합니다.
 */
function isRowFull(row) {
  return row.every((cell) => cell !== 0);
}

/**
 * 가득 찬 줄을 삭제하고 위 블록을 내립니다.
 * @returns {number} 삭제된 줄 수
 */
function clearLines() {
  let linesCleared = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (!isRowFull(board[row])) continue;

    board.splice(row, 1);
    board.unshift(createEmptyRow());
    linesCleared += 1;
    row += 1;
  }

  if (linesCleared > 0) {
    addScore(calculateLineScore(linesCleared));
  }

  return linesCleared;
}

/**
 * 게임 오버 UI를 표시합니다.
 */
function showGameOver() {
  gameOverElement.hidden = false;
}

/**
 * 게임 오버 UI를 숨깁니다.
 */
function hideGameOver() {
  gameOverElement.hidden = true;
}

/**
 * 게임 오버 상태로 전환합니다.
 */
function triggerGameOver() {
  isPlaying = false;
  isGameOver = true;
  currentPiece = null;
  stopDropTimer();
  showGameOver();
  renderBoard();
}

/**
 * shape를 시계 방향으로 90도 회전합니다.
 */
function rotateShape(shape) {
  const rowCount = shape.length;
  const colCount = shape[0].length;
  const rotated = Array.from({ length: colCount }, () =>
    Array.from({ length: rowCount }, () => 0)
  );

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      rotated[col][rowCount - 1 - row] = shape[row][col];
    }
  }

  return rotated;
}

/**
 * 현재 블록을 이동합니다.
 */
function movePiece(deltaCol, deltaRow) {
  if (!currentPiece || !isPlaying) return;

  if (canMove(currentPiece, deltaCol, deltaRow, board)) {
    currentPiece.col += deltaCol;
    currentPiece.row += deltaRow;
    renderBoard();
  }
}

/**
 * 현재 블록을 회전합니다. 충돌 시 회전을 취소합니다.
 */
function rotatePiece() {
  if (!currentPiece || !isPlaying) return;

  const previousShape = currentPiece.shape;
  currentPiece.shape = rotateShape(
    currentPiece.shape.map((row) => [...row])
  );

  if (!canMove(currentPiece, 0, 0, board)) {
    currentPiece.shape = previousShape;
  }

  renderBoard();
}

/**
 * 현재 블록을 바닥까지 즉시 내리고 고정합니다.
 */
function hardDrop() {
  if (!currentPiece || !isPlaying) return;

  while (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
  }

  lockPiece();
  renderBoard();
}

/**
 * 키보드 입력을 처리합니다.
 */
function handleKeyDown(event) {
  if (!isPlaying || isGameOver) return;

  switch (event.code) {
    case "ArrowLeft":
      event.preventDefault();
      movePiece(-1, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      movePiece(1, 0);
      break;
    case "ArrowDown":
      event.preventDefault();
      movePiece(0, 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      rotatePiece();
      break;
    case "Space":
      event.preventDefault();
      hardDrop();
      break;
  }
}

/**
 * 키보드 이벤트를 한 번만 등록합니다.
 */
function bindKeyboard() {
  if (isKeyboardBound) return;

  document.addEventListener("keydown", handleKeyDown);
  isKeyboardBound = true;
}

/**
 * 현재 블록을 보드에 고정하고 새 블록을 생성합니다.
 */
function lockPiece() {
  drawPiece(board, currentPiece);
  clearLines();
  currentPiece = createPiece();

  if (!canMove(currentPiece, 0, 0, board)) {
    triggerGameOver();
  }
}

/**
 * 현재 블록을 한 칸 아래로 내립니다.
 */
function dropPiece() {
  if (!currentPiece || !isPlaying) return;

  if (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
  } else {
    lockPiece();
  }

  renderBoard();
}

/**
 * 자동 낙하 타이머를 중지합니다.
 */
function stopDropTimer() {
  if (dropTimer !== null) {
    clearInterval(dropTimer);
    dropTimer = null;
  }
}

/**
 * 자동 낙하 타이머를 시작합니다.
 */
function startDropTimer() {
  stopDropTimer();
  dropTimer = setInterval(dropPiece, DROP_INTERVAL);
}

/**
 * 게임 진행을 중지합니다.
 */
function stopGame() {
  isPlaying = false;
  stopDropTimer();
}

/**
 * 게임을 초기 상태로 되돌립니다.
 */
function resetGame() {
  stopGame();
  isGameOver = false;
  hideGameOver();
  score = 0;
  board = createEmptyBoard();
  currentPiece = createPiece();
  updateScoreDisplay();
  renderBoard();
}

/**
 * 게임을 시작합니다.
 */
function startGame() {
  resetGame();
  isPlaying = true;
  startDropTimer();
}

// 버튼 이벤트
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// 키보드 이벤트 등록 (중복 등록 방지)
bindKeyboard();

// 페이지 로드 시 보드와 블록 표시 (낙하는 시작 버튼 누를 때까지 대기)
resetGame();

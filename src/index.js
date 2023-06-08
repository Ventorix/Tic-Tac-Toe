import './index.html';
import './index.scss';

const DEFAULT_SIZE = 3;
const DEFAULT_TYPE = 'X';

let currentSize = DEFAULT_SIZE;
let currentType = DEFAULT_TYPE;

const GameBoard = (() => {
  let board = new Array(currentSize ** 2);

  const getBoard = () => board;

  const setSize = () => (board = new Array(currentSize ** 2));

  const getCell = (index) => board[index];

  const setCell = (index, mark) => (board[index] = mark);

  const resetCells = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = '';
    }
  };
  return { getBoard, setSize, getCell, setCell, resetCells };
})();

const ScreenController = (() => {
  const markerType = document.querySelectorAll('.type-btn');
  const playerModeButton = document.querySelector('.game-init__game-mode__player-vs-player');
  const aiModeButton = document.querySelector('.game-init__game-mode__player-vs-ai');
  const gridSizeValue = document.querySelector('.game-init__grid-size');
  const gridSizeSlider = document.querySelector('.game-init__range-slider');
  const gameGrid = document.querySelector('.game-grid');
  const overlay = document.querySelector('.overlay');
  const resultModal = document.querySelector('.result-modal');
  const continueButton = document.querySelector('.result-modal__continue-btn');
  const playerXScore = document.getElementById('xScore');
  const playerOScore = document.getElementById('oScore');
  const tieScore = document.getElementById('tieScore');
  const turnMark = document.getElementById('turnMark');
  const startBtn = document.querySelector('.game-init__start-btn');
  const gameScreen = document.querySelector('.main');
  const gameScreenHeader = document.querySelector('.header');
  const gameInitScreen = document.querySelector('.game-init');
  const menuBtn = document.querySelector('.result-modal__menu-btn');
  const roundWinner = document.getElementById('winner');

  menuBtn.addEventListener('click', disableGameboard);
  startBtn.addEventListener('click', enableGameboard);
  continueButton.addEventListener('click', reloadGrid);
  gridSizeSlider.addEventListener('input', (e) => changeSize(e.target.value));

  markerType.forEach((elem) => elem.addEventListener('click', (e) => activeMarkerType(e.target)));

  function updateScore(xScore, oScore, tiedMatches) {
    playerXScore.textContent = xScore;
    playerOScore.textContent = oScore;
    tieScore.textContent = tiedMatches;
  }

  function updateTurnMark(currentMark) {
    if (currentMark === 'X') {
      currentMark = 'O';
    } else if (currentMark === 'O') {
      currentMark = 'X';
    }

    turnMark.textContent = currentMark;
  }

  function updateSizeValue(value) {
    gridSizeValue.innerHTML = `${value} x ${value}`;
  }

  function changeSize(value) {
    currentSize = +value;
    GameBoard.setSize();
    updateSizeValue(value);
  }

  function enableGameboard() {
    gameScreen.classList.remove('disable');
    gameScreenHeader.classList.remove('disable');
    gameInitScreen.classList.add('disable');
    setupGrid(currentSize);
  }

  function disableGameboard() {
    gameScreen.classList.add('disable');
    gameScreenHeader.classList.add('disable');
    gameInitScreen.classList.remove('disable');
    clearGrid();
    GameController.clearGame();
    updateScore(0, 0, 0);
  }

  function showResultModal() {
    resultModal.classList.remove('hide');
    overlay.classList.remove('hide');
  }

  function hideResultModal() {
    resultModal.classList.add('hide');
    overlay.classList.add('hide');
  }

  function declareWinner() {
    roundWinner.textContent = `${GameController.getActivePlayer().mark} TAKES THE ROUND`;
    setTimeout(showResultModal, 200);
  }

  function declareTie() {
    roundWinner.textContent = `IT'S A TIE!`;
    setTimeout(showResultModal, 200);
  }

  const updateGameboard = () => {
    const gridCells = document.querySelectorAll('.grid-cell');

    for (let i = 0; i < gridCells.length; i++) {
      gridCells[i].textContent = GameBoard.getCell(i);
    }
  };

  function setupGrid(size) {
    gameGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gameGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size ** 2; i++) {
      let cellIndex = i;
      const gridCell = document.createElement('div');
      gridCell.classList.add('grid-cell');
      gridCell.dataset.index = cellIndex;
      gameGrid.appendChild(gridCell);
    }
  }

  function reloadGrid() {
    clearGrid();
    setupGrid(currentSize);
  }

  function clearGrid() {
    gameGrid.innerHTML = '';
    GameBoard.resetCells();
    updateTurnMark('O');
    hideResultModal();
  }

  function clickHandlerBoard(e) {
    const selectedCellIndex = e.target.dataset.index;
    const cell = e.target;

    if (!selectedCellIndex) return;

    GameController.playRound(selectedCellIndex, cell);

    updateGameboard();
  }

  gameGrid.addEventListener('click', clickHandlerBoard);

  return { showResultModal, updateScore, updateTurnMark, declareWinner, declareTie };
})();

/* function activeMarkerType(type) {
  if (!type.classList.contains('active-type')) {
    if (type.classList.contains('first-type')) {
      activeFirstType();
    } else {
      activeSecondType();
    }
  }
}

function activeFirstType() {
  currentType = 'X';
  firstType.classList.add('active-type');
  secondType.classList.remove('active-type');
}

function activeSecondType() {
  currentType = 'O';
  secondType.classList.add('active-type');
  firstType.classList.remove('active-type');
}

function markCell(cell) {
  cell.textContent = currentType;
}

 */

const GameController = ((playerOneName = 'Player One', playerTwoName = 'Player Two') => {
  let round = 1;
  let gameMode = 1; // 1 - Player vs Player, 2- Player vs BOT
  let playerXScore = 0,
    playerOScore = 0,
    tiedMatches = 0;

  const players = [
    {
      name: playerOneName,
      mark: 'X',
      color: 'red',
    },
    {
      name: playerTwoName,
      mark: 'O',
      color: '#2e9cca',
    },
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const incrementPlayerScore = () => {
    if (getActivePlayer().mark === 'X') {
      playerXScore++;
    }

    if (getActivePlayer().mark === 'O') {
      playerOScore++;
    }
  };

  const resetRoundState = () => {
    round = 1;
    activePlayer = players[0];
  };

  const clearGame = () => {
    playerXScore = 0;
    playerOScore = 0;
    tiedMatches = 0;
    resetRoundState();
  };

  const playRound = (index, currentCell) => {
    if (!GameBoard.getCell(index)) {
      GameBoard.setCell(index, getActivePlayer().mark);
      let cellColor = GameController.getActivePlayer().color;
      currentCell.style.color = cellColor;

      let cells = GameBoard.getBoard();

      if (checkWinner()) {
        incrementPlayerScore();
        ScreenController.declareWinner();
        ScreenController.updateScore(playerXScore, playerOScore, tiedMatches);
        resetRoundState();
        return;
      } else if (round === cells.length) {
        tiedMatches++;
        ScreenController.declareTie();
        ScreenController.updateScore(playerXScore, playerOScore, tiedMatches);
        resetRoundState();
        return;
      } else {
        ScreenController.updateTurnMark(getActivePlayer().mark);
        switchPlayerTurn();
        round++;
      }
    }
  };

  const checkWinner = () => {
    let boardCells = GameBoard.getBoard();
    let cells = document.querySelectorAll('.grid-cell');
    let winConditions;

    if (currentSize === 3) {
      winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
    }

    if (currentSize === 4) {
      winConditions = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [0, 5, 10, 15],
        [3, 6, 9, 12],
      ];
    }

    if (currentSize === 5) {
      winConditions = [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24],
        [0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        [0, 6, 12, 18, 24],
        [4, 8, 12, 16, 20],
      ];
    }

    if (currentSize === 6) {
      winConditions = [
        [0, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11],
        [12, 13, 14, 15, 16, 17],
        [18, 19, 20, 21, 22, 23],
        [24, 25, 26, 27, 28, 29],
        [30, 31, 32, 33, 34, 35],
        [0, 6, 12, 18, 24, 30],
        [1, 7, 13, 19, 25, 31],
        [2, 8, 14, 20, 26, 32],
        [3, 9, 15, 21, 27, 33],
        [4, 10, 16, 22, 28, 34],
        [5, 11, 17, 23, 29, 35],
        [0, 7, 14, 21, 28, 35],
        [3, 8, 13, 18, 23, 28],
      ];
    }

    function hightlightWinCombination(elem) {
      elem.style.color = '#86c232';
      elem.style.backgroundColor = '#2e9cca';
    }

    function calculateWinCombination(size, a, b, c, d, e, f) {
      if (size === 3) {
        if (boardCells[a] && boardCells[a] === boardCells[b] && boardCells[a] === boardCells[c]) {
          cells.forEach((elem) => {
            if (
              parseInt(elem.dataset.index) === a ||
              parseInt(elem.dataset.index) === b ||
              parseInt(elem.dataset.index) === c
            ) {
              hightlightWinCombination(elem);
            }
          });
          return 1;
        }
      }

      if (size === 4) {
        if (
          boardCells[a] &&
          boardCells[a] === boardCells[b] &&
          boardCells[b] === boardCells[c] &&
          boardCells[c] === boardCells[d]
        ) {
          cells.forEach((elem) => {
            if (
              parseInt(elem.dataset.index) === a ||
              parseInt(elem.dataset.index) === b ||
              parseInt(elem.dataset.index) === c ||
              parseInt(elem.dataset.index) === d
            ) {
              hightlightWinCombination(elem);
            }
          });
          return 1;
        }
      }

      if (size === 5) {
        if (
          boardCells[a] &&
          boardCells[a] === boardCells[b] &&
          boardCells[b] === boardCells[c] &&
          boardCells[c] === boardCells[d] &&
          boardCells[d] === boardCells[e]
        ) {
          cells.forEach((elem) => {
            if (
              parseInt(elem.dataset.index) === a ||
              parseInt(elem.dataset.index) === b ||
              parseInt(elem.dataset.index) === c ||
              parseInt(elem.dataset.index) === d ||
              parseInt(elem.dataset.index) === e
            ) {
              hightlightWinCombination(elem);
            }
          });
          return 1;
        }
      }

      if (size === 6) {
        if (
          boardCells[a] &&
          boardCells[a] === boardCells[b] &&
          boardCells[b] === boardCells[c] &&
          boardCells[c] === boardCells[d] &&
          boardCells[d] === boardCells[e] &&
          boardCells[e] === boardCells[f]
        ) {
          cells.forEach((elem) => {
            if (
              parseInt(elem.dataset.index) === a ||
              parseInt(elem.dataset.index) === b ||
              parseInt(elem.dataset.index) === c ||
              parseInt(elem.dataset.index) === d ||
              parseInt(elem.dataset.index) === e ||
              parseInt(elem.dataset.index) === f
            ) {
              hightlightWinCombination(elem);
            }
          });
          return 1;
        }
      }
    }

    if (currentSize === 3) {
      for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (calculateWinCombination(currentSize, a, b, c)) {
          return 1;
        }
      }
    }

    if (currentSize === 4) {
      for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c, d] = winConditions[i];
        if (calculateWinCombination(currentSize, a, b, c, d)) {
          return 1;
        }
      }
    }

    if (currentSize === 5) {
      for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c, d, e] = winConditions[i];
        if (calculateWinCombination(currentSize, a, b, c, d, e)) {
          return 1;
        }
      }
    }

    if (currentSize === 6) {
      for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c, d, e, f] = winConditions[i];
        if (calculateWinCombination(currentSize, a, b, c, d, e, f)) {
          return 1;
        }
      }
    }

    return null;
  };

  return {
    playRound,
    getActivePlayer,
    clearGame,
  };
})();

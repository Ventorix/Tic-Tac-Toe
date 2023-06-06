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
    currentSize = value;
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
    const selectedCell = e.target.dataset.index;

    if (!selectedCell) return;

    GameController.playRound(selectedCell);
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
    },
    {
      name: playerTwoName,
      mark: 'O',
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

  const playRound = (index) => {
    if (!GameBoard.getCell(index)) {
      GameBoard.setCell(index, getActivePlayer().mark);
      let cells = GameBoard.getBoard();
      console.log(cells.length);
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

    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < winConditions.length; i++) {
      const [a, b, c] = winConditions[i];
      if (boardCells[a] && boardCells[a] === boardCells[b] && boardCells[a] === boardCells[c]) {
        cells.forEach((elem) => {
          if (
            parseInt(elem.dataset.index) === a ||
            parseInt(elem.dataset.index) === b ||
            parseInt(elem.dataset.index) === c
          ) {
            elem.style.color = '#86c232';
            elem.style.backgroundColor = '#2e9cca';
          }
        });
        return boardCells[a];
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

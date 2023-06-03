import './index.html';
import './index.scss';

const DEFAULT_SIZE = 3;
const DEFAULT_TYPE = 'X';

let currentSize = DEFAULT_SIZE;
let currentType = DEFAULT_TYPE;

const GameBoard = (() => {
  const board = new Array(currentSize ** 2);

  const getBoard = () => board;

  const getCell = (index) => board[index];

  const setCell = (index, mark) => (board[index] = mark);

  const resetCells = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = '';
    }
  };
  return { getBoard, getCell, setCell, resetCells };
})();

const ScreenController = (() => {
  const markerType = document.querySelectorAll('.type-btn');
  const firstType = document.querySelector('.first-type');
  const secondType = document.querySelector('.second-type');
  const sizeValue = document.querySelector('.grid-size');
  const sizeSlider = document.querySelector('.range-slider');
  const gameGrid = document.querySelector('.game-grid');
  const overlay = document.querySelector('.overlay');
  const resultModal = document.querySelector('.result-modal');
  const continueButton = document.querySelector('.result-modal__continue-btn');
  const playerXScore = document.getElementById('xScore');
  const playerOScore = document.getElementById('oScore');
  const tieScore = document.getElementById('tieScore');

  continueButton.addEventListener('click', setupGrid().reloadGrid);
  sizeSlider.addEventListener('input', (e) => changeSize(e.target.value));

  markerType.forEach((elem) => elem.addEventListener('click', (e) => activeMarkerType(e.target)));

  function updateScore(xScore, oScore, tiedMatches) {
    playerXScore.textContent = xScore;
    playerOScore.textContent = oScore;
    tieScore.textContent = tiedMatches;
  }

  function showResultModal() {
    resultModal.classList.remove('hide');
    overlay.classList.remove('hide');
  }

  function hideResultModal() {
    resultModal.classList.add('hide');
    overlay.classList.add('hide');
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

    function reloadGrid() {
      clearGrid();
      setupGrid(currentSize);
      hideResultModal();
    }

    function clearGrid() {
      gameGrid.innerHTML = '';
      GameBoard.resetCells();
    }

    return {
      reloadGrid,
      clearGrid,
    };
  }

  function clickHandlerBoard(e) {
    const selectedCell = e.target.dataset.index;

    if (!selectedCell) return;

    GameController.playRound(selectedCell);
    updateGameboard();
  }

  gameGrid.addEventListener('click', clickHandlerBoard);
  setupGrid(currentSize);

  return { showResultModal, updateScore };
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

function updateSizeValue(value) {
  sizeValue.innerHTML = `${value} x ${value}`;
}

function changeSize(value) {
  currentSize = value;
  updateSizeValue(value);
  reloadGrid();
} */

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

  const playRound = (index) => {
    if (!GameBoard.getCell(index)) {
      GameBoard.setCell(index, getActivePlayer().mark);

      if (checkWinner(index)) {
        incrementPlayerScore();
        console.log(playerXScore, playerOScore, tiedMatches);
        document.getElementById('winner').textContent = getActivePlayer().mark;
        ScreenController.updateScore(playerXScore, playerOScore, tiedMatches);
        ScreenController.showResultModal();
        round = 1;
        return;
      }

      if (round === 9) {
        tiedMatches++;
        ScreenController.updateScore(playerXScore, playerOScore, tiedMatches);
        ScreenController.showResultModal();
        round = 1;
        return;
      }

      switchPlayerTurn();
      round++;
    }
  };

  const checkWinner = () => {
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

    if (checkWinXSquare() || checkWinOSquare()) {
      return 1;
    }

    function checkWinXSquare() {
      return winConditions.some((combination) => {
        return combination.every((i) => {
          return GameBoard.getCell(i) === 'X';
        });
      });
    }

    function checkWinOSquare() {
      console.log(getActivePlayer());
      return winConditions.some((combination) => {
        return combination.every((i) => {
          return GameBoard.getCell(i) === 'O';
        });
      });
    }
  };

  return {
    playRound,
    getActivePlayer,
  };
})();

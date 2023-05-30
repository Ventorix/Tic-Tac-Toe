import './index.html';
import './index.scss';

const DEFAULT_SIZE = 3;
const DEFAULT_TYPE = 'X';

let currentSize = DEFAULT_SIZE;
let currentType = DEFAULT_TYPE;

const gameGrid = document.querySelector('.game-grid');
const markerType = document.querySelectorAll('.type-btn');
const firstType = document.querySelector('.first-type');
const secondType = document.querySelector('.second-type');
const sizeValue = document.querySelector('.grid-size');
const sizeSlider = document.querySelector('.range-slider');

sizeSlider.addEventListener('input', (e) => changeSize(e.target.value));
window.addEventListener('load', setupGrid(currentSize));

markerType.forEach((elem) => elem.addEventListener('click', (e) => activeMarkerType(e.target)));

function activeMarkerType(type) {
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
function setupGrid(size) {
  gameGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gameGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  for (let i = 0; i < size ** 2; i++) {
    let cellIndex = i;
    const gridCell = document.createElement('div');
    gridCell.classList.add('grid-cell');
    gridCell.dataset.index = cellIndex;
    gridCell.addEventListener('click', (e) => markCell(e.target));
    gameGrid.appendChild(gridCell);
  }
}

function markCell(cell) {
  cell.textContent = currentType;
}

function reloadGrid() {
  clearGrid();
  setupGrid(currentSize);
}

function clearGrid() {
  gameGrid.innerHTML = '';
}

function updateSizeValue(value) {
  sizeValue.innerHTML = `${value} x ${value}`;
}

function changeSize(value) {
  currentSize = value;
  updateSizeValue(value);
  reloadGrid();
}

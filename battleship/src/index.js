import './style.css';
import Player from "./player.js";

let selectedShip = null;
let selectedOrientation = 'horiz'; // or 'vert'
let gamePhase = 'placement';
const placedShips = new Set();

//Generate boards in the DOM
const humanBoard = document.getElementById('human');
const computerBoard = document.getElementById('computer');


function createCell(row, col) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = `${row},${col}`;
    cell.dataset.row = row;
    cell.dataset.col = col;
    return cell;
  }
  
  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 10; col++) {
      humanBoard.appendChild(createCell(row, col));
      computerBoard.appendChild(createCell(row, col));
    }
  }

//Set up players and ships
const human = Player("human");
const computer = Player("computer");


const ships = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
const humanShipsSection = document.getElementById('human-ships');
const computerShipsSection = document.getElementById('computer-ships');

function renderShips(player, container) {
    for (let ship of ships) {
      const shipDiv = document.createElement('div');
      const shipImg = document.createElement('img');
      const shipDesc = document.createElement('p');
      shipImg.src = player.getBoard().getShipDetails(ship).image;
      shipDesc.textContent = ship.charAt(0).toUpperCase() + ship.slice(1).toLowerCase();
  
      if (player === human) {
        shipDiv.id = ship;
        shipImg.addEventListener('click', () => {
            shipDiv.classList.add('selected');
            selectShip(ship);
        });
      }
  
      shipDiv.classList.add('ship-img');
      shipDiv.append(shipImg, shipDesc)
      container.appendChild(shipDiv);
    }
  }

renderShips(human, humanShipsSection);
renderShips(computer, computerShipsSection);

//Placement phase
    //TODO: Make computer randomly and validly place ships (including at different orientations)
    //TODO: Give human a way to rotate orientation between vert and horiz for placement


function selectShip(ship) {
    selectedShip = ship;
    console.log(`${ship} clicked`)
}

function handleHover(event) {
    if (!selectedShip || placedShips.has(selectedShip) || !event.target.classList.contains('cell')) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const length = human.getBoard().getShipDetails(selectedShip).length;

    for (let i = 0; i < length; i++) {
        let cell;
        if (selectedOrientation === 'horiz') {
            cell = document.querySelector(`#human .cell[data-row="${row}"][data-col="${col + i}"]`);
        } else {
            cell = document.querySelector(`#human .cell[data-row="${row + i}"][data-col="${col}"]`);
        }
        if (cell) cell.classList.add('highlight');
    }
}

function clearHover() {
    document.querySelectorAll('#human .cell.highlight').forEach(cell =>
        cell.classList.remove('highlight')
    );
}

function persistHighlight() {
    document.querySelectorAll('#human .cell.highlight').forEach(cell =>
        cell.style.backgroundColor = '#0bd200a7'
    );
}

function handlePlacement(event) {
    if (!selectedShip || !event.target.classList.contains('cell')) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    try {
        human.place(selectedShip, [row, col], selectedOrientation);
    } catch(error) {
        console.log(error.message);
        return;
    }
    persistHighlight();
    const shipDiv = document.getElementById(selectedShip)
    console.log(selectedShip)
    shipDiv.classList.add('placed');
    placedShips.add(selectedShip);
    selectedShip = null;
    clearHover();

    if (human.getBoard().getBoardStatus().placed === 5) {
        bigMessage("Battle time");
        const placed = document.querySelectorAll('.ship-img');
        placed.forEach( div => div.classList.remove('placed'));
        setGamePhase('playerTurn');
    }
}

function bigMessage(message) {
    console.log(message);
}
    
function rotate() {
    // Example: toggle orientation
    selectedOrientation = selectedOrientation === 'horiz' ? 'vert' : 'horiz';
}


humanBoard.addEventListener('mouseover', handleHover);
humanBoard.addEventListener('mouseout', clearHover);
humanBoard.addEventListener('click', handlePlacement);

document.addEventListener('click', (e) => {
    
    const clickedInsideShip = e.target.closest('.ship-img');
    
    const shipDivs = document.querySelectorAll('.ship-img');
    shipDivs.forEach(div => {
      if (div !== clickedInsideShip) {
        div.classList.remove('selected');
      }
    });
  });

function setGamePhase(newPhase) {
    gamePhase = newPhase;
    if (gamePhase === "playerTurn") {
        playerTurn();
    }
    if (gamePhase === "computerTurn") {
        //disable board for clicking
        //have computer go
        computerTurn();
    }
    if (gamePhase === "gameOver") {
        bigMessage("Game over!")
    }
}


//Main phase
    //Create turns between human and computer
    //Create a small delay for the computer's turn like it's picking and then freeze the computer board so human can't click until computer has gone
    //Inform the user of a miss and a hit (both for user and computer)
    //Display missed shots and hits on the enemy board
    //Check for win after each turn + inform the user who won if there is a win

  function playerTurn() {
    computerBoard.addEventListener('mouseover', enemyBoardHover);
    computerBoard.addEventListener('mouseout', clearEnemyHover);

  }
  function computerTurn() {
    computerBoard.removeEventListener('mouseover', enemyBoardHover);
    computerBoard.removeEventListener('mouseout', clearEnemyHover);

  }

function enemyBoardHover(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    let cell = document.querySelector(`#computer .cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add('highlight');
}

function clearEnemyHover(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    let cell = document.querySelector(`#computer .cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.remove('highlight');
}
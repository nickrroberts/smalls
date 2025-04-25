import './style.css';
import Player from "./player.js";

let selectedShip = null;
let selectedOrientation = 'horiz'; // or 'vert'
let gamePhase = 'placement';
const placedShips = new Set();

// AI state for computer targeting
const shotsFired = new Set();
const targetQueue = [];

//Generate boards in the DOM
const humanBoard = document.getElementById('human');
const computerBoard = document.getElementById('computer');

// Unified hover toggling for the computer board
function toggleEnemyHover(event, highlight) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = document.querySelector(
        `#computer .cell[data-row="${row}"][data-col="${col}"]`
    );
    if (cell) cell.classList[highlight ? 'add' : 'remove']('highlight');
}

function enemyBoardHover(event) {
    toggleEnemyHover(event, true);
}

function clearEnemyHover(event) {
    toggleEnemyHover(event, false);
}

// Helper to add or remove listeners on the computer board
function updateComputerBoardListeners(enable) {
    const method = enable ? 'addEventListener' : 'removeEventListener';
    computerBoard[method]('mouseover', enemyBoardHover);
    computerBoard[method]('mouseout', clearEnemyHover);
    computerBoard[method]('click', takeShot);
}


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
let human = Player("Human");
let computer = Player("Computer");


const ships = ["carrier", "battleship", "cruiser", "submarine", "destroyer"];
const humanShipsSection = document.getElementById('human-ships');
const computerShipsSection = document.getElementById('computer-ships');
const rotateBtn = document.createElement('button');
rotateBtn.textContent = "🔄 Rotate ship";

humanShipsSection.prepend(rotateBtn);

function renderShips(player, container) {
    for (let ship of ships) {
      const shipDiv = document.createElement('div');
      // give each ship icon a unique id for sunk-state styling
      shipDiv.id = `${player.playerType.toLowerCase()}-${ship}`;
      const shipImg = document.createElement('img');
      const shipDesc = document.createElement('p');
      shipImg.src = player.getBoard().getShipDetails(ship).image;
      shipDesc.textContent = ship.charAt(0).toUpperCase() + ship.slice(1).toLowerCase();
       
      if (player === human) {
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

function placeComputerShips() {
    ships.forEach((ship) => {

        while (true) {
            const row  = Math.floor(Math.random() * 10) + 1;
            const col = Math.floor(Math.random() * 10) + 1;
            const selectedOrientation = Math.random() < 0.5 ? 'horiz' : 'vert';


            try {
                console.log(ship, [col, row], selectedOrientation);
                computer.place(ship, [col, row], selectedOrientation);

                break;
            } catch (error) {
                console.log(`Retrying ${ship}:`, error.message);
            }
        }

    });
}


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
        console.log([col, row])
        human.place(selectedShip, [col, row], selectedOrientation);
    } catch(error) {
        console.log(error.message);
        return;
    }
    persistHighlight();
    const shipDiv = document.getElementById(`human-${selectedShip}`);
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
    saveGame();
}

function bigMessage(message) {
    console.log(message);
}
    
function rotate() {
    selectedOrientation = selectedOrientation === 'horiz' ? 'vert' : 'horiz';
}


humanBoard.addEventListener('mouseover', handleHover);
humanBoard.addEventListener('mouseout', clearHover);
rotateBtn.addEventListener('click', rotate);
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
    updateComputerBoardListeners(true);
}

function computerTurn() {
    updateComputerBoardListeners(false);
    setTimeout(() => takeShot(), 500);
}


function takeShot(event) {
    console.log('shot taken')
    if (gamePhase === "gameOver") return;
    let row, col;
    if (gamePhase === "playerTurn") {
        // human clicking
        row = parseInt(event.target.dataset.row);
        col = parseInt(event.target.dataset.col);
    } else {

        while (targetQueue.length > 0 && shotsFired.has(`${targetQueue[0][0]},${targetQueue[0][1]}`)) {
            targetQueue.shift();
        }
        if (targetQueue.length > 0) {
            [col, row] = targetQueue.shift();
        } else {
            // random until unshot coordinate found
            do {
                row = Math.floor(Math.random() * 10) + 1;
                col = Math.floor(Math.random() * 10) + 1;
            } while (shotsFired.has(`${col},${row}`));
        }
    }
    let shooter;
    let receiver;

    

     if (gamePhase === "playerTurn") {
        shooter = human;
        receiver = computer;
     } else {
        shooter = computer; 
        receiver = human;
     }
    
    const result = shooter.fire(receiver, [col, row]);

    // record this shot as fired
    shotsFired.add(`${col},${row}`);

    console.log(`Shooter: ${shooter.playerType}, Receiver: ${receiver.playerType}, Coords: [${col}, ${row}]`);
    const targetBoardSelector = shooter === human ? '#computer' : '#human';
    const cell = document.querySelector(`${targetBoardSelector} .cell[data-row="${row}"][data-col="${col}"]`);

    if (result.status === "Hit") {
       
        if (cell) cell.style.backgroundColor = '#FFA500';
        bigMessage(`That's a hit!`);

        if (result.sunk) {
            bigMessage(`That's a hit and player ${shooter.playerType} sunk a ${result.type}`);
            const owner = shooter === human ? 'computer' : 'human';
            const sunkIcon = document.getElementById(`${owner}-${result.type}`);
            
            if (sunkIcon) sunkIcon.style.backgroundColor = '#FF0000';
        }
    } else {
        if (cell) cell.style.backgroundColor = '#e0e0e0';
        bigMessage('Miss!');
    }

    // AI targeting logic for computer
    if (shooter === computer) {
        if (result.status === "Hit") {
            if (!result.sunk) {
               
                const neighbors = [
                    [col + 1, row],
                    [col - 1, row],
                    [col, row + 1],
                    [col, row - 1]
                ];
                neighbors.forEach(([c, r]) => {
                    if (c >= 1 && c <= 10 && r >= 1 && r <= 10 && !shotsFired.has(`${c},${r}`)) {
                        targetQueue.push([c, r]);
                    }
                });
            } else {
                targetQueue.length = 0;
            }
        }
    }

    if (shooter.checkWin(receiver)) {
        bigMessage(`That's game over! ${shooter.playerType} is the winner!`);
    }

    shooter === human ? setGamePhase("computerTurn") : setGamePhase("playerTurn");
    saveGame();
}

// Save current game state to localStorage
function saveGame() {
    const state = {
        gamePhase,
    };
    // Serialize model state and AI state
    state.humanStatus = human.getBoard().getBoardStatus();
    state.computerStatus = computer.getBoard().getBoardStatus();
    state.shotsFired = Array.from(shotsFired);
    state.targetQueue = Array.from(targetQueue);
    localStorage.setItem('battleshipState', JSON.stringify(state));
}

// Load game state or initialize fresh
function loadGame() {
    const saved = localStorage.getItem('battleshipState');
    if (saved) {
        const state = JSON.parse(saved);
        human = Player("Human");
        computer = Player("Computer");
        // Place computer ships from saved state
        if (state.computerStatus && state.computerStatus.ships) {
            for (const [ship, info] of Object.entries(state.computerStatus.ships)) {
                const coords = info.location;
                const orientation = coords.length > 1 && coords[1][0] !== coords[0][0] ? 'horiz' : 'vert';
                computer.place(ship, coords[0], orientation);
            }
        }
        // Place human ships from saved state
        if (state.humanStatus && state.humanStatus.ships) {
            for (const [ship, info] of Object.entries(state.humanStatus.ships)) {
                const coords = info.location;
                const orientation = coords.length > 1 && coords[1][0] !== coords[0][0] ? 'horiz' : 'vert';
                human.place(ship, coords[0], orientation);
            }
        }
        // Restore hits and misses on both boards
        if (state.humanStatus) {
            if (Array.isArray(state.humanStatus.hits)) {
                state.humanStatus.hits.forEach(([c, r]) =>
                    human.getBoard().receiveAttack([c, r])
                );
            }
            if (Array.isArray(state.humanStatus.misses)) {
                state.humanStatus.misses.forEach(([c, r]) =>
                    human.getBoard().receiveAttack([c, r])
                );
            }
        }
        if (state.computerStatus) {
            if (Array.isArray(state.computerStatus.hits)) {
                state.computerStatus.hits.forEach(([c, r]) =>
                    computer.getBoard().receiveAttack([c, r])
                );
            }
            if (Array.isArray(state.computerStatus.misses)) {
                state.computerStatus.misses.forEach(([c, r]) =>
                    computer.getBoard().receiveAttack([c, r])
                );
            }
        }
        // Restore AI targeting state
        shotsFired.clear();
        if (Array.isArray(state.shotsFired)) {
            state.shotsFired.forEach(coord => shotsFired.add(coord));
        }
        targetQueue.length = 0;
        if (Array.isArray(state.targetQueue)) {
            targetQueue.push(...state.targetQueue);
        }
        // After restoring model, rebuild the DOM from model:
        humanBoard.innerHTML = '';
        computerBoard.innerHTML = '';
        for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 10; col++) {
                humanBoard.appendChild(createCell(row, col));
                computerBoard.appendChild(createCell(row, col));
            }
        }
        // Render ships and icons
        humanShipsSection.innerHTML = '';
        computerShipsSection.innerHTML = '';
        humanShipsSection.prepend(rotateBtn);
        renderShips(human, humanShipsSection);
        renderShips(computer, computerShipsSection);
        // Highlight placed ships and hits/misses only if game has started
        if (state.gamePhase !== 'placement') {
            // Human board hits and misses
            if (state.humanStatus && Array.isArray(state.humanStatus.hits) && Array.isArray(state.humanStatus.misses)) {
                [...state.humanStatus.misses, ...state.humanStatus.hits].forEach(([c, r]) => {
                    const sel = `#human .cell[data-row="${r}"][data-col="${c}"]`;
                    const cellEl = document.querySelector(sel);
                    if (cellEl) {
                        const isHit = state.humanStatus.hits.some(([hc, hr]) => hc === c && hr === r);
                        cellEl.style.backgroundColor = isHit ? '#FFA500' : '#e0e0e0';
                    }
                });
            }
            // Computer board hits and misses
            if (state.computerStatus && Array.isArray(state.computerStatus.hits) && Array.isArray(state.computerStatus.misses)) {
                [...state.computerStatus.misses, ...state.computerStatus.hits].forEach(([c, r]) => {
                    const sel = `#computer .cell[data-row="${r}"][data-col="${c}"]`;
                    const cellEl = document.querySelector(sel);
                    if (cellEl) {
                        const isHit = state.computerStatus.hits.some(([hc, hr]) => hc === c && hr === r);
                        cellEl.style.backgroundColor = isHit ? '#e0e0e0' : '#e0e0e0';
                    }
                });
            }
        }
        setGamePhase(state.gamePhase);
    } else {
        renderShips(human, humanShipsSection);
        renderShips(computer, computerShipsSection);
        placeComputerShips();
        setGamePhase('placement');
    }
}

loadGame();

// Reset game state and reload
document.getElementById('reset-btn').addEventListener('click', () => {
    localStorage.removeItem('battleshipState');
    location.reload();
});
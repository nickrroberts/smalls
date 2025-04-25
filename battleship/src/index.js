import './style.css';
import Player from "./player.js";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import hit from "./assets/hit.svg";
import miss from "./assets/miss.svg";

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

//Notifications setup

const baseToastOptions = {
    duration: 250,
    gravity: "top",
    position: "center",
    style: {
      background: "#00FF66",
      color: "#000",
      fontFamily: "Share Tech Mono, monospace",
      fontSize: "1.5rem",
      padding: "1.25rem 2rem",
      borderRadius: "5px"
    },
    className: "center-toast"
}

// Simple toast queue to prevent overlapping
const toastQueue = [];
let isShowingToast = false;

function showToast(message, overrides = {}) {
  toastQueue.push({ message, overrides });
  if (!isShowingToast) _showNextToast();
}

function _showNextToast() {
  if (!toastQueue.length) {
    isShowingToast = false;
    return;
  }
  isShowingToast = true;
  const { message, overrides } = toastQueue.shift();
  Toastify({
    ...baseToastOptions,
    ...overrides,
    text: message
  }).showToast();

  setTimeout(() => {
    const btn = document.getElementById("new-game-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        location.reload();
      });
    }
  }, 100);

  setTimeout(
    _showNextToast,
    overrides.duration ?? baseToastOptions.duration ?? 2000
  );
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
        human.place(selectedShip, [col, row], selectedOrientation);
    } catch(error) {
        console.log(error.message);
        return;
    }
    persistHighlight();
    const shipDiv = document.getElementById(`human-${selectedShip}`);
    shipDiv.classList.add('placed');
    placedShips.add(selectedShip);
    selectedShip = null;
    clearHover();

    if (human.getBoard().getBoardStatus().placed === 5) {
        showToast("Battle time!");
        const placed = document.querySelectorAll('.ship-img');
        placed.forEach( div => div.classList.remove('placed'));
        setGamePhase('playerTurn');
        humanShipsSection.removeChild(rotateBtn);
    }
}

function rotate() {
    selectedOrientation = selectedOrientation === 'horiz' ? 'vert' : 'horiz';
}


humanBoard.addEventListener('mouseover', handleHover);
humanBoard.addEventListener('mouseout', clearHover);
rotateBtn.addEventListener('click', rotate);
humanBoard.addEventListener('click', handlePlacement);
showToast("You are under attack. Deploy your forces!");

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
    if (gamePhase === "placement") {
        updateComputerBoardListeners(false);
        return;
    }
    if (gamePhase === "playerTurn") {
        playerTurn();
    }
    if (gamePhase === "computerTurn") {
        //disable board for clicking
        //have computer go
        computerTurn();
    }
    if (gamePhase === "gameOver") {
        showToast(`
            <div style="text-align: center;">
              <strong>Game Over!</strong><br>
              <button id="new-game-btn" style="
                margin-top: 0.5rem;
                padding: 0.5rem 1rem;
                font-size: 1rem;
                font-family: 'Share Tech Mono', monospace;
                background: #000;
                color: #00FF66;
                border: 2px solid #00FF66;
                border-radius: 6px;
                cursor: pointer;
              ">New Game</button>
            </div>
          `, {
            duration: -1,              // Persist until user clicks
            escapeMarkup: false,        // Allow HTML inside the toast
          });

          setTimeout(() => {
            const btn = document.getElementById("new-game-btn");
            if (btn) {
              btn.addEventListener("click", () => {
                localStorage.removeItem("battleshipState");
                location.reload();
              });
            }
          }, 100);
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
    showToast("Your turn!", {className: ""});
}

function computerTurn() {
    updateComputerBoardListeners(false);
    setTimeout(() => takeShot(), 500);
}


function takeShot(event) {
    if (gamePhase === "gameOver") return;
    let row, col;
    if (gamePhase === "playerTurn") {
        const clickedCell = event.target.closest('.cell');
        if (!clickedCell) return; 
        row = parseInt(clickedCell.dataset.row);
        col = parseInt(clickedCell.dataset.col);
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
    
    let result;

    try {
        result = shooter.fire(receiver, [col, row]);
    } catch (error) {
        console.error(error);
        showToast(error.message, { className: "" });
        return;
    }
    

    // record this shot as fired
    shotsFired.add(`${col},${row}`);

    const targetBoardSelector = shooter === human ? '#computer' : '#human';
    const cell = document.querySelector(`${targetBoardSelector} .cell[data-row="${row}"][data-col="${col}"]`);

    if (result.status === "Hit") {
        showToast("Hit!", {className: ""});
        if (cell) {
            cell.classList.remove("highlight");
            cell.innerHTML = '';
            const img = document.createElement('img');
            img.src = hit;
            img.alt = 'Hit';
            img.classList.add('hit-icon');
            cell.appendChild(img);
        };

        if (result.sunk) {
            //highlight the ship in the ship section
            showToast(`Player ${shooter.playerType} sunk a ${result.type}!`);

            const owner = shooter === human ? 'computer' : 'human';
            const sunkIcon = document.getElementById(`${owner}-${result.type}`);
            
            if (sunkIcon) sunkIcon.style.backgroundColor = '#FF0000';

            //highlight the squares
            const coords = receiver.getBoard().getShipCoords(result.type);
            coords.forEach(([c, r]) => {
                const sunkCell = document.querySelector(
                    `#${receiver.playerType.toLowerCase()} .cell[data-row="${r}"][data-col="${c}"]`
                );
                if (sunkCell) {
                    sunkCell.innerHTML = '';
                    sunkCell.style.backgroundColor = '#FF0000';
                }
            });
        }
    } else {
        showToast("Miss!", {className: ""});
        if (cell) {
            cell.classList.remove("highlight");
            cell.innerHTML = '';
            const img = document.createElement('img');
            img.src = miss;
            img.alt = 'Miss';
            img.classList.add('miss-icon');
            cell.appendChild(img);
        };
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
        showToast(`🎉 That's game over! ${shooter.playerType} is the winner!`, { className: "", duration: 3000 });
        setGamePhase("gameOver");
        return;
    }

    shooter === human ? setGamePhase("computerTurn") : setGamePhase("playerTurn");
}

document.addEventListener('DOMContentLoaded', () => {
  renderShips(human, humanShipsSection);
  renderShips(computer, computerShipsSection);
  placeComputerShips();
  setGamePhase('placement');
});
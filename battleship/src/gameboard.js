import Ship from "./ship.js";

export default function Gameboard() {
    //10 x 10 board A-J, 1-10, letters in the DOM convert to numbers placement and strike coords
    const ships = {
        carrier: Ship("carrier"),
        battleship: Ship("battleship"),
        cruiser: Ship("cruiser"),
        submarine: Ship("submarine"),
        destroyer: Ship("destroyer")
    }
    const strikes = [];

    function generateCoords (startPoint, length, orientation) {
        const potentialCoords = [];

        for (let i=0; i < (length + 1); i++) {
            if (orientation === "vert") potentialCoords.push([startPoint[0], startPoint[1] + i])
            if (orientation === "horiz") potentialCoords.push([startPoint[0] + i, startPoint[1]])
        } 

        return potentialCoords;
    }

    function shipAtCoordinate(potentialCoords) {
        for (let ship in ships) {
            if (ships[ship].isPlaced() === true) {
                for (let coordinate of ships[ship].getLocation()) {
                    for (let coord of potentialCoords) {
                        if (coord[0] === coordinate[0] && coord[1] === coordinate[1]) {
                            return ship;
                        }   
                    }
                }
                
            }
        }
        return false;
    }


    return {
        placeShip(type, coordinates, orientation) {
            if (ships[type].isPlaced() === true) {
                throw new Error("Invalid! Can only place one of each ship type.");
            }
            
            const coords = generateCoords(coordinates, ships[type].length, orientation)
                
            for (let coord of coords) {
                if (coord[0] > 10 || coord[1] > 10) {
                    throw new Error("Invalid placement! Ship must be entirely on the game board.");
                }
            }

            if (shipAtCoordinate(coords)) {
                throw new Error("Invalid placement! Cannot place a ship on another ship.");
            }
            else {
                ships[type].place(coords);
                return `${type} placed at ${coords}`
            }
        },

        receiveAttack(coordinates) {
            //rejects attacks at the same coordinates
            //determines whether attack hit a placed ship         
            //sends a hit() message to ship if so
            //determines if the ship is sunk
            //or records the miss
            for (let strike of strikes) {
                if (strike[0] === coordinates[0] && strike[1] === coordinates[1]) {
                    throw new Error("Invalid move. You've already hit that spot.");
                }              
            }

            strikes.push(coordinates);
     
            const ship = shipAtCoordinate([coordinates])

            if (ship) {
                ships[ship].hit();

                if (ships[ship].isSunk()) {
                    return `A hit! And....${ships[ship]} is sunk!`;
                } else {
                    return "Hit!";
                }
            }
            
            return "Miss!";
        },

        getShipDetails(ship) {
            return ships[ship];

        },

        getBoardStatus() {         
            let placedCount = 0;
            let sunkCount = 0;
            for (let ship in ships) {
                if (ships[ship].isPlaced()) placedCount++;
                if (ships[ship].isSunk()) sunkCount++;
            }
            return {
                placed: placedCount,
                sunk: sunkCount
            }
        },

        
    }
}
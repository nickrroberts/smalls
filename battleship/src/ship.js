import carrier from "./assets/carrier.png";
import battleship from "./assets/battleship.png";
import cruiser from "./assets/cruiser.png";
import submarine from "./assets/submarine.png";
import destroyer from "./assets/destroyer.png";

export default function Ship(type) {
    let hits = 0;
    let placed = false;
    let location = null;
    let length = null;
    let image = null
    
    switch (type)  {
        case "carrier": 
            image = carrier;
            length = 5;
            break;
        case "battleship":
            image = battleship;
            length = 4;
            break;
        case "cruiser": 
            image = cruiser;
            length = 3;
            break;
        case "submarine":
            image = submarine;
            length = 3;
            break;
        case "destroyer":
            image = destroyer;
            length = 2;
            break;
        default:
            throw new Error("Must pass a valid ship type to the Ship factory.")
    }

    return {
        image,

        length,

        hit() {
            return hits += 1;
        },

        getHits() {
            return hits;
        },

        isPlaced() {
            return placed;
        },

        place(coordinates) {
            location = coordinates;
            placed = true;
        },

        getLocation() {
            return location;
        },

        isSunk() {
            if (this.getHits() >= this.length) {
                return true;
            }
            return false;
        },

        

    }
}
export default function Ship(length) {
    let hits = 0;
    let placed = false;
    let location = null;
    const shipLength = length;
    

    return {

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
            if (this.getHits() >= shipLength) {
                return true;
            }
            return false;
        },

        length() {
            return shipLength;
        }

    }
}
import Ship from "../src/ship.js";

const testShip = Ship("battleship");

test("Creates a ship with a certain length", () => {
    expect(testShip.length).toBe(4);
})

test("Ship is sunk", () => {
    expect(testShip.isSunk()).toBe(false);

    for (let i=0; i < 4; i++) {
        testShip.hit()
    }

    expect(testShip.isSunk()).toBe(true);    
})
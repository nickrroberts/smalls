import Gameboard from "../src/gameboard.js";

const board = Gameboard();

board.placeShip("carrier", [1,2], "horiz"); 

test("Ship can't be placed outside of Gameboard", () => {
    expect(() => board.placeShip("battleship", [1,9], "vert")).toThrow("Invalid placement! Ship must be entirely on the game board.");
})

test("Ship cannot be placed on another ship occupying the same space", () => {
    expect(() => board.placeShip("submarine", [1,2], "horiz")).toThrow("Invalid placement! Cannot place a ship on another ship.");
})

test("No more than one of each ship type can be placed on the board", () => {
    expect(() => board.placeShip("carrier", [1,2], "horiz")).toThrow("Invalid! Can only place one of each ship type.");
})

test("Can't shoot at a spot you've already shot", () => {
    board.receiveAttack([3,4]);
    expect(() => board.receiveAttack([3,4])).toThrow("Invalid move. You've already hit that spot.");
})

//Hit should record on a validly placed ship
test("Placed ship stores on the game board", () => {  
    expect(board.receiveAttack([1,2])).toBe("Hit!");
    expect(board.receiveAttack([6,2])).toBe("Hit!");

})

test("receiveAttack replies that nothing was hit when space is empty", () => {
    expect(board.receiveAttack([4,3])).toBe("Miss!");
})

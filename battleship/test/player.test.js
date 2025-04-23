import Player from "../src/player";

const humanPlayer = Player("human");
const computerPlayer = Player("computer");

//place

humanPlayer.place("carrier", [1,2], "horiz");
computerPlayer.place("carrier", [1,2], "horiz");

//fire
test("Human shoots at computer", () => {
    expect(humanPlayer.fire(computerPlayer, [1,2])).toBe("Hit!")
})

test("Computer shoots at human", () => {
    expect(computerPlayer.fire(humanPlayer, [1,2])).toBe("Hit!")
})

//check win conditions for the game
test("If all ships for a given player are sunk after a shot, announce it.", () => {
    humanPlayer.fire(computerPlayer, [2,2]);
    humanPlayer.fire(computerPlayer, [3,2]);
    humanPlayer.fire(computerPlayer, [4,2]);
    humanPlayer.fire(computerPlayer, [5,2]);
    expect(humanPlayer.checkWin(computerPlayer)).toBe("All of computer's ships are sunk!");
    
})
import Gameboard from "./gameboard.js";

export default function Player(type) {
    const playerType = type;
    const board = Gameboard();

    return {
        playerType,

        getBoard() {
            return board
        },

        fire(enemyPlayer, coordinates) {
            const enemyBoard = enemyPlayer.getBoard();
            const result = enemyBoard.receiveAttack(coordinates);
            return result;
        },

        place(type, coordinates, orientation) {
            board.placeShip(type, coordinates, orientation);
        },

        checkWin(enemyPlayer) {
            const enemyBoard = enemyPlayer.getBoard().getBoardStatus();
            if (enemyBoard.placed === enemyBoard.sunk) return `All of ${enemyPlayer.playerType}'s ships are sunk!`
        }
    }
}
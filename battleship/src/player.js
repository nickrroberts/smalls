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
            const result = board.placeShip(type, coordinates, orientation);
            return result;
        },

        checkWin(enemyPlayer) {
            const status = enemyPlayer.getBoard().getBoardStatus();
            return status.placed > 0 && status.placed === status.sunk;
        }
    }
}
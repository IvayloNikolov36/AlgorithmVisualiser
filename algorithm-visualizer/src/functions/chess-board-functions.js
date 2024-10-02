import { BlackCell, WhiteCell } from "../constants/board-constants";

export function generateBoard(boardRows, boardCols) {
    const board = [];

    let startWithWhiteCell = true;

    for (let row = 0; row < boardRows; row++) {
        const rowArray = [];

        for (let col = 0; col < boardCols; col++) {
            const cellColor = col % 2 === 0
                ? startWithWhiteCell ? WhiteCell : BlackCell
                : startWithWhiteCell ? BlackCell : WhiteCell;
            const cellValue = [cellColor, false, false];
            rowArray.push(cellValue);
        }

        startWithWhiteCell = !startWithWhiteCell;
        board.push(rowArray);
    }

    return board;
}
import { useEffect, useRef, useState } from "react";
import { BlackCell, WhiteCell } from "../constants/board-constants";
import { cloneDeep } from "lodash";

export default function ChessBoard() {

    const [board, setBoard] = useState([]);
    const placedQueens = useRef(0);
    const attackedHorizontals = useRef([]);
    const attackedVerticals = useRef([]);
    const attackedLeftDiagonals = useRef([]);
    const attackedRightDiagonals = useRef([]);

    useEffect(() => {
        const board = generateBoard();
        setBoard(board);
    }, []);

    const generateBoard = () => {
        const board = [];

        let startWithWhiteCell = true;

        for (let row = 0; row < 8; row++) {
            const rowArray = [];

            for (let col = 0; col < 8; col++) {
                const cellColor = col % 2 === 0
                    ? startWithWhiteCell ? WhiteCell : BlackCell
                    : startWithWhiteCell ? BlackCell : WhiteCell;
                const cellValue = [cellColor, false];
                rowArray.push(cellValue);
            }

            startWithWhiteCell = !startWithWhiteCell;
            board.push(rowArray);
        }

        return board;
    }

    const placeQueens = () => {
        tryPlaceQueen(0, 0);
    }

    const tryPlaceQueen = (row, col) => {

        if (row > board.length) {
            return;
        }

        const canPlace = canPlaceQueen(row, col);

        if (canPlace) {
            const cellValue = board[row][col];
            board[row][col] = [cellValue[0], true];
            addAttackedPaths(row, col);
            setBoard(cloneDeep(board));
            placedQueens.current++;

            tryPlaceQueen(row + 1, col + 1);
        }

        // if there is no way to place a queen on a row remove the last placed queen

        const [nextRow, nextCol] = getNexRowAndCol(row, col);
        tryPlaceQueen(nextRow, nextCol);
    }

    const getNexRowAndCol = (row, col) => {
        if (col + 1 >= board[0].length) {
            return [row + 1, 0];
        }

        return [row, col + 1];
    }

    const addAttackedPaths = (cellRow, cellCol) => {
        attackedHorizontals.current.push(cellRow);
        attackedVerticals.current.push(cellCol);
        attackedLeftDiagonals.current.push(getLeftDiagonal(cellRow, cellCol));
        attackedRightDiagonals.current.push(getRightDiagonal(cellRow, cellCol));
    }

    const getLeftDiagonal = (row, col) => {
        while (row > 0 && col > 0) {
            row--;
            col--;
        }

        return [row, col];
    }

    const getRightDiagonal = (row, col) => {
        while (row > 0 && col < board[0].length) {
            row--;
            col++;
        }

        return [row, col];
    }

    const canPlaceQueen = (row, col) => {
        const isRowAttacked = attackedHorizontals.current.includes(row);
        const isColAttacked = attackedVerticals.current.includes(col);
        const isLeftDiagonalAttacked = attackedLeftDiagonals.current.includes([row, col]);
        const isRightDiagonalAttacked = attackedRightDiagonals.current.includes([row, col]);

        return !isRowAttacked && !isColAttacked && !isLeftDiagonalAttacked && !isRightDiagonalAttacked;
    }

    return (
        <div className="container">
            <div className="btnRow">
                <button onClick={placeQueens} className='primaryButton'>Place Queens</button>
            </div>
            <div className="col chessBorder">
                {
                    board.map((rowArray, rowIndex) => {
                        return <div className="row" key={rowIndex}>
                            {
                                rowArray.map(([cellColor, hasQueen], colIndex) => {
                                    return <div className={`chessCell ${cellColor}`}
                                        key={colIndex}
                                        style={{ color: `${cellColor === WhiteCell ? 'black' : 'white'}` }}
                                    >
                                        {hasQueen ? <span>&#9813;</span> : ''}
                                    </div>
                                })
                            }
                        </div>
                    })
                }
            </div>
        </div>
    );
}
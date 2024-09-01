import { useEffect, useRef, useState } from "react";
import { BlackCell, WhiteCell } from "../constants/board-constants";
import { cloneDeep } from "lodash";

const BoardRows = 8;
const BoardCols = 8;

export default function ChessBoard() {

    const [board, setBoard] = useState([]);
    const placedQueens = useRef([]);
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

        for (let row = 0; row < BoardRows; row++) {
            const rowArray = [];

            for (let col = 0; col < BoardCols; col++) {
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

        if (row >= BoardRows) {
            return;
        }

        let canPlace = canPlaceQueen(row, col);

        if (canPlace) {
            placeQueen(row, col);
            tryPlaceQueen(row + 1, 0);
        } else {
            let isPlaced = false;

            while (++col < board[row].length) {
                canPlace = canPlaceQueen(row, col);

                if (canPlace) {
                    placeQueen(row, col);
                    isPlaced = true;
                    break;
                }
            }

            if (isPlaced) {
                tryPlaceQueen(row + 1, 0);
            } else {
                let [queenRow, queenCol] = placedQueens.current.pop();
                unMarkQueen(queenRow, queenCol);

                if (queenCol === board[queenRow].length - 1) {
                    const [qRow, qCol] = placedQueens.current.pop();
                    unMarkQueen(qRow, qCol);
                    queenRow = qRow;
                    queenCol = qCol;
                }

                setAttackedPaths(placedQueens.current);
                tryPlaceQueen(queenRow, queenCol + 1);
            }
        }
    }

    const placeQueen = (row, col) => {
        board[row][col] = [board[row][col][0], true];
        setBoard(cloneDeep(board));
        placedQueens.current.push([row, col]);
        setAttackedPaths(placedQueens.current);
    }

    const unMarkQueen = (queenRow, queenCol) => {
        board[queenRow][queenCol] = [board[queenRow][queenCol][0], false];
    }

    const clickBoardCell = (row, col) => {

        if (row !== 0) {
            return;
        }

        if (placedQueens.current.length > 0) {
            resetBoard();
        }

        tryPlaceQueen(row, col);
    }

    const resetBoard = () => {
        placedQueens.current = [];
        clearAttackedPaths();
        board.forEach(row => row.forEach(cell => cell[1] = false));
        setBoard(cloneDeep(board));
    }

    const setAttackedPaths = (placedQueens) => {
        clearAttackedPaths();

        placedQueens.forEach(([row, col]) => {
            attackedHorizontals.current.push(row);
            attackedVerticals.current.push(col);
            attackedLeftDiagonals.current.push(getLeftDiagonal(row, col));
            attackedRightDiagonals.current.push(getRightDiagonal(row, col));
        });
    }

    const clearAttackedPaths  = () => {
        attackedHorizontals.current = [];
        attackedVerticals.current = [];
        attackedLeftDiagonals.current = [];
        attackedRightDiagonals.current = [];
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

        const [leftDiagonalRow, leftDiagonalCol] = getLeftDiagonal(row, col);
        const isLeftDiagonalAttacked = attackedLeftDiagonals
            .current
            .some(x => x[0] === leftDiagonalRow && x[1] === leftDiagonalCol);

        const [rightDiagonalRow, rightDiagonalCol] = getRightDiagonal(row, col);
        const isRightDiagonalAttacked = attackedRightDiagonals
            .current
            .some(x => x[0] === rightDiagonalRow && x[1] === rightDiagonalCol);

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
                                    return<div
                                        onClick={() => clickBoardCell(rowIndex, colIndex)}
                                        className={rowIndex === 0
                                            ? `chessCellFirstRow chessCell ${cellColor}`
                                            : `chessCell ${cellColor}`}
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
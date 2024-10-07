import { useEffect, useRef, useState } from "react";
import { WhiteCell } from "../constants/board-constants";
import { generateBoard } from "../functions/chess-board-functions";
import { setTimeOutAfter } from "../helpers/thread-sleep";
import { cloneDeep } from "lodash";
import { ButtonGroup, Button, ToggleButton } from "react-bootstrap";

const BoardRows = 8;
const BoardCols = 8;
const WaitInSeconds = 0.5;

export function EightQueens() {

    const [board, setBoard] = useState([]);
    const [animateAlgorithm, setAnimateAlgorithm] = useState(false);
    const [isPlacingQueens, setIsPlacingQueeens] = useState(false);
    const placedQueens = useRef([]);
    const attackedHorizontals = useRef([]);
    const attackedVerticals = useRef([]);
    const attackedLeftDiagonals = useRef([]);
    const attackedRightDiagonals = useRef([]);

    useEffect(() => {
        const board = generateBoard(BoardRows, BoardCols);
        setBoard(board);
    }, []);

    const placeQueens = async () => {
        setIsPlacingQueeens(true);
        await tryPlaceQueen(0, 0);
        setIsPlacingQueeens(false);
    }

    const tryPlaceQueen = async (row, col) => {
        if (row >= BoardRows) {
            return;
        }

        let canPlace = canPlaceQueen(row, col);
        if (canPlace) {
            await placeQueen(row, col);
            await tryPlaceQueen(row + 1, 0);
            return;
        }

        let isPlaced = false;

        while (++col < board[row].length) {
            canPlace = canPlaceQueen(row, col);

            if (canPlace) {
                await placeQueen(row, col);
                isPlaced = true;
                break;
            }
        }

        if (isPlaced) {
            await tryPlaceQueen(row + 1, 0);
        } else {

            if (placedQueens.current.length === 0) {
                resetBoard();
                showNoMoreVariantsAlert();
                return;
            }

            let [queenRow, queenCol] = placedQueens.current.pop();
            await unMarkQueen(queenRow, queenCol);

            if (queenCol === BoardCols - 1) {

                if (placedQueens.current.length === 0) {
                    resetBoard();
                    showNoMoreVariantsAlert();
                    return;
                }

                const [qRow, qCol] = placedQueens.current.pop();
                await unMarkQueen(qRow, qCol);
                queenRow = qRow;
                queenCol = qCol;
            }

            setAttackedPaths(placedQueens.current);
            await tryPlaceQueen(queenRow, queenCol + 1);
        }
    }

    const placeQueen = async (row, col) => {
        setChessSquareData(row, col, { color: getSquareColor(row, col), hasPlacedQueen: true, hasToRemoveQueen: false });
        setBoard(cloneDeep(board));
        placedQueens.current.push([row, col]);
        setAttackedPaths(placedQueens.current);
        if (animateAlgorithm) {
            await setTimeOutAfter(WaitInSeconds);
        }
    }

    const unMarkQueen = async (queenRow, queenCol) => {
        const cellColor = getSquareColor(queenRow, queenCol);

        if (animateAlgorithm) {
            setChessSquareData(
                queenRow,
                queenCol,
                { color: cellColor, hasPlacedQueen: true, hasToRemoveQueen: true });
            setBoard(cloneDeep(board));
            await setTimeOutAfter(WaitInSeconds);
        }

        setChessSquareData(
            queenRow,
            queenCol,
            { color: cellColor, hasPlacedQueen: false, hasToRemoveQueen: false });
    }

    const clickBoardCell = async (row, col) => {

        if (row !== 0 || isPlacingQueens) {
            return;
        }

        if (placedQueens.current.length > 0) {
            resetBoard();
        }

        setIsPlacingQueeens(true);
        await tryPlaceQueen(row, col);
        setIsPlacingQueeens(false);
    }

    const resetBoard = () => {
        placedQueens.current = [];
        clearAttackedPaths();
        board.forEach(row => row.forEach(cell => setHasQueen(cell, false)));
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

    const clearAttackedPaths = () => {
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
        while (row > 0 && col < BoardCols) {
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

    const getSquareColor = (row, col) => {
        return board[row][col][0];
    }

    const setHasQueen = (square, hasQueen) => {
        square[1] = hasQueen;
    }

    const setChessSquareData = (row, col, { color, hasPlacedQueen, hasToRemoveQueen }) => {
        board[row][col] = [color, hasPlacedQueen, hasToRemoveQueen];
    }

    const showNoMoreVariantsAlert = () => {
        alert("No more variants!");
    }

    const getChessSquareClass = (rowIndex, squareColor) => {
        return rowIndex === 0 && !isPlacingQueens
        ? `chessCellSelectable ${squareColor}`
        : `chessCell ${squareColor}`;
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-center py-2">
                <ButtonGroup>
                    <Button onClick={placeQueens} disabled={isPlacingQueens} variant="outline-primary">
                        Place Queens
                    </Button>
                    <ToggleButton
                        id="toggle-check"
                        type="checkbox"
                        variant="outline-primary"
                        checked={animateAlgorithm}
                        value="1"
                        onChange={(e) => setAnimateAlgorithm(e.currentTarget.checked)}
                    >Animate
                    </ToggleButton>
                </ButtonGroup>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <div className="chessBorder">
                    {
                        board.map((rowArray, rowIndex) => {
                            return <div className="d-flex" key={rowIndex}>
                                {
                                    rowArray.map(([cellColor, hasQueen, showRed], colIndex) => {
                                        return <div
                                            onClick={() => clickBoardCell(rowIndex, colIndex)}
                                            className={getChessSquareClass(rowIndex, cellColor)}
                                            key={colIndex}
                                            style={{ color: `${cellColor === WhiteCell ? 'black' : 'white'}` }}
                                        >
                                            {hasQueen ? <span className={showRed ? 'redQueen' : ''}>&#9813;</span> : <></>}
                                        </div>
                                    })
                                }
                            </div>
                        })
                    }
                </div>
            </div>
        </div>
    );
}
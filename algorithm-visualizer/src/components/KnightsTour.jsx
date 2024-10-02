import { useEffect, useRef, useState } from "react";
import { WhiteCell } from "../constants/board-constants";
import { generateBoard } from "../functions/chess-board-functions";
import { cloneDeep, isNumber, orderBy } from "lodash";
import { Button, ButtonGroup } from "react-bootstrap";

const BoardRows = 8;
const BoardCols = 8;

export function KnightsTour() {

    const [board, setBoard] = useState([]);
    const [canSelectCell, setCanSelectCell] = useState(true);
    const knightRow = useRef(null);
    const knightCol = useRef(null);

    useEffect(() => {
        setBoard(generateBoard(BoardRows, BoardCols));
    }, [])

    const clickBoardCell = (row, col) => {
        if (!canSelectCell) {
            return;
        }

        const cell = board[row][col];
        setHasKnight(cell, true);
        setTurn(cell, 1);

        knightRow.current = row;
        knightCol.current = col;
        setCanSelectCell(false);

        setBoard(cloneDeep(board));
    }

    const clearBoard = () => {
        board.forEach((boardRow) => {
            boardRow.forEach((cell) => {
                setHasKnight(cell, false);
                setTurn(cell, null);
            });
        });
        setCanSelectCell(true);
        setBoard(cloneDeep(board));
    }

    const nextMove = () => {
        const moves = getPossibleCellsForMove(knightRow.current, knightCol.current);

        const currentTurn = getTurn(board[knightRow.current][knightCol.current]);

        if (moves.length === 0 && currentTurn === (BoardRows * BoardCols)) {
            return;
        }

        // TODO: create cell class with X, Y and accessibleLevel
        const evaluatedMoves = moves.map((move) => {
            const row = move[0];
            const col = move[1];
            return [row, col, calculateCellAccessibleLevel(row, col)];
        });

        const destination = orderBy(evaluatedMoves, cell => cell[2], "asc")[0];
        moveKnightTo(destination);
    }

    const moveKnightTo = ([row, col]) => {
        const currentCell = board[knightRow.current][knightCol.current];
        const currentTurn = getTurn(currentCell);
        setHasKnight(currentCell, false);
        knightRow.current = row;
        knightCol.current = col;

        const newCell = board[row][col];
        setHasKnight(newCell, true);
        setTurn(newCell, currentTurn + 1);

        setBoard(cloneDeep(board));
    }

    const completeTour = () => {

    }

    const getPossibleCellsForMove = (currentRow, currentCol) => {
        const validCells = [];

        const knightMoves = getKnightMoves(currentRow, currentCol);

        knightMoves.forEach(([row, col]) => {
            const insideMatrix = areCoordinatesInsideBoard(row, col);
            if (insideMatrix && !isCellVisited(row, col)) {
                validCells.push([row, col]);
            }
        });

        return validCells;
    }

    const calculateCellAccessibleLevel = (row, col) => {
        const moves = getPossibleCellsForMove(row, col);

        let count = 0;
        moves.forEach(([cellRow, cellCol]) => {

            if (!isCellVisited(cellRow, cellCol)) {
                count++;
            }
        });

        return count;
    }


    const getKnightMoves = (currentRow, currentCol) => {
        return [
            [currentRow - 2, currentCol - 1],
            [currentRow - 1, currentCol - 2],
            [currentRow + 1, currentCol - 2],
            [currentRow + 2, currentCol - 1],
            [currentRow - 2, currentCol + 1],
            [currentRow - 1, currentCol + 2],
            [currentRow + 1, currentCol + 2],
            [currentRow + 2, currentCol + 1],
        ];
    }

    const areCoordinatesInsideBoard = (row, col) => {
        return row >= 0 && row < board.length && col >= 0 && col < board[row].length;
    }

    const setHasKnight = (cell, hasKnight) => {
        cell[1] = hasKnight;
    }

    const setTurn = (cell, value) => {
        cell[2] = value;
    }

    const getTurn = (cell) => {
        return cell[2];
    }

    const isCellVisited = (row, col) => {
        return isNumber(board[row][col][2]);
    }

    return (
        <>
            <div className="d-flex justify-content-center mt-2">
                <ButtonGroup>
                    <Button onClick={completeTour} variant="primary">
                        Complete Knight's Tour
                    </Button>
                    <Button onClick={nextMove} variant="outline-primary">
                        Next Move
                    </Button>
                    <Button onClick={clearBoard} variant="outline-primary">
                        Clear Board
                    </Button>
                </ButtonGroup>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <div className="chessBorder">
                    {
                        board.map((rowArray, rowIndex) => {
                            return <div className="d-flex" key={rowIndex}>
                                {
                                    rowArray.map(([cellColor, hasKnight, turn], colIndex) => {
                                        return <div
                                            onClick={() => clickBoardCell(rowIndex, colIndex)}
                                            className={canSelectCell ? `chessCellSelectable ${cellColor}` : `chessCell ${cellColor}`}
                                            key={colIndex}
                                            style={{ color: `${cellColor === WhiteCell ? 'black' : 'white'}` }}
                                        >
                                            {hasKnight ? <span>&#9816;</span> : <span>{turn}</span>}
                                        </div>
                                    })
                                }
                            </div>
                        })
                    }
                </div>
            </div>
        </>
    );
}
import { useEffect, useRef, useState } from "react";
import { WhiteCell } from "../constants/board-constants";
import { generateBoard } from "../functions/chess-board-functions";
import { setTimeOutAfter } from "../helpers/thread-sleep";
import { ChessSquare } from "../models/chess-square";
import { cloneDeep, isNumber, orderBy } from "lodash";
import { Button, ButtonGroup } from "react-bootstrap";

const BoardRows = 8;
const BoardCols = 8;
const WaitInSeconds = 0.1;

export function KnightsTour() {

    const [board, setBoard] = useState([]);
    const [canSelectCell, setCanSelectCell] = useState(true);
    const [isInProgress, setIsInProgress] = useState(false);
    const [title, setTitle] = useState('Select square to place the Knight');
    const [showButtons, setShowButtons] = useState(false);
    const knightRow = useRef(null);
    const knightCol = useRef(null);

    useEffect(() => {
        setBoard(generateBoard(BoardRows, BoardCols));
    }, [])

    const clickBoardCell = (row, col) => {
        if (!canSelectCell) {
            return;
        }

        setTitle('');
        setShowButtons(true);

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
        if (knightRow.current === null) {
            return;
        }

        const moves = getPossibleCellsForMove({ row: knightRow.current, col: knightCol.current });

        if (moves.length === 0 && getCurrentTurn() === (BoardRows * BoardCols)) {
            return;
        }

        moves.forEach((chessSquare) => {
            chessSquare.accessibleLevel = calculateCellAccessibleLevel(chessSquare)
        });

        const orderedMoves = orderBy(moves, chessSquare => chessSquare.accessibleLevel, "asc");

        moveKnightTo(orderedMoves[0]);
    }

    const moveKnightTo = (square) => {
        const currentCell = board[knightRow.current][knightCol.current];
        const currentTurn = getTurn(currentCell);
        setHasKnight(currentCell, false);
        knightRow.current = square.row;
        knightCol.current = square.col;

        const newCell = board[square.row][square.col];
        setHasKnight(newCell, true);
        setTurn(newCell, currentTurn + 1);

        setBoard(cloneDeep(board));
    }

    const completeTour = async () => {
        setIsInProgress(true);

        while (getCurrentTurn() < BoardRows * BoardCols) {
            nextMove();
            await setTimeOutAfter(WaitInSeconds);
        }

        setIsInProgress(false);
    }

    const getPossibleCellsForMove = (square) => {
        const validCells = [];

        const knightMoves = getKnightMoves(square.row, square.col);

        knightMoves.forEach((chessSquare) => {
            const insideMatrix = areCoordinatesInsideBoard(chessSquare.row, chessSquare.col);
            if (insideMatrix && !isCellVisited(chessSquare.row, chessSquare.col)) {
                validCells.push(chessSquare);
            }
        });

        return validCells;
    }

    const calculateCellAccessibleLevel = (square) => {
        const moves = getPossibleCellsForMove(square);

        let count = 0;
        moves.forEach((chessSquare) => {

            if (!isCellVisited(chessSquare.row, chessSquare.col)) {
                count++;
            }
        });

        return count;
    }


    const getKnightMoves = (currentRow, currentCol) => {
        return [
            new ChessSquare(currentRow - 2, currentCol - 1),
            new ChessSquare(currentRow - 1, currentCol - 2),
            new ChessSquare(currentRow + 1, currentCol - 2),
            new ChessSquare(currentRow + 2, currentCol - 1),
            new ChessSquare(currentRow - 2, currentCol + 1),
            new ChessSquare(currentRow - 1, currentCol + 2),
            new ChessSquare(currentRow + 1, currentCol + 2),
            new ChessSquare(currentRow + 2, currentCol + 1)
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

    const getCurrentTurn = () => {
        return board[knightRow.current][knightCol.current][2];
    }

    const isCellVisited = (row, col) => {
        return isNumber(board[row][col][2]);
    }

    const getSquareStyle = (cellColor) => {
        const style = 'd-flex justify-content-center align-items-center';
        const styleDynamicPart = canSelectCell ? `chessCellSelectable ${cellColor}` : `chessCell ${cellColor}`;
        return `${style} ${styleDynamicPart}`;
    }

    return (
        <>
            {showButtons &&
                <div className="d-flex justify-content-center mt-2">
                    <ButtonGroup>
                        <Button onClick={completeTour} disabled={isInProgress || canSelectCell} variant="primary">
                            Complete Knight's Tour
                        </Button>
                        <Button onClick={nextMove} disabled={isInProgress || canSelectCell} variant="outline-primary">
                            Next Move
                        </Button>
                        <Button onClick={clearBoard} disabled={isInProgress || canSelectCell} variant="outline-primary">
                            Clear Board
                        </Button>
                    </ButtonGroup>
                </div>
            }
            {
                title?.length > 0 &&
                <div className="d-flex text-info justify-content-center mt-2 knightsTourTitle">
                    <h3>{title}</h3>
                </div>
            }
            <div className="d-flex justify-content-center mt-3">
                <div className="chessBorder">
                    {
                        board.map((rowArray, rowIndex) => {
                            return <div className="d-flex" key={rowIndex}>
                                {
                                    rowArray?.map(([cellColor, hasKnight, turn], colIndex) => {
                                        return <div
                                            onClick={() => clickBoardCell(rowIndex, colIndex)}
                                            className={getSquareStyle(cellColor)}
                                            key={colIndex}
                                            style={{ color: `${cellColor === WhiteCell ? 'black' : 'white'}` }}
                                        >
                                            {hasKnight ? <span>&#9816;</span> : <span className="fs-2">{turn}</span>}
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
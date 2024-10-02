import { useEffect, useState } from "react";
import { WhiteCell } from "../constants/board-constants";
import { generateBoard } from "../functions/chess-board-functions";
import { cloneDeep } from "lodash";

const BoardRows = 8;
const BoardCols = 8;

export function KnightsTour() {

    const [board, setBoard] = useState([]);

    useEffect(() => {
        setBoard(generateBoard(BoardRows, BoardCols));
    }, [])

    const clickBoardCell = (row, col) => {
        board[row][col][1] = true;
        setBoard(cloneDeep(board));
    }

    return (
        <div className="d-flex justify-content-center mt-3">
            <div className="chessBorder">
                {
                    board.map((rowArray, rowIndex) => {
                        return <div className="d-flex" key={rowIndex}>
                            {
                                rowArray.map(([cellColor, hasKnight], colIndex) => {
                                    return <div
                                        onClick={() => clickBoardCell(rowIndex, colIndex)}
                                        className={`chessCellSelectable ${cellColor}`}
                                        key={colIndex}
                                        style={{ color: `${cellColor === WhiteCell ? 'black' : 'white'}` }}
                                    >
                                        {hasKnight ? <span>&#9816;</span> : ''}
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
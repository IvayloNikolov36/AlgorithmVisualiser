import { useEffect, useState } from "react";
import { BlackCell, WhiteCell } from "../constants/board-constants";

export default function ChessBoard() {

    const [board, setBoard] = useState([]);

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
                const cellvalue = col % 2 === 0
                    ? startWithWhiteCell ? WhiteCell : BlackCell
                    : startWithWhiteCell ? BlackCell : WhiteCell;

                rowArray.push(cellvalue);
            }

            startWithWhiteCell = !startWithWhiteCell
            board.push(rowArray);
        }

        return board;
    }

    return (
        <div className="container">
            <div className="col chessBorder">
                {
                    board.map((rowArray, rowIndex) => {
                        return <div className="row" key={rowIndex}>
                            {
                                rowArray.map((cell, colIndex) => {
                                    return <div className={`chessCell ${cell}`}
                                        key={colIndex}
                                        style={{ color: `${cell === WhiteCell ? 'black' : 'white'}` }}
                                    >
                                        &#9813;
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
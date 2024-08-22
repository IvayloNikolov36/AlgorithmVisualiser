import { useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import '../App.css';

export default function MazeMatrix() {

    const emptyCell = 'empty';
    const wallCell = 'wall';
    const endCell = 'end';
    const pathCell = 'path';
    const startCell = 'start';

    const initialMatrix = [
        [startCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell],
        [wallCell, emptyCell, wallCell, wallCell, wallCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, wallCell],
        [wallCell, emptyCell, wallCell, wallCell, emptyCell, emptyCell, wallCell, wallCell, wallCell, emptyCell, emptyCell],
        [wallCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, emptyCell, wallCell, emptyCell],
        [wallCell, emptyCell, wallCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, emptyCell, emptyCell, emptyCell],
        [wallCell, emptyCell, wallCell, emptyCell, wallCell, emptyCell, emptyCell, emptyCell, emptyCell, wallCell, emptyCell],
        [wallCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, emptyCell],
        [wallCell, wallCell, wallCell, emptyCell, wallCell, wallCell, wallCell, wallCell, wallCell, wallCell, emptyCell],
        [wallCell, wallCell, wallCell, emptyCell, emptyCell, emptyCell, emptyCell, emptyCell, wallCell, wallCell, endCell]
    ];

    const [matrix, setMatrix] = useState(initialMatrix);
    const stack = useRef([]);
    const visitedCells = useRef([]);
    const isEndReached = useRef(false);

    const startBFS = () => {
        breadthFirstSearch(0, 0, matrix);
    }

    const startDFS = async () => {
        await depthFirstSearch(0, 0, matrix);
    }

    const depthFirstSearch = async (startRow, startCol, matrix) => {

        stack.current = [...stack.current, [startRow, startCol]];

        const cell = stack.current.pop();

        if (!cell) {
            return;
        }

        const row = cell[0];
        const col = cell[1];

        if (isEndCell(row, col, matrix)) {
            isEndReached.current = true;
            return;
        }

        if (!isStartCell(row, col, matrix)) {
            await setTimeOutAfter(0.3);
            stepOnCell(row, col, matrix);
            visitedCells.current = [...visitedCells.current, [row, col]];
        }

        const cellIndexes = getAdjacentCellIndexes(row, col);

        for (let [cellRow, cellCol] of cellIndexes) {
            if (canStepOnCell(cellRow, cellCol, matrix, visitedCells.current)) {
                if (isEndReached.current) {
                    return;
                }
                await depthFirstSearch(cellRow, cellCol, matrix);
            }
        }
    }

    const breadthFirstSearch = async (startRow, startCol, matrix) => {

        const visited = [];
        const queue = [[startRow, startCol]];

        while (true) {
            const cell = queue.shift();
            const row = cell[0];
            const col = cell[1];

            if (isEndCell(row, col, matrix)) {
                break;
            }

            if (!isStartCell(row, col, matrix)) {
                await setTimeOutAfter(0.3);
                stepOnCell(row, col, matrix);
                visited.push([row, col]);
            }

            const cellIndexes = getAdjacentCellIndexes(row, col);

            cellIndexes.forEach(([cellRow, cellCol]) => {
                if (canStepOnCell(cellRow, cellCol, matrix, visited)) {
                    queue.push([cellRow, cellCol]);
                }
            });
        }
    }

    const setTimeOutAfter = (seconds) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, seconds * 1000);
        });
      }

    const canStepOnCell = (cellRow, cellCol, matrix, visited) => {
        return isInsideMatrix(cellRow, cellCol, matrix)
            && (isEmptyCell(cellRow, cellCol, matrix) || isEndCell(cellRow, cellCol, matrix))
            && !visited.includes([cellRow, cellCol]);
    }

    const stepOnCell = (row, col, matrix) => {
        matrix[row][col] = pathCell;
        //console.log(`Step on cell: ${row} - ${col}`);
        setMatrix(cloneDeep(matrix));
    }

    const getAdjacentCellIndexes = (row, col) => {
        return [
            [row - 1, col],
            [row, col + 1],
            [row + 1, col],
            [row, col - 1]
        ];
    }

    const isInsideMatrix = (row, col, matrix) => {
        return row >= 0
            && row < matrix.length
            && col >= 0
            && col < matrix[row].length;
    }

    const isEmptyCell = (row, col, matrix) => {
        return matrix[row][col] === emptyCell;
    }

    const isEndCell = (row, col, matrix) => {
        return matrix[row][col] === endCell;
    }

    const isStartCell = (row, col, matrix) => {
        return matrix[row][col] === startCell;
    }

    return (
        <div className="container">
            <button onClick={startBFS} className='primaryButton'>BFS</button>
            <button onClick={startDFS} className='primaryButton'>DFS</button>
            {
                matrix.map((row) => {
                    return <div className="row" key={row.toString()}>
                        {
                            row.map((cell, colIndex) => {
                                return <div className={`maze-cell ${cell}`} key={colIndex.toString()}>
                                </div>
                            })
                        }
                    </div>
                })
            }
        </div>
    );
}
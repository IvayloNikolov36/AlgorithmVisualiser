import { useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import '../App.css';

const WaitSeconds = 0.15;

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
    const visitedCells = useRef([]);
    const isEndReached = useRef(false);
    const cellsToUnstep = useRef([]);

    const startBFS = async () => {
        const visitedCells = await breadthFirstSearch(0, 0, matrix);

        unStepCells(visitedCells.map(vc => [vc.x, vc.y]).slice(0, -1), matrix);

        const path = reconstructPathAfterBFS(visitedCells);

        path.forEach(([row, col]) => {
            matrix[row][col] = pathCell;
        });

        setMatrix(cloneDeep(matrix));
    }

    const startDFS = async () => {
        await depthFirstSearch(0, 0, matrix, true);
        unStepCells(cellsToUnstep.current, matrix);
        setMatrix(cloneDeep(matrix));
    }

    const depthFirstSearch = async (startRow, startCol, matrix, isStartCell = false) => {

        if (isEndCell(startRow, startCol, matrix)) {
            isEndReached.current = true;
            return;
        }

        if (!isStartCell) {
            await setTimeOutAfter(WaitSeconds);
            stepOnCell(startRow, startCol, matrix);
            visitedCells.current.push([startRow, startCol]);
        }

        const cellIndexes = getAdjacentCellIndexes(startRow, startCol);

        let emptyCells = 0;

        for (let [cellRow, cellCol] of cellIndexes) {

            if (canStepOnCell(cellRow, cellCol, matrix, visitedCells.current)) {

                if (isEndReached.current) {
                    return;
                }

                emptyCells++;
                await depthFirstSearch(cellRow, cellCol, matrix);

                if (isEndReached.current) {
                    return;
                }

                const hasAnyEmptyAjacent = hasAnyEmptyAdjacentCell(cellIndexes, matrix, visitedCells.current);
                if (!hasAnyEmptyAjacent) {
                    cellsToUnstep.current.push([startRow, startCol]);
                }
            }
        }

        if (emptyCells === 0 && !isEndReached.current) {
            cellsToUnstep.current.push([startRow, startCol]);
        }
    }

    const unStepCells = (cells, matrix) => {
        cells.forEach((cell) => {
            const row = cell[0];
            const col = cell[1];
            matrix[row][col] = emptyCell;
        });
    }

    const reconstructPathAfterBFS = (visitedCells) => {
        const path = [];

        let cell = (visitedCells.pop()).previous;
        path.push([cell.x, cell.y]);

        while (cell.previous.previous !== null) {
            const nextPathCell = cell.previous;
            path.unshift([nextPathCell.x, nextPathCell.y]);
            cell = nextPathCell;
        }

        return path;
    }

    const hasAnyEmptyAdjacentCell = (cellIndexes, matrix, visited) => {
        return cellIndexes.some(cell => canStepOnCell(cell[0], cell[1], matrix, visited));
    }

    const breadthFirstSearch = async (startRow, startCol, matrix) => {

        const visited = [];
        const queue = [new Node(startRow, startCol, null)];
        const visitedWithPrev = [];

        while (true) {
            const cell = queue.shift();
            const [row, col] = [cell.x, cell.y];

            if (isEndCell(row, col, matrix)) {
                visitedWithPrev.push(cell);
                return visitedWithPrev;
            }

            if (!isStartCell(row, col, matrix)) {
                await setTimeOutAfter(WaitSeconds);
                stepOnCell(row, col, matrix);
                visited.push([row, col]);
                visitedWithPrev.push(cell);
            }

            const cellIndexes = getAdjacentCellIndexes(row, col);

            cellIndexes.forEach(([cellRow, cellCol]) => {
                if (canStepOnCell(cellRow, cellCol, matrix, visited)) {
                    queue.push(new Node(cellRow, cellCol, cell));
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

    class Node {
        constructor(x, y, previous) {
            this.x = x;
            this.y = y;
            this.previous = previous;
        }
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
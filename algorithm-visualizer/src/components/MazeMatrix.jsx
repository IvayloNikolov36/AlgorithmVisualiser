import { useEffect, useRef, useState } from 'react';
import { cloneDeep, shuffle } from 'lodash';
import { Cell } from '../models/cell';
import { setTimeOutAfter } from '../helpers/thread-sleep';
import { StartCell, EndCell, PathCell, WallCell, EmptyCell } from '../constants/maze-constants';
import '../App.css';
import { ButtonGroup, Button } from 'react-bootstrap';

const WaitSeconds = 0.15;
const Size = 15;

export default function MazeMatrix() {

    const [matrix, setMatrix] = useState([]);
    const isEndReached = useRef(false);

    useEffect(() => {
        refreshMaze();
    }, []);

    const refreshMaze = () => {
        setMatrix(cloneDeep(generateMaze(Size, Size)));
    }

    const generateMaze = (rows, cols) => {
        const maze = [];

        for (let row = 0; row < rows; row++) {
            const innerArray = [];
            for (let col = 0; col < cols; col++) {
                innerArray.push(WallCell);
            }
            maze[row] = innerArray;
        }

        const directions = getAdjacentCellIndexes(0, 0);
        constructCorridors(0, 0, maze, directions);

        maze[0][0] = StartCell;
        maze[rows - 1][cols - 1] = EndCell;

        return maze;
    }

    const constructCorridors = (row, col, maze, directions) => {
        maze[row][col] = EmptyCell;
        const shuffledDirections = shuffle(directions);

        shuffledDirections.forEach(([x, y]) => {
            const stepX = row + x * 2;
            const stepY = col + y * 2;

            if (isInsideMatrix(stepX, stepY, maze) && isWallCell(stepX, stepY, maze)) {
                maze[row + x][col + y] = EmptyCell;
                constructCorridors(stepX, stepY, maze, directions);
            }
        });
    }

    const startBFS = async () => {

        const visitedCells = await breadthFirstSearch(0, 0);

        unStepCells(visitedCells.map(cell => [cell.row, cell.col]).slice(0, -1));

        const path = reconstructPathAfterBFS(visitedCells);

        path.forEach(([row, col]) => {
            matrix[row][col] = PathCell;
        });

        setMatrix(cloneDeep(matrix));
    }

    const startDFS = async () => {
        const visitedCells = [];
        const cellsToUnmark = [];
        await depthFirstSearch(0, 0, visitedCells, cellsToUnmark, true);
        unStepCells(cellsToUnmark);
        setMatrix(cloneDeep(matrix));
    }

    const depthFirstSearch = async (
        startRow,
        startCol,
        visitedCells,
        cellsToUnmark,
        isStartCell = false) => {

        if (isEndCell(startRow, startCol)) {
            isEndReached.current = true;
            return;
        }

        if (!isStartCell) {
            await setTimeOutAfter(WaitSeconds);
            stepOnCell(startRow, startCol);
            visitedCells.push([startRow, startCol]);
        }

        const cellIndexes = getAdjacentCellIndexes(startRow, startCol);

        let emptyCells = 0;

        for (let [cellRow, cellCol] of cellIndexes) {

            if (canStepOnCell(cellRow, cellCol, visitedCells)) {

                if (isEndReached.current) {
                    return;
                }

                emptyCells++;
                await depthFirstSearch(cellRow, cellCol, visitedCells, cellsToUnmark, false);

                if (isEndReached.current) {
                    return;
                }

                const hasAnyEmptyAjacent = hasAnyEmptyAdjacentCell(cellIndexes, visitedCells);
                if (!hasAnyEmptyAjacent) {
                    cellsToUnmark.push([startRow, startCol]);
                }
            }
        }

        if (emptyCells === 0 && !isEndReached.current) {
            cellsToUnmark.push([startRow, startCol]);
        }
    }

    const unStepCells = (cells) => {
        cells.forEach((cell) => {
            const row = cell[0];
            const col = cell[1];
            matrix[row][col] = EmptyCell;
        });
    }

    const reconstructPathAfterBFS = (visitedCells) => {
        const path = [];

        let cell = (visitedCells.pop()).previous;
        path.push([cell.row, cell.col]);

        while (cell.previous.previous !== null) {
            const nextPathCell = cell.previous;
            path.unshift([nextPathCell.row, nextPathCell.col]);
            cell = nextPathCell;
        }

        return path;
    }

    const hasAnyEmptyAdjacentCell = (cellIndexes, visited) => {
        return cellIndexes.some(([cellRow, cellCol]) => canStepOnCell(cellRow, cellCol, visited));
    }

    const breadthFirstSearch = async (startRow, startCol) => {
        const queue = [new Cell(startRow, startCol, null)];
        const visited = [];

        while (true) {
            const cell = queue.shift();
            const [row, col] = [cell.row, cell.col];

            if (isEndCell(row, col)) {
                visited.push(cell);
                return visited;
            }

            if (!isStartCell(row, col)) {
                await setTimeOutAfter(WaitSeconds);
                stepOnCell(row, col);
                visited.push(cell);
            }

            const cellIndexes = getAdjacentCellIndexes(row, col);

            cellIndexes.forEach(([cellRow, cellCol]) => {
                if (canStepOnCell(cellRow, cellCol, visited.map(cell => [cell.row, cell.col]))) {
                    queue.push(new Cell(cellRow, cellCol, cell));
                }
            });
        }
    }

    const canStepOnCell = (cellRow, cellCol, visited) => {
        return isInsideMatrix(cellRow, cellCol, matrix)
            && (isEmptyCell(cellRow, cellCol, matrix) || isEndCell(cellRow, cellCol))
            && !visited.includes([cellRow, cellCol]);
    }

    const stepOnCell = (row, col) => {
        matrix[row][col] = PathCell;
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
        return matrix[row][col] === EmptyCell;
    }

    const isWallCell = (row, col, matrix) => {
        return matrix[row][col] === WallCell;
    }

    const isEndCell = (row, col) => {
        return matrix[row][col] === EndCell;
    }

    const isStartCell = (row, col) => {
        return matrix[row][col] === StartCell;
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-center my-3">
                <ButtonGroup>
                    <Button onClick={startBFS} variant="outline-primary">BFS</Button>
                    <Button onClick={refreshMaze} variant="outline-primary">Refresh Maze</Button>
                    <Button onClick={startDFS} variant="outline-primary">DFS</Button>
                </ButtonGroup>
            </div>
            {
                matrix.map((row, rowIndex) => {
                    return <div className="d-flex flex-row justify-content-center" key={rowIndex}>
                        {
                            row.map((cell, colIndex) => {
                                return <div className={`maze-cell ${cell}`} key={colIndex}>
                                </div>
                            })
                        }
                    </div>
                })
            }
        </div>
    );
}
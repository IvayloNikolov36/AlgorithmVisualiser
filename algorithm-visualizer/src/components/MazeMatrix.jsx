import { useEffect, useRef, useState } from 'react';
import { cloneDeep, shuffle } from 'lodash';
import { Cell } from '../models/cell';
import { setTimeOutAfter } from '../helpers/thread-sleep';
import { DefaultWaitInSeconds, EmptyCell, HeightSize, StartCell, EndCell, PathCell, RangeStep, WallCell, WidthSize } from '../constants/maze-constants';
import { ButtonGroup, Button, Col, Form, Row } from 'react-bootstrap';


export function MazeMatrix() {

    const [matrix, setMatrix] = useState([]);
    const [rangeValue, setRangeValue] = useState(50);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEndReached, setIsEndReached] = useState(false);
    const endReached = useRef(false);
    const animationSpeed = useRef(DefaultWaitInSeconds);

    useEffect(() => {
        generateOtherMaze();
    }, []);

    const generateOtherMaze = () => {
        setIsEndReached(false);
        endReached.current = false;
        setMatrix(cloneDeep(generateMaze(HeightSize, WidthSize)));
    }

    const clearMaze = () => {
        setIsEndReached(false);
        endReached.current = false;
        debugger;
        const clearedMatrix = matrix.map(matrixRow => matrixRow.map(cell => {
            if (cell === PathCell) {
                return EmptyCell;
            }
            return cell;
        }));
        setMatrix(cloneDeep(clearedMatrix));
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
        setIsProcessing(true);

        const visitedCells = await breadthFirstSearch(0, 0);

        unStepCells(visitedCells.map(cell => [cell.row, cell.col]).slice(0, -1));

        const path = reconstructPathAfterBFS(visitedCells);

        path.forEach(([row, col]) => {
            matrix[row][col] = PathCell;
        });

        setMatrix(cloneDeep(matrix));

        setIsEndReached(true);
        setIsProcessing(false);
    }

    const startDFS = async () => {
        setIsProcessing(true);

        const visitedCells = [];
        const cellsToUnmark = [];
        await depthFirstSearch(0, 0, visitedCells, cellsToUnmark, true);
        unStepCells(cellsToUnmark);
        setMatrix(cloneDeep(matrix));

        setIsProcessing(false);
    }

    const depthFirstSearch = async (
        startRow,
        startCol,
        visitedCells,
        cellsToUnmark,
        isStartCell = false) => {

        if (isEndCell(startRow, startCol)) {
            endReached.current = true;
            setIsEndReached(true);
            return;
        }

        if (!isStartCell) {
            await setTimeOutAfter(animationSpeed.current);
            stepOnCell(startRow, startCol);
            visitedCells.push([startRow, startCol]);
        }

        const cellIndexes = getAdjacentCellIndexes(startRow, startCol);

        let emptyCells = 0;

        for (let [cellRow, cellCol] of cellIndexes) {

            if (canStepOnCell(cellRow, cellCol, visitedCells)) {

                if (endReached.current) {
                    return;
                }

                emptyCells++;
                await depthFirstSearch(cellRow, cellCol, visitedCells, cellsToUnmark, false);

                if (endReached.current) {
                    return;
                }

                const hasAnyEmptyAjacent = hasAnyEmptyAdjacentCell(cellIndexes, visitedCells);
                if (!hasAnyEmptyAjacent) {
                    cellsToUnmark.push([startRow, startCol]);
                }
            }
        }

        if (emptyCells === 0 && !endReached.current) {
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
                await setTimeOutAfter(animationSpeed.current);
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

    const setAnimationSpeed = (speed) => {
        const speedValue = parseInt(speed);

        setRangeValue(speedValue);

        let seconds = 0;

        if (speedValue === 0) {
            seconds = 0.65;
        } else if (speedValue > 0 && speedValue <= RangeStep) {
            seconds = 0.45;
        } else if (speedValue > RangeStep && speedValue < RangeStep * 2) {
            seconds = 0.25;
        } else if (speedValue === RangeStep * 2) {
            seconds = DefaultWaitInSeconds;
        } else if (speedValue > RangeStep * 2 && speedValue <= RangeStep * 3) {
            seconds = 0.1;
        } else {
            seconds = 0;
        }

        animationSpeed.current = seconds;
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-center gap-5 my-3">
                <ButtonGroup>
                    <Button
                        onClick={startBFS}
                        disabled={isProcessing || isEndReached}
                        variant="primary"
                    > BFS
                    </Button>
                    <Button
                        onClick={generateOtherMaze}
                        disabled={isProcessing}
                        variant="outline-primary"
                    > Generate Other Maze
                    </Button>
                    <Button
                        onClick={clearMaze}
                        disabled={isProcessing}
                        variant="outline-primary"
                    > Clear Maze
                    </Button>
                    <Button
                        onClick={startDFS}
                        disabled={isProcessing || isEndReached}
                        variant="primary"
                    > DFS
                    </Button>
                </ButtonGroup>
                <div className="d-flex">
                    <Form.Group as={Row}>
                        <Form.Label column sm="4">
                            Speed
                        </Form.Label>
                        <Col sm="8" className="align-self-end">
                            <Form.Range
                                value={rangeValue}
                                onChange={(e) => setAnimationSpeed(e.target.value)}
                                step={RangeStep}
                            />
                        </Col>
                    </Form.Group>
                </div>
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
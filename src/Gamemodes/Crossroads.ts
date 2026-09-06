/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/
import ArenaEntity, { ArenaState } from "../Native/Arena";
import GameServer from "../Game";
import MazeWall from "../Entity/Misc/MazeWall";
import { VectorAbstract } from "../Physics/Vector";

import ShapeManager from "../Entity/Shape/Manager";
import Peacekeeper from "../Entity/Boss/Rift/Peacekeeper";
import AbstractShape from "../Entity/Shape/AbstractShape";
import Hexagon from "../Entity/Shape/Hexagon";
import Pentagon from "../Entity/Shape/Pentagon";
import Crasher from "../Entity/Shape/Crasher";
import Square from "../Entity/Shape/Square";
import Triangle from "../Entity/Shape/Triangle";
import { Color } from "../Const/Enums";

// constss.
const CELL_SIZE = 635;
const GRID_SIZE = 60;
const ARENA_SIZE = CELL_SIZE * GRID_SIZE;
const SEED_AMOUNT = Math.floor(Math.random() * 30) + 30;
const TURN_CHANCE = 0.2;
const BRANCH_CHANCE = 0.2;
const TERMINATION_CHANCE = 0.2;

class CrossroadsShapeManager extends ShapeManager {
    protected spawnShape(): AbstractShape {
        let shape: AbstractShape;
        const {x, y} = this.arena.findSpawnLocation();
        // Fields of Shapes
        const rand = Math.random();
        if (rand < .05) {
            shape = new Pentagon(this.game, true, Math.random() < 0.05);

            shape.positionData.values.x = x;
            shape.positionData.values.y = y;
            shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
        }else if (rand < 0.3) {
            shape = new Hexagon(this.game, Math.random() < 0.05);

            shape.positionData.values.x = x;
            shape.positionData.values.y = y;
            shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
        }else if (rand < .7) {
            shape = new Pentagon(this.game, false, Math.random() < 0.05);

            shape.positionData.values.x = x;
            shape.positionData.values.y = y;
            shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
        } else { // < 16%
            shape = new Square(this.game, Math.random() < 0.05);

            shape.positionData.values.x = x;
            shape.positionData.values.y = y;
            shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
        }

        shape.scoreReward *= this.arena.shapeScoreRewardMultiplier;

        return shape;
        // this.shapeCount += 1;
    }
    protected get wantedShapes() {
        return 2000;
    }
}
/**
 * Maze Gamemode Arena
 * 
 * Implementation details:
 * Maze map generator by damocles <github.com/SpanksMcYeet>
 *  - Added into codebase on December 3rd 2022
 */
export default class CrossroadsArena extends ArenaEntity {
    static override GAMEMODE_ID: string = "crossroads";

    protected shapes: ShapeManager = new CrossroadsShapeManager(this);

    /** Stores all the "seed"s */
    private SEEDS: VectorAbstract[] = [];
    /** Stores all the "wall"s, contains cell based coords */
    private WALLS: (VectorAbstract & {width: number, height: number})[] = [];
    /** Rolled out matrix of the grid */
    private MAZE: Uint8Array = new Uint8Array(GRID_SIZE * GRID_SIZE);


    public constructor(game: GameServer) {
        super(game);
        this.ARENA_COLORS = {
            base: 0x303030,
            border: 0x000000,
            borderAlpha: 0.2,
            grid: 0x000000,
            gridAlpha: 0.5,
            miniMapColor: 0x303030,
            miniMapBorderColor: 0x222222
        }
        this.updateBounds(ARENA_SIZE, ARENA_SIZE);
        this.allowBoss = false;
        this._buildMaze();
    }
    /** Creates a maze wall from cell coords */
    private _buildWallFromGridCoord(gridX: number, gridY: number, gridW: number, gridH: number) {
        const scaledW = gridW * ARENA_SIZE;
        const scaledH = gridH * ARENA_SIZE;
        const scaledX = gridX * ARENA_SIZE;
        const scaledY = gridY * ARENA_SIZE;
        const wall = new MazeWall(this.game, scaledX, scaledY, scaledH, scaledW);
        wall.styleData.color = Color.Border;
    }
    /** Allows for easier (x, y) based getting of maze cells */
    private _get(x: number, y: number): number {
        return this.MAZE[y * GRID_SIZE + x];
    }
    /** Allows for easier (x, y) based setting of maze cells */
    private _set(x: number, y: number, value: number): number {
        return this.MAZE[y * GRID_SIZE + x] = value;
    }
    /** Converts MAZE grid into an array of set and unset bits for ease of use */
    private _mapValues(): [x: number, y: number, value: number][] {
        const values: [x: number, y: number, value: number][] = Array(this.MAZE.length);
        for (let i = 0; i < this.MAZE.length; ++i) values[i] = [i % GRID_SIZE, Math.floor(i / GRID_SIZE), this.MAZE[i]];
        return values;
    }
    /** Builds the maze */
    protected _buildMaze() {
        // Plant some seeds
        for (let i = 0; i < 10000; i++) {
            // Stop if we exceed our maximum seed amount
            if (this.SEEDS.length >= SEED_AMOUNT) break;
            // Attempt a seed planting
            let seed: VectorAbstract = {
                x: Math.floor((Math.random() * GRID_SIZE) - 1),
                y: Math.floor((Math.random() * GRID_SIZE) - 1),
            };
            // Check if our seed is valid (is 3 GU away from another seed, and is not on the border)
            if (this.SEEDS.some(a => (Math.abs(seed.x - a.x) <= 3 && Math.abs(seed.y - a.y) <= 3))) continue;
            if (seed.x <= 0 || seed.y <= 0 || seed.x >= GRID_SIZE - 1 || seed.y >= GRID_SIZE - 1) continue;
            // Push it to the pending seeds and set its grid to a wall cell
            this.SEEDS.push(seed);
            this._set(seed.x, seed.y, 1);
        }
        function crossMaze() {
            const clearArea = function (grid: number[][], centerX: number, centerY: number, radius: number) {
                let gridSize = grid.length;
                let startX = centerX - radius + 1;
                let startY = centerY - radius + 1;
                let endX = centerX + radius;
                let endY = centerY + radius;

                if (startX < 0) startX = 0;
                if (startY < 0) startY = 0;
                if (endX > gridSize) endX = gridSize;
                if (endY > gridSize) endY = gridSize;

                for (let x = startX; x < endX; x++) {
                    let row = grid[x];
                    if (row) {
                        for (let y = startY; y < endY; y++) {
                            if (y >= 0 && y < row.length) {
                                row[y] = 0;
                            }
                        }
                    }
                }
            };

            const mazeGrid = (function (mazeData: any[][][], mazeSize: number) {
                const gridSize = 2 * mazeSize - 1;
                const mazeDataSize = mazeData.length;
                const offset = mazeSize - mazeDataSize;
                const grid: number[][] = [];

                const setPixel = function (x: number, y: number) {
                    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                        let row = grid[x];
                        if (row) {
                            row[y] = 1;
                        }
                    }
                };

                const drawHorizontal = function (x: number, y: number) {
                    setPixel(x, y - 1);
                    setPixel(x, y);
                    setPixel(x, y + 1);
                };

                const drawVertical = function (x: number, y: number) {
                    setPixel(x - 1, y);
                    setPixel(x, y);
                    setPixel(x + 1, y);
                };

                for (let i = 0; i < gridSize; i++) {
                    let row = [];
                    for (let j = 0; j < gridSize; j++) {
                        row.push(0);
                    }
                    grid.push(row);
                }

                for (let rowIndex = 0; rowIndex < mazeDataSize; rowIndex++) {
                    let rowData = mazeData[rowIndex];
                    for (let colIndex = 0; colIndex < mazeDataSize; colIndex++) {
                        let cellData = rowData[colIndex];
                        if (cellData[0][0]) drawHorizontal(2 * rowIndex + offset + 1, 2 * colIndex + offset);
                        if (cellData[3][0]) drawVertical(2 * rowIndex + offset, 2 * colIndex + offset + 1);
                        if (cellData[2][0]) drawHorizontal(2 * rowIndex + offset - 1, 2 * colIndex + offset);
                        if (cellData[1][0]) drawVertical(2 * rowIndex + offset, 2 * colIndex + offset - 1);
                    }
                }
                return grid;
            })(
                (function (size: number, loopsToRemove: number) {
                    let grid: any[][][] = [];
                    let nodeList: any[] = [];

                    const newNode = function () {
                        let node = [1];
                        nodeList.push(node);
                        return node;
                    };

                    const getCell = function (row: number, col: number) {
                        let gridRow = grid[row];
                        return gridRow && gridRow[col];
                    };

                    const setCellProperty = function (row: number, col: number, propertyIndex: number, value: number | boolean) {
                        let gridRow = grid[row];
                        if (gridRow) {
                            if (propertyIndex < 4) {
                                gridRow[col][propertyIndex][0] = value;
                            } else {
                                gridRow[col][propertyIndex] = value;
                            }
                        }
                    };

                    for (let row = 0, prevRow = null; row < size; row++) {
                        let currentRow = [];
                        let isRef = false;
                        for (let col = 0; col < size; col++) {
                            let isRef: any = null; 
                            currentRow.push(
                                (isRef = [
                                    newNode(),
                                    isRef ? isRef[3] : newNode(),
                                    prevRow ? (prevRow as any[])[col][0] : newNode(),
                                    newNode(),
                                    false,
                                ])
                            );
                        }
                        grid.push((prevRow = currentRow as any));
                    }

                    let path = [[Math.floor(Math.random() * size), Math.floor(Math.random() * size)]];
                    const dx = [1, 0, -1, 0];
                    const dy = [0, -1, 0, 1];
                    let lastDirection = -1;
                    let straightRunCount = 0;
                    let turnTendency = -1;

                    const step = function () {
                        if (turnTendency < 0 || Math.random() < 0.1) {
                            turnTendency = Math.random();
                            turnTendency *= 0.4 * turnTendency * turnTendency;
                        }

                        let pathLength = path.length;
                        let currentPos = path[pathLength - 1];

                        const getUnvisitedNeighbors = function (x: number, y: number) {
                            let neighbors: number[] | false = false;
                            for (let dir = 0; dir < 4; dir++) {
                                let neighborCell = getCell(x + dx[dir], y + dy[dir]);
                                if (neighborCell && !neighborCell[4]) {
                                    if (neighbors) {
                                        neighbors.push(dir);
                                    } else {
                                        neighbors = [dir];
                                    }
                                }
                            }
                            return neighbors;
                        };

                        let neighbors = getUnvisitedNeighbors(currentPos[0], currentPos[1]);
                        setCellProperty(currentPos[0], currentPos[1], 4, true);

                        if (neighbors) {
                            let nextDirection = 0;
                            if (lastDirection > 0 && neighbors.indexOf(lastDirection) >= 0 && Math.random() < turnTendency - 0.3 * straightRunCount) {
                                nextDirection = lastDirection;
                                straightRunCount++;
                            } else {
                                straightRunCount = 0;
                                nextDirection = lastDirection = neighbors[Math.floor(Math.random() * neighbors.length)];
                            }

                            setCellProperty(currentPos[0], currentPos[1], nextDirection, 0);
                            path.push([currentPos[0] + dx[nextDirection], currentPos[1] + dy[nextDirection]]);
                        } else {
                            if (pathLength <= 1) {
                                return 1;
                            }
                            path.splice(-1, 1);
                        }
                    };

                    while (!step()) {}

                    if (loopsToRemove > 0) {
                        let nodeCount = nodeList.length;
                        for (let i = nodeCount - 1; i >= 0; i--) {
                            if (!nodeList[i][0]) {
                                nodeList.splice(i, 1);
                                nodeCount--;
                            }
                        }
                        let wallsToRemove = loopsToRemove * nodeCount;
                        for (let i = 0; i < wallsToRemove; i++) {
                            let randomIndex = Math.floor(Math.random() * nodeCount);
                            let node = nodeList[randomIndex];
                            if (node[0]) {
                                node[0] = 0;
                            } else {
                                i--;
                            }
                            nodeCount--;
                            nodeList.splice(randomIndex, 1);
                            if (nodeCount <= 0) break;
                        }
                    }
                    return grid;
                })(25, 0),
                25
            );

            const randomOffsetSmall = function () {
                return Math.floor(5 * Math.random()) - 2;
            };
            const randomOffsetLarge = function () {
                return Math.floor(11 * Math.random()) - 5;
            };

            const clearedAreas: number[][] = [];
            const clearAndRecordArea = function (centerX: number, centerY: number, radius: number) {
                clearedAreas.push([centerX, centerY, radius]);
                clearArea(mazeGrid, centerX, centerY, radius);
            };

            const specialClearPoints = [[42, 42], [6, 6]];
            const specialCellIndices: { [key: number]: boolean } = {};

            for (let i = 0; i < 8; i++) {
                let index = -1;
                while (index < 0 || specialCellIndices[index]) {
                    index = 2 * Math.floor(12 * Math.random()) + 1;
                }
                specialCellIndices[index] = true;
            }

            let cellIndexCounter = -1;
            for (let y = 6; y < 48; y += 9) {
                for (let x = 6; x < 48; x += 9) {
                    cellIndexCounter++;
                    if (Math.random() < 0.7) {
                        clearAndRecordArea(y + randomOffsetLarge(), x + randomOffsetLarge(), 2);
                    }
                    if (specialCellIndices[cellIndexCounter] && (y !== 6 && y !== 42 || x !== 6 && x !== 42) && (y !== 24 || x !== 24)) {
                        continue;
                    }

                    let radius = Math.random() < 0.7 ? 3 : 4;
                    if (y === 24 && x === 24) {
                        radius = 4;
                        clearAndRecordArea(y, x, radius);
                    } else {
                        clearAndRecordArea(y + randomOffsetSmall(), x + randomOffsetSmall(), radius);
                    }
                }
            }

            const dx = [1, 0, -1, 0];
            const dy = [0, -1, 0, 1];
            for (let x = 2; x < 48; x += 2) {
                for (let y = 2; y < 48; y += 2) {
                    if (mazeGrid[x] && mazeGrid[x][y] === 1) {
                        continue;
                    }
                    let wallCount = 0;
                    let passages: number[] | null = null;
                    for (let dir = 0; dir < 4; dir++) {
                        let neighborX = x + dx[dir];
                        let neighborY = y + dy[dir];
                        if (neighborX >= 0 && neighborX < mazeGrid.length && neighborY >= 0 && neighborY < mazeGrid.length && mazeGrid[neighborX][neighborY]) {
                            if (!passages) {
                                passages = [];
                            }
                            passages.push(dir);
                            wallCount++;
                        }
                    }

                    if (wallCount < 2) {
                        continue;
                    }

                    let removeWallChance = 0.05;
                    if (wallCount >= 3) {
                        removeWallChance = 1;
                    }
                    if (passages && Math.random() < removeWallChance) {
                        let dirToRemove = passages[Math.floor(Math.random() * wallCount)];
                        mazeGrid[x + dx[dirToRemove]][y + dy[dirToRemove]] = 0;
                    }
                }
            }

            for (let i = specialClearPoints.length - 1; i >= 0; i--) {
                let point = specialClearPoints[i];
                clearArea(mazeGrid, point[0], point[1], 4);
                for (let dx = -1; dx < 2; dx += 2) {
                    for (let dy = -1; dy < 2; dy += 2) {
                        let cornerX = point[0] + dx;
                        let cornerY = point[1] + dy;
                        if (cornerX >= 0 && cornerX < mazeGrid.length && cornerY >= 0 && cornerY < mazeGrid.length) {
                            mazeGrid[cornerX][cornerY] = 1;
                        }
                    }
                }
            }

            const wallObjects = [];
            const gridSize = mazeGrid.length;
            const halfGridSize = Math.floor(gridSize / 2);
            const Mult = 3;
            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    if (mazeGrid[x][y]) {
                        wallObjects.push({
                            x: (x - halfGridSize) / (160/Mult),
                            y: (y - halfGridSize) / (160/Mult),
                            width: 0.00625 * Mult,
                            height: 0.00625 * Mult,
                        });
                    }
                }
            }

            return wallObjects;
        }

        this.WALLS = crossMaze();
        
        // Create the walls!
        for (let {x, y, width, height} of this.WALLS)
          this._buildWallFromGridCoord(x, y, width, height);
    }

    public isValidSpawnLocation(x: number, y: number): boolean {
        // Should never spawn inside walls
        for (let wall of this.WALLS) {
            const wallX = wall.x * ARENA_SIZE;
            const wallY = wall.y * ARENA_SIZE;
            const wallW = wall.width * ARENA_SIZE;
            const wallH = wall.height * ARENA_SIZE;
            if (
                x >= wallX &&
                x <= wallX + wallW &&
                y >= wallY &&
                y <= wallY + wallH
            ) {
                return false;
            }
        }
        return true;
    }
}

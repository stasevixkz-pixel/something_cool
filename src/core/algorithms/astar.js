/**
 * A* (A-Star) algorithm generator.
 * Uses Manhattan heuristic for grid-based pathfinding.
 * 
 * @typedef {Object} GridCell
 * @property {boolean} isWall - Whether the cell is a wall (obstacle).
 * 
 * @typedef {Object} Position
 * @property {number} x - X coordinate (column).
 * @property {number} y - Y coordinate (row).
 * 
 * @typedef {Object} VisitResult
 * @property {'visit'} type - Type of result.
 * @property {number} x - X coordinate of visited cell.
 * @property {number} y - Y coordinate of visited cell.
 * @property {number} queueSize - Current size of the queue.
 * 
 * @typedef {Object} CompleteResult
 * @property {'complete'} type - Type of result.
 * @property {Position[] | null} path - Array of positions from start to end, or null if not found.
 * @property {number} visitedCount - Total number of visited cells.
 * 
 * @typedef {Object} ErrorResult
 * @property {'error'} type - Type of result.
 * @property {string} message - Error message.
 * 
 * @param {GridCell[][]} grid - 2D grid where each cell has an `isWall` property.
 * @param {Position} start - Starting position.
 * @param {Position} end - Target position.
 * @returns {Generator<VisitResult | CompleteResult | ErrorResult>} Generator yielding A* steps.
 */
export function astarGenerator(grid, start, end) {
    // Input validation
    if (!Array.isArray(grid) || grid.length === 0) {
        yield { type: 'error', message: 'Grid must be a non-empty 2D array.' };
        return;
    }

    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    if (cols === 0) {
        yield { type: 'error', message: 'Grid rows must have at least one column.' };
        return;
    }

    if (!start || typeof start.x !== 'number' || typeof start.y !== 'number') {
        yield { type: 'error', message: 'Start must be an object with numeric x and y properties.' };
        return;
    }

    if (!end || typeof end.x !== 'number' || typeof end.y !== 'number') {
        yield { type: 'error', message: 'End must be an object with numeric x and y properties.' };
        return;
    }

    // Check bounds
    if (start.x < 0 || start.x >= cols || start.y < 0 || start.y >= rows) {
        yield { type: 'error', message: 'Start position is out of grid bounds.' };
        return;
    }

    if (end.x < 0 || end.x >= cols || end.y < 0 || end.y >= rows) {
        yield { type: 'error', message: 'End position is out of grid bounds.' };
        return;
    }

    // Check if start or end are walls
    if (grid[start.y][start.x]?.isWall) {
        yield { type: 'error', message: 'Start position is a wall.' };
        return;
    }

    if (grid[end.y][end.x]?.isWall) {
        yield { type: 'error', message: 'End position is a wall.' };
        return;
    }

    /**
     * Manhattan distance heuristic.
     * @param {number} x1 - X coordinate of first point.
     * @param {number} y1 - Y coordinate of first point.
     * @param {number} x2 - X coordinate of second point.
     * @param {number} y2 - Y coordinate of second point.
     * @returns {number} Manhattan distance.
     */
    function manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    // Priority queue implementation using array + sort by f
    // Each element: { x, y, g, h, f }
    const priorityQueue = [];
    
    // Calculate initial values for start node
    const startH = manhattanDistance(start.x, start.y, end.x, end.y);
    priorityQueue.push({ x: start.x, y: start.y, g: 0, h: startH, f: startH });
    
    // Track minimum g-score for each position (for visited check)
    const minG = new Map();
    minG.set(`${start.x},${start.y}`, 0);
    
    // Parent map for path reconstruction
    const parent = new Map();
    
    let visitedCount = 0;

    // 4 directions: up, down, left, right
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
    ];

    // Default weight for all edges
    const defaultWeight = 1;

    while (priorityQueue.length > 0) {
        // Sort by f (ascending) and pop the first element (minimum f)
        priorityQueue.sort((a, b) => a.f - b.f);
        const current = priorityQueue.shift();
        
        const key = `${current.x},${current.y}`;
        
        // Skip if we've already found a better path to this node
        if (minG.has(key) && minG.get(key) < current.g) {
            continue;
        }

        visitedCount++;
        
        // Yield visit event
        yield { 
            type: 'visit', 
            x: current.x, 
            y: current.y, 
            queueSize: priorityQueue.length 
        };

        // Check if we reached the end
        if (current.x === end.x && current.y === end.y) {
            // Reconstruct path
            const path = [];
            let node = current;
            
            while (node) {
                path.unshift({ x: node.x, y: node.y });
                const nodeKey = `${node.x},${node.y}`;
                node = parent.get(nodeKey);
            }

            yield { 
                type: 'complete', 
                path, 
                visitedCount 
            };
            return;
        }

        // Explore neighbors
        for (const { dx, dy } of directions) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const neighborKey = `${nx},${ny}`;

            // Check bounds
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
                continue;
            }

            // Check if wall
            if (grid[ny][nx]?.isWall) {
                continue;
            }

            // Calculate new g-score
            const newG = current.g + defaultWeight;
            
            // Calculate heuristic (Manhattan distance)
            const h = manhattanDistance(nx, ny, end.x, end.y);
            
            // Calculate f = g + h
            const f = newG + h;

            // If this path is better than any previous path, update
            if (!minG.has(neighborKey) || newG < minG.get(neighborKey)) {
                minG.set(neighborKey, newG);
                parent.set(neighborKey, { x: current.x, y: current.y });
                priorityQueue.push({ x: nx, y: ny, g: newG, h, f });
            }
        }
    }

    // Queue is empty and path not found
    yield { 
        type: 'error', 
        message: 'No path found from start to end.' 
    };
}

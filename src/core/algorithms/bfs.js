/**
 * BFS (Breadth-First Search) algorithm generator.
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
 * @returns {Generator<VisitResult | CompleteResult | ErrorResult>} Generator yielding BFS steps.
 */
export function bfsGenerator(grid, start, end) {
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

    // BFS initialization - use pure data structures (no grid mutation)
    const queue = [{ x: start.x, y: start.y }];
    const visited = new Set();
    const parent = new Map();
    
    visited.add(`${start.x},${start.y}`);
    let visitedCount = 1;

    // 4 directions: up, down, left, right
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
    ];

    while (queue.length > 0) {
        const current = queue.shift();
        
        // Yield visit event (skip for start since it's already "visited" at init)
        if (!(current.x === start.x && current.y === start.y)) {
            yield { 
                type: 'visit', 
                x: current.x, 
                y: current.y, 
                queueSize: queue.length 
            };
        } else {
            // Yield start as visited too
            yield { 
                type: 'visit', 
                x: current.x, 
                y: current.y, 
                queueSize: queue.length 
            };
        }

        // Check if we reached the end
        if (current.x === end.x && current.y === end.y) {
            // Reconstruct path
            const path = [];
            let node = current;
            
            while (node) {
                path.unshift({ x: node.x, y: node.y });
                const key = `${node.x},${node.y}`;
                node = parent.get(key);
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
            const key = `${nx},${ny}`;

            // Check bounds
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
                continue;
            }

            // Check if already visited
            if (visited.has(key)) {
                continue;
            }

            // Check if wall
            if (grid[ny][nx]?.isWall) {
                continue;
            }

            // Mark as visited and add to queue
            visited.add(key);
            visitedCount++;
            parent.set(key, current);
            queue.push({ x: nx, y: ny });
        }
    }

    // Queue is empty and path not found
    yield { 
        type: 'error', 
        message: 'No path found from start to end.' 
    };
}

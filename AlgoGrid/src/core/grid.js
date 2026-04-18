/**
 * @fileoverview Основной класс сетки для алгоритмов поиска пути.
 * Управляет состоянием ячеек, началом и концом пути, препятствиями.
 */

/**
 * Типы ячеек сетки.
 * @enum {string}
 */
export const CellType = {
    EMPTY: 'empty',
    WALL: 'wall',
    START: 'start',
    END: 'end'
};

/**
 * Класс представляющий одну ячейку сетки.
 */
export class Cell {
    /**
     * Создает ячейку.
     * @param {number} x - Координата X (column).
     * @param {number} y - Координата Y (row).
     */
    constructor(x, y) {
        /** @type {number} */
        this.x = x;
        
        /** @type {number} */
        this.y = y;
        
        /** @type {CellType} - Тип ячейки */
        this.type = CellType.EMPTY;
        
        /** @type {boolean} - Посещена ли ячейка */
        this.visited = false;
        
        /** @type {Cell|null} - Родительская ячейка для восстановления пути */
        this.parent = null;
        
        /** @type {number} - Стоимость от начала до текущей ячейки (g) */
        this.g = 0;
        
        /** @type {number} - Эвристическая оценка стоимости до конца (h) */
        this.h = 0;
        
        /** @type {number} - Общая стоимость f = g + h */
        this.f = 0;
    }

    /**
     * Создает копию ячейки.
     * @returns {Cell} Копия ячейки.
     */
    clone() {
        const copy = new Cell(this.x, this.y);
        copy.type = this.type;
        copy.visited = this.visited;
        copy.parent = this.parent;
        copy.g = this.g;
        copy.h = this.h;
        copy.f = this.f;
        return copy;
    }
}

/**
 * Класс управляющий сеткой и её состоянием.
 * Реализует EventTarget для кастомных событий.
 */
export class Grid extends EventTarget {
    /**
     * Создает сетку.
     * @param {number} cols - Количество столбцов.
     * @param {number} rows - Количество строк.
     * @param {number} [cellSize=20] - Размер ячейки в пикселях.
     */
    constructor(cols, rows, cellSize = 20) {
        super();
        
        /** @type {number} */
        this.cols = cols;
        
        /** @type {number} */
        this.rows = rows;
        
        /** @type {number} */
        this.cellSize = cellSize;
        
        /** @type {Cell[][]} - Двумерный массив ячеек */
        this.cells = [];
        
        /** @type {Cell|null} - Начальная ячейка */
        this.startCell = null;
        
        /** @type {Cell|null} - Конечная ячейка */
        this.endCell = null;
        
        this.initialize();
    }

    /**
     * Инициализирует сетку пустыми ячейками.
     */
    initialize() {
        this.cells = [];
        for (let y = 0; y < this.rows; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.cells[y][x] = new Cell(x, y);
            }
        }
    }

    /**
     * Проверяет, являются ли координаты допустимыми.
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {boolean} true если координаты в пределах сетки.
     */
    isValidCell(x, y) {
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }

    /**
     * Получает ячейку по координатам.
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {Cell|undefined} Копия ячейки или undefined если координаты недопустимы.
     */
    getCell(x, y) {
        if (!this.isValidCell(x, y)) {
            return undefined;
        }
        return this.cells[y][x].clone();
    }

    /**
     * Получает внутреннюю ячейку (без клонирования).
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {Cell|undefined} Ячейка или undefined если координаты недопустимы.
     * @private
     */
    _getInternalCell(x, y) {
        if (!this.isValidCell(x, y)) {
            return undefined;
        }
        return this.cells[y][x];
    }

    /**
     * Устанавливает стену в ячейке.
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {boolean} true если стена установлена успешно.
     */
    setWall(x, y) {
        const cell = this._getInternalCell(x, y);
        if (!cell || cell.type === CellType.START || cell.type === CellType.END) {
            return false;
        }
        cell.type = CellType.WALL;
        this.dispatchEvent(new CustomEvent('grid:change', { detail: this }));
        return true;
    }

    /**
     * Удаляет стену из ячейки.
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {boolean} true если стена удалена успешно.
     */
    clearWall(x, y) {
        const cell = this._getInternalCell(x, y);
        if (!cell || cell.type !== CellType.WALL) {
            return false;
        }
        cell.type = CellType.EMPTY;
        this.dispatchEvent(new CustomEvent('grid:change', { detail: this }));
        return true;
    }

    /**
     * Устанавливает начальную точку.
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {boolean} true если начальная точка установлена успешно.
     */
    setStart(x, y) {
        const cell = this._getInternalCell(x, y);
        if (!cell || cell.type === CellType.WALL) {
            return false;
        }
        
        // Снимаем старую начальную точку
        if (this.startCell) {
            this.startCell.type = CellType.EMPTY;
        }
        
        // Если устанавливаем на конечную точку, меняем их местами
        if (cell.type === CellType.END && this.endCell) {
            this.endCell.type = CellType.EMPTY;
            this.endCell = null;
        }
        
        cell.type = CellType.START;
        this.startCell = cell;
        this.dispatchEvent(new CustomEvent('grid:change', { detail: this }));
        return true;
    }

    /**
     * Устанавливает конечную точку.
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {boolean} true если конечная точка установлена успешно.
     */
    setEnd(x, y) {
        const cell = this._getInternalCell(x, y);
        if (!cell || cell.type === CellType.WALL) {
            return false;
        }
        
        // Снимаем старую конечную точку
        if (this.endCell) {
            this.endCell.type = CellType.EMPTY;
        }
        
        // Если устанавливаем на начальную точку, меняем их местами
        if (cell.type === CellType.START && this.startCell) {
            this.startCell.type = CellType.EMPTY;
            this.startCell = null;
        }
        
        cell.type = CellType.END;
        this.endCell = cell;
        this.dispatchEvent(new CustomEvent('grid:change', { detail: this }));
        return true;
    }

    /**
     * Переключает тип ячейки между start и end.
     * @param {number} x - Координата X.
     * @param {number} y - Координата Y.
     * @returns {boolean} true если переключение выполнено успешно.
     */
    toggleStartEnd(x, y) {
        const cell = this._getInternalCell(x, y);
        if (!cell || cell.type === CellType.WALL) {
            return false;
        }
        
        if (cell.type === CellType.START) {
            // Если это start, делаем его end
            return this.setEnd(x, y);
        } else if (cell.type === CellType.END) {
            // Если это end, делаем его start
            return this.setStart(x, y);
        } else {
            // Если это empty, ставим start (если нет start) или end (если нет end)
            if (!this.startCell) {
                return this.setStart(x, y);
            } else if (!this.endCell) {
                return this.setEnd(x, y);
            }
        }
        return false;
    }

    /**
     * Сбрасывает посещенные ячейки и пути, но сохраняет стены.
     */
    reset() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.cells[y][x];
                cell.visited = false;
                cell.parent = null;
                cell.g = 0;
                cell.h = 0;
                cell.f = 0;
            }
        }
        this.dispatchEvent(new CustomEvent('grid:change', { detail: this }));
    }

    /**
     * Полностью очищает сетку, включая стены.
     */
    clear() {
        this.startCell = null;
        this.endCell = null;
        this.initialize();
        this.dispatchEvent(new CustomEvent('grid:change', { detail: this }));
    }

    /**
     * Создает глубокую копию сетки.
     * @returns {Grid} Копия сетки.
     */
    clone() {
        const clonedGrid = new Grid(this.cols, this.rows, this.cellSize);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                clonedGrid.cells[y][x] = this.cells[y][x].clone();
                
                // Восстанавливаем ссылки на start и end
                if (this.startCell && this.startCell.x === x && this.startCell.y === y) {
                    clonedGrid.startCell = clonedGrid.cells[y][x];
                }
                if (this.endCell && this.endCell.x === x && this.endCell.y === y) {
                    clonedGrid.endCell = clonedGrid.cells[y][x];
                }
            }
        }
        
        return clonedGrid;
    }

    /**
     * Получает соседние ячейки (4 направления).
     * @param {Cell} cell - Ячейка для которой ищем соседей.
     * @returns {Cell[]} Массив соседних ячеек.
     */
    getNeighbors(cell) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];
        
        for (const dir of directions) {
            const newX = cell.x + dir.x;
            const newY = cell.y + dir.y;
            
            if (this.isValidCell(newX, newY)) {
                const neighbor = this.cells[newY][newX];
                if (neighbor.type !== CellType.WALL) {
                    neighbors.push(neighbor);
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Получает соседние ячейки (8 направлений).
     * @param {Cell} cell - Ячейка для которой ищем соседей.
     * @returns {Cell[]} Массив соседних ячеек.
     */
    getNeighborsDiagonal(cell) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 },  // up
            { x: 1, y: -1 },  // up-right
            { x: 1, y: 0 },   // right
            { x: 1, y: 1 },   // down-right
            { x: 0, y: 1 },   // down
            { x: -1, y: 1 },  // down-left
            { x: -1, y: 0 },  // left
            { x: -1, y: -1 }  // up-left
        ];
        
        for (const dir of directions) {
            const newX = cell.x + dir.x;
            const newY = cell.y + dir.y;
            
            if (this.isValidCell(newX, newY)) {
                const neighbor = this.cells[newY][newX];
                if (neighbor.type !== CellType.WALL) {
                    neighbors.push(neighbor);
                }
            }
        }
        
        return neighbors;
    }
}

// Экспортируем экземпляр по умолчанию для удобства
export default Grid;

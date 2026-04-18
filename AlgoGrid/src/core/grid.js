/**
 * @fileoverview Основной класс сетки для алгоритмов поиска пути.
 * Управляет состоянием ячеек, началом и концом пути, препятствиями.
 */

/**
 * Класс представляющий одну ячейку сетки.
 */
export class Cell {
    /**
     * Создает ячейку.
     * @param {number} row - Номер строки.
     * @param {number} col - Номер столбца.
     */
    constructor(row, col) {
        /** @type {number} */
        this.row = row;
        
        /** @type {number} */
        this.col = col;
        
        /** @type {boolean} - Является ли препятствием */
        this.isWall = false;
        
        /** @type {boolean} - Посещена ли ячейка */
        this.isVisited = false;
        
        /** @type {boolean} - Является ли частью пути */
        this.isPath = false;
        
        /** @type {boolean} - Является ли начальной точкой */
        this.isStart = false;
        
        /** @type {boolean} - Является ли конечной точкой */
        this.isEnd = false;
        
        /** @type {number|null} - Расстояние от начала */
        this.distance = null;
        
        /** @type {Cell|null} - Родительская ячейка для восстановления пути */
        this.parent = null;
        
        /** @type {number} - Эвристическая оценка (для A*) */
        this.heuristic = 0;
        
        /** @type {number} - Общая стоимость (для A*) */
        this.totalCost = 0;
    }

    /**
     * Сбрасывает состояние ячейки.
     */
    reset() {
        this.isVisited = false;
        this.isPath = false;
        this.distance = null;
        this.parent = null;
        this.heuristic = 0;
        this.totalCost = 0;
    }
}

/**
 * Класс управляющий сеткой и её состоянием.
 */
export class Grid {
    /**
     * Создает сетку.
     * @param {number} rows - Количество строк.
     * @param {number} cols - Количество столбцов.
     */
    constructor(rows = 20, cols = 30) {
        /** @type {number} */
        this.rows = rows;
        
        /** @type {number} */
        this.cols = cols;
        
        /** @type {Cell[][]} - Двумерный массив ячеек */
        this.cells = [];
        
        /** @type {Cell|null} - Начальная ячейка */
        this.startCell = null;
        
        /** @type {Cell|null} - Конечная ячейка */
        this.endCell = null;
        
        /** @type {boolean} - Флаг выполнения алгоритма */
        this.isRunning = false;
        
        /** @type {boolean} - Флаг паузы */
        this.isPaused = false;
        
        this.initialize();
    }

    /**
     * Инициализирует сетку.
     */
    initialize() {
        console.log('Grid: initialize');
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = new Cell(row, col);
            }
        }
    }

    /**
     * Устанавливает начальную ячейку.
     * @param {number} row - Номер строки.
     * @param {number} col - Номер столбца.
     */
    setStartCell(row, col) {
        console.log('Grid: setStartCell', row, col);
    }

    /**
     * Устанавливает конечную ячейку.
     * @param {number} row - Номер строки.
     * @param {number} col - Номер столбца.
     */
    setEndCell(row, col) {
        console.log('Grid: setEndCell', row, col);
    }

    /**
     * Переключает состояние стены в ячейке.
     * @param {number} row - Номер строки.
     * @param {number} col - Номер столбца.
     */
    toggleWall(row, col) {
        console.log('Grid: toggleWall', row, col);
    }

    /**
     * Сбрасывает все посещенные ячейки и пути.
     */
    resetVisited() {
        console.log('Grid: resetVisited');
    }

    /**
     * Полностью сбрасывает сетку.
     */
    reset() {
        console.log('Grid: reset');
    }

    /**
     * Получает соседние ячейки.
     * @param {Cell} cell - Ячейка для которой ищем соседей.
     * @returns {Cell[]} Массив соседних ячеек.
     */
    getNeighbors(cell) {
        console.log('Grid: getNeighbors');
        return [];
    }

    /**
     * Очищает путь.
     */
    clearPath() {
        console.log('Grid: clearPath');
    }
}

// Экспортируем экземпляр по умолчанию для удобства
export default Grid;

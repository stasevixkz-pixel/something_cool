/**
 * @fileoverview Рендерер для отрисовки сетки на canvas.
 * Отвечает за визуализацию ячеек, путей, стен и анимаций.
 */

import { Grid, Cell } from '../core/grid.js';

/**
 * Класс для отрисовки сетки на HTML5 Canvas.
 * Поддерживает retina-дисплеи через devicePixelRatio.
 */
export class CanvasRenderer {
    /**
     * Создает рендерер.
     * @param {HTMLCanvasElement} canvasElement - Элемент canvas для отрисовки.
     * @param {Grid} gridInstance - Экземпляр сетки для отрисовки.
     */
    constructor(canvasElement, gridInstance) {
        if (!canvasElement) {
            throw new Error('CanvasRenderer: canvasElement is required');
        }
        if (!(gridInstance instanceof Grid)) {
            throw new Error('CanvasRenderer: gridInstance must be an instance of Grid');
        }

        /** @type {HTMLCanvasElement} */
        this.canvas = canvasElement;

        /** @type {CanvasRenderingContext2D|null} */
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('CanvasRenderer: failed to get 2D context');
        }

        /** @type {Grid} */
        this.grid = gridInstance;

        /** @type {number} - Размер ячейки в пикселях */
        this.cellSize = 20;

        /** @type {number} - Внутренняя ширина canvas в логических пикселях */
        this.internalWidth = 0;

        /** @type {number} - Внутренняя высота canvas в логических пикселях */
        this.internalHeight = 0;

        /** @type {number} - Device pixel ratio для retina-дисплеев */
        this.dpr = window.devicePixelRatio || 1;

        /** @type {boolean} - Флаг запланированной перерисовки */
        this._drawScheduled = false;

        /** @type {number|undefined} - Версия grid при последней отрисовке */
        this._lastGridVersion = undefined;

        /** @type {Object} - Цвета для различных состояний ячеек */
        this.colors = {
            background: '#0f172a',
            gridLine: '#1e293b',
            wall: '#334155',
            start: '#22c55e',
            end: '#ef4444',
            visited: 'rgba(59, 130, 246, 0.5)',
            path: '#f59e0b'
        };

        // Слушаем изменения grid для оптимизации перерисовки
        this.grid.addEventListener('grid:change', () => {
            this.scheduleDraw();
        });

        this.resize();
    }

    /**
     * Подстраивает размер canvas под окно с учётом cellSize.
     * Обновляет internal width/height и масштабирует для retina.
     */
    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) {
            return;
        }

        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;

        // Вычисляем оптимальный cellSize чтобы сетка помещалась
        const maxCellSizeByWidth = Math.floor(parentWidth / this.grid.cols);
        const maxCellSizeByHeight = Math.floor(parentHeight / this.grid.rows);
        this.cellSize = Math.min(maxCellSizeByWidth, maxCellSizeByHeight, 40);

        // Логические размеры canvas
        this.internalWidth = this.grid.cols * this.cellSize;
        this.internalHeight = this.grid.rows * this.cellSize;

        // Физические размеры с учётом DPR для чёткости на retina
        this.canvas.width = Math.floor(this.internalWidth * this.dpr);
        this.canvas.height = Math.floor(this.internalHeight * this.dpr);

        // CSS размеры (логические пиксели)
        this.canvas.style.width = `${this.internalWidth}px`;
        this.canvas.style.height = `${this.internalHeight}px`;

        // Масштабируем контекст для retina
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.scheduleDraw();
    }

    /**
     * Очищает canvas полностью.
     */
    clear() {
        try {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        } catch (error) {
            console.error('CanvasRenderer: clear error:', error);
        }
    }

    /**
     * Отрисовывает текущее состояние grid.
     * Пропускает кадр если grid не менялся.
     */
    draw() {
        this._drawScheduled = false;

        // Проверяем, изменился ли grid с последней отрисовки
        // Используем простой хеш на основе количества посещённых ячеек и пути
        const currentVersion = this._getGridVersion();
        if (this._lastGridVersion === currentVersion && this.canvas.width > 0) {
            return;
        }
        this._lastGridVersion = currentVersion;

        try {
            this._performDraw();
        } catch (error) {
            console.error('CanvasRenderer: draw error:', error);
        }
    }

    /**
     * Выполняет фактическую отрисовку.
     * @private
     */
    _performDraw() {
        this.clear();

        this.ctx.save();

        // Фон
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.internalWidth, this.internalHeight);

        // Сетка (опционально, тонкие линии)
        this._drawGridLines();

        // Посещённые ячейки
        this._drawVisitedCells();

        // Стены
        this._drawWalls();

        // Старт и финиш (круги)
        this._drawStartEnd();

        // Путь
        this._drawPath();

        this.ctx.restore();
    }

    /**
     * Отрисовывает линии сетки.
     * @private
     */
    _drawGridLines() {
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 1;

        for (let row = 0; row <= this.grid.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.cellSize + 0.5);
            this.ctx.lineTo(this.internalWidth, row * this.cellSize + 0.5);
            this.ctx.stroke();
        }

        for (let col = 0; col <= this.grid.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.cellSize + 0.5, 0);
            this.ctx.lineTo(col * this.cellSize + 0.5, this.internalHeight);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    /**
     * Отрисовывает посещённые ячейки.
     * @private
     */
    _drawVisitedCells() {
        this.ctx.save();
        this.ctx.fillStyle = this.colors.visited;

        for (let y = 0; y < this.grid.rows; y++) {
            for (let x = 0; x < this.grid.cols; x++) {
                const cell = this.grid.cells[y][x];
                if (cell.visited && cell.type !== 'start' && cell.type !== 'end') {
                    this.ctx.fillRect(
                        x * this.cellSize + 1,
                        y * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                }
            }
        }

        this.ctx.restore();
    }

    /**
     * Отрисовывает стены.
     * @private
     */
    _drawWalls() {
        this.ctx.save();
        this.ctx.fillStyle = this.colors.wall;

        for (let y = 0; y < this.grid.rows; y++) {
            for (let x = 0; x < this.grid.cols; x++) {
                const cell = this.grid.cells[y][x];
                if (cell.type === 'wall') {
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }

        this.ctx.restore();
    }

    /**
     * Отрисовывает старт и финиш как круги.
     * @private
     */
    _drawStartEnd() {
        this.ctx.save();

        const drawCircle = (cell, color) => {
            const centerX = cell.x * this.cellSize + this.cellSize / 2;
            const centerY = cell.y * this.cellSize + this.cellSize / 2;
            const radius = (this.cellSize / 2) - 2;

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        };

        // Ищем start и end ячейки
        for (let y = 0; y < this.grid.rows; y++) {
            for (let x = 0; x < this.grid.cols; x++) {
                const cell = this.grid.cells[y][x];
                if (cell.type === 'start') {
                    drawCircle(cell, this.colors.start);
                } else if (cell.type === 'end') {
                    drawCircle(cell, this.colors.end);
                }
            }
        }

        this.ctx.restore();
    }

    /**
     * Отрисовывает путь линией толщиной 3px.
     * @private
     */
    _drawPath() {
        // Находим путь восстанавливая родителей от end к start
        const path = [];
        let current = this.grid.endCell;

        while (current && current.parent) {
            path.unshift(current);
            current = current.parent;
        }

        if (path.length === 0) {
            return;
        }

        this.ctx.save();
        this.ctx.strokeStyle = this.colors.path;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();

        // Начинаем от start ячейки
        const startCell = this.grid.startCell;
        if (startCell) {
            const startX = startCell.x * this.cellSize + this.cellSize / 2;
            const startY = startCell.y * this.cellSize + this.cellSize / 2;
            this.ctx.moveTo(startX, startY);
        }

        // Рисуем линию через все ячейки пути
        for (const cell of path) {
            const x = cell.x * this.cellSize + this.cellSize / 2;
            const y = cell.y * this.cellSize + this.cellSize / 2;
            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Вычисляет простую версию состояния grid для оптимизации.
     * @returns {number} Хеш версии.
     * @private
     */
    _getGridVersion() {
        let hash = 0;
        for (let y = 0; y < this.grid.rows; y++) {
            for (let x = 0; x < this.grid.cols; x++) {
                const cell = this.grid.cells[y][x];
                // Учитываем тип, visited и parent для пути
                hash += cell.type === 'wall' ? 1 : 0;
                hash += cell.visited ? 2 : 0;
                hash += cell.parent ? 4 : 0;
            }
        }
        return hash;
    }

    /**
     * Запланировать перерисовку через requestAnimationFrame.
     * Если отрисовка уже запланирована, ничего не делает.
     */
    scheduleDraw() {
        if (this._drawScheduled) {
            return;
        }
        this._drawScheduled = true;
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Получает координаты ячейки под курсором.
     * @param {MouseEvent} event - Событие мыши.
     * @returns {{x: number, y: number}|null} Координаты ячейки или null.
     */
    getCellFromEvent(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row >= 0 && row < this.grid.rows && col >= 0 && col < this.grid.cols) {
            return { x: col, y: row };
        }

        return null;
    }
}

export default CanvasRenderer;

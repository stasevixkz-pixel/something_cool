/**
 * @fileoverview Рендерер для отрисовки сетки на canvas.
 * Отвечает за визуализацию ячеек, путей, стен и анимаций.
 */

import { Grid } from './grid.js';

/**
 * Класс для отрисовки сетки на HTML5 Canvas.
 */
export class CanvasRenderer {
    /**
     * Создает рендерер.
     * @param {HTMLCanvasElement} canvas - Элемент canvas для отрисовки.
     * @param {Grid} grid - Экземпляр сетки для отрисовки.
     */
    constructor(canvas, grid) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;
        
        /** @type {CanvasRenderingContext2D|null} */
        this.ctx = canvas.getContext('2d');
        
        /** @type {Grid} */
        this.grid = grid;
        
        /** @type {number} - Размер ячейки в пикселях */
        this.cellSize = 20;
        
        /** @type {Object} - Цвета для различных состояний ячеек */
        this.colors = {
            background: '#16213e',
            wall: '#e94560',
            start: '#4caf50',
            end: '#f44336',
            visited: '#2196f3',
            path: '#ff9800',
            gridLine: 'rgba(255, 255, 255, 0.1)',
            hover: 'rgba(255, 255, 255, 0.2)'
        };
        
        this.resize();
    }

    /**
     * Подстраивает размер canvas под контейнер.
     */
    resize() {
        console.log('CanvasRenderer: resize');
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = Math.min(parent.clientWidth - 40, 800);
            this.canvas.height = Math.min(parent.clientHeight - 40, 600);
        }
        this.cellSize = Math.floor(Math.min(
            this.canvas.width / this.grid.cols,
            this.canvas.height / this.grid.rows
        ));
    }

    /**
     * Очищает canvas.
     */
    clear() {
        console.log('CanvasRenderer: clear');
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Отрисовывает всю сетку.
     */
    render() {
        console.log('CanvasRenderer: render');
        this.clear();
        this.drawGrid();
        this.drawCells();
    }

    /**
     * Отрисовывает линии сетки.
     */
    drawGrid() {
        console.log('CanvasRenderer: drawGrid');
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 1;
        
        for (let row = 0; row <= this.grid.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.cellSize);
            this.ctx.lineTo(this.grid.cols * this.cellSize, row * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let col = 0; col <= this.grid.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.cellSize, 0);
            this.ctx.lineTo(col * this.cellSize, this.grid.rows * this.cellSize);
            this.ctx.stroke();
        }
    }

    /**
     * Отрисовывает все ячейки.
     */
    drawCells() {
        console.log('CanvasRenderer: drawCells');
        if (!this.ctx) return;
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const cell = this.grid.cells[row][col];
                this.drawCell(cell);
            }
        }
    }

    /**
     * Отрисовывает одну ячейку.
     * @param {import('../core/grid.js').Cell} cell - Ячейка для отрисовки.
     */
    drawCell(cell) {
        if (!this.ctx) return;
        
        const x = cell.x * this.cellSize;
        const y = cell.y * this.cellSize;
        
        let color = this.colors.background;
        
        // Определяем цвет по типу ячейки
        if (cell.type === 'wall') {
            color = this.colors.wall;
        } else if (cell.type === 'start') {
            color = this.colors.start;
        } else if (cell.type === 'end') {
            color = this.colors.end;
        } else if (cell.isPath) {
            color = this.colors.path;
        } else if (cell.visited) {
            color = this.colors.visited;
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        
        // Рисуем маркер для start/end
        if (cell.type === 'start' || cell.type === 'end') {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const label = cell.type === 'start' ? 'S' : 'E';
            this.ctx.fillText(label, x + this.cellSize / 2, y + this.cellSize / 2);
        }
    }

    /**
     * Отрисовывает путь по массиву ячеек.
     * @param {import('./grid.js').Cell[]} path - Массив ячеек пути.
     */
    drawPath(path) {
        console.log('CanvasRenderer: drawPath');
    }

    /**
     * Анимация посещения ячейки.
     * @param {import('./grid.js').Cell} cell - Посещаемая ячейка.
     */
    animateVisit(cell) {
        console.log('CanvasRenderer: animateVisit');
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

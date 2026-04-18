/**
 * @fileoverview Точка входа приложения AlgoGrid.
 * Инициализирует все модули и настраивает взаимодействие между ними.
 */

import { Grid } from './src/core/grid.js';
import { CanvasRenderer } from './src/ui/canvas-renderer.js';
import { Controls } from './src/ui/controls.js';
import { StatsPanel } from './src/ui/stats-panel.js';

/**
 * Главный класс приложения AlgoGrid.
 */
class AlgoGridApp {
    /**
     * Создает экземпляр приложения.
     */
    constructor() {
        /** @type {Grid|null} - Экземпляр сетки */
        this.grid = null;
        
        /** @type {CanvasRenderer|null} - Экземпляр рендерера */
        this.renderer = null;
        
        /** @type {Controls|null} - Экземпляр контроллера управления */
        this.controls = null;
        
        /** @type {StatsPanel|null} - Экземпляр панели статистики */
        this.statsPanel = null;
        
        /** @type {boolean} - Флаг инициализации */
        this.isInitialized = false;
        
        /** @type {boolean} - Флаг нажатой кнопки мыши */
        this.isMouseDown = false;
        
        /** @type {number} - Текущий режим рисования (0=none, 1=wall, 2=erase) */
        this.drawMode = 0;
    }

    /**
     * Инициализирует приложение.
     */
    init() {
        console.log('AlgoGridApp: Initializing...');
        
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Настраивает все компоненты приложения.
     */
    setup() {
        console.log('AlgoGridApp: Setting up components...');
        
        // Создаем экземпляр сетки (cols, rows, cellSize)
        this.grid = new Grid(30, 20, 20);
        console.log('AlgoGridApp: Grid created');
        
        // Получаем canvas элемент
        const canvas = document.getElementById('grid');
        if (!canvas) {
            console.error('AlgoGridApp: Canvas element not found');
            return;
        }
        
        // Создаем рендерер
        this.renderer = new CanvasRenderer(canvas, this.grid);
        console.log('AlgoGridApp: CanvasRenderer created');
        
        // Создаем панель статистики
        this.statsPanel = new StatsPanel();
        console.log('AlgoGridApp: StatsPanel created');
        
        // Создаем контроллер управления
        this.controls = new Controls(this.grid, this.renderer);
        console.log('AlgoGridApp: Controls created');
        
        // Настраиваем обработчики мыши
        this.setupMouseHandlers(canvas);
        
        // Подписываемся на события изменений сетки
        this.grid.addEventListener('grid:change', () => {
            this.renderer.render();
        });
        
        // Отрисовываем начальное состояние
        this.renderer.render();
        console.log('AlgoGridApp: Initial render complete');
        
        this.isInitialized = true;
        console.log('AlgoGridApp: Initialization complete');
    }

    /**
     * Настраивает обработчики мыши для canvas.
     * @param {HTMLCanvasElement} canvas - Элемент canvas.
     */
    setupMouseHandlers(canvas) {
        // Вспомогательная функция для получения координат ячейки
        const getCellCoords = (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const col = Math.floor(x / this.renderer.cellSize);
            const row = Math.floor(y / this.renderer.cellSize);
            
            return { x: col, y: row };
        };

        // Обработчик mousedown
        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();
            this.isMouseDown = true;
            
            const { x, y } = getCellCoords(event);
            
            // ЛКМ (button 0) или ЛКМ+Shift
            if (event.button === 0) {
                if (event.shiftKey) {
                    // Shift+ЛКМ = переключение start/end
                    this.grid.toggleStartEnd(x, y);
                    this.drawMode = 0;
                } else {
                    // ЛКМ = ставим стену
                    const cell = this.grid._getInternalCell(x, y);
                    if (cell && cell.type !== 'start' && cell.type !== 'end') {
                        if (cell.type === 'wall') {
                            this.drawMode = 2; // режим стирания
                            this.grid.clearWall(x, y);
                        } else {
                            this.drawMode = 1; // режим рисования стен
                            this.grid.setWall(x, y);
                        }
                    }
                }
            }
            // ПКМ (button 2)
            else if (event.button === 2) {
                this.drawMode = 2; // режим стирания
                this.grid.clearWall(x, y);
            }
        });

        // Обработчик mousemove
        canvas.addEventListener('mousemove', (event) => {
            if (!this.isMouseDown) return;
            event.preventDefault();
            
            const { x, y } = getCellCoords(event);
            
            if (this.drawMode === 1) {
                // Режим рисования стен
                this.grid.setWall(x, y);
            } else if (this.drawMode === 2) {
                // Режим стирания
                this.grid.clearWall(x, y);
            }
        });

        // Обработчик mouseup
        canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.drawMode = 0;
        });

        // Обработчик mouseleave
        canvas.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
            this.drawMode = 0;
        });

        // Блокируем контекстное меню на canvas
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    /**
     * Запускает выполнение алгоритма.
     */
    play() {
        console.log('AlgoGridApp: Play called');
        if (!this.isInitialized) return;
        
        // Заглушка для будущей реализации
        if (this.statsPanel) {
            this.statsPanel.setStatus('running');
        }
    }

    /**
     * Ставит алгоритм на паузу.
     */
    pause() {
        console.log('AlgoGridApp: Pause called');
        if (!this.isInitialized) return;
        
        // Заглушка для будущей реализации
        if (this.statsPanel) {
            this.statsPanel.setStatus('paused');
        }
    }

    /**
     * Выполняет один шаг алгоритма.
     */
    step() {
        console.log('AlgoGridApp: Step called');
        if (!this.isInitialized) return;
        
        // Заглушка для будущей реализации
    }

    /**
     * Сбрасывает состояние приложения.
     */
    reset() {
        console.log('AlgoGridApp: Reset called');
        if (!this.isInitialized) return;
        
        if (this.grid) {
            this.grid.reset();
        }
        
        if (this.statsPanel) {
            this.statsPanel.reset();
        }
        
        if (this.renderer) {
            this.renderer.render();
        }
    }
}

// Создаем и инициализируем приложение
const app = new AlgoGridApp();
app.init();

// Экспортируем для возможного использования в других модулях
export default AlgoGridApp;

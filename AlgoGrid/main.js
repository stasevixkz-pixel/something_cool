/**
 * @fileoverview Точка входа приложения AlgoGrid.
 * Инициализирует все модули и настраивает взаимодействие между ними.
 */

import { Grid } from './src/core/grid.js';
import { CanvasRenderer } from './src/ui/canvas-renderer.js';
import { Controls } from './src/ui/controls.js';
import { StatsPanel } from './src/ui/stats-panel.js';
import { StepController } from './src/ui/step-controller.js';
import { autoLoad, autoSave, loadFromJSON } from './src/io/storage.js';
import { bfsGenerator } from './src/core/algorithms/bfs.js';
import { dijkstraGenerator } from './src/core/algorithms/dijkstra.js';
import { astarGenerator } from './src/core/algorithms/astar.js';

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
        
        /** @type {StepController|null} - Контроллер выполнения алгоритма */
        this.stepController = null;
        
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
        
        // Автозагрузка из localStorage
        if (autoLoad(this.grid)) {
            console.log('AlgoGridApp: Auto-loaded grid from localStorage');
        }
        
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
        
        // Создаем контроллер выполнения алгоритма
        this.stepController = new StepController();
        console.log('AlgoGridApp: StepController created');
        
        // Создаем контроллер управления, передавая stepController
        this.controls = new Controls(this.grid, this.renderer, this.stepController);
        console.log('AlgoGridApp: Controls created');
        
        // Настраиваем callbacks для кнопок
        this.setupControlCallbacks();
        
        // Подписываемся на события StepController
        this.setupStepControllerEvents();
        
        // Настраиваем обработчики мыши
        this.setupMouseHandlers(canvas);
        
        // Подписываемся на события изменений сетки для автосохранения
        this.grid.addEventListener('grid:change', () => {
            this.renderer.render();
            autoSave(this.grid);
        });
        
        // Отрисовываем начальное состояние
        this.renderer.render();
        console.log('AlgoGridApp: Initial render complete');
        
        this.isInitialized = true;
        console.log('AlgoGridApp: Initialization complete');
    }

    /**
     * Настраивает обработчики событий StepController.
     */
    setupStepControllerEvents() {
        console.log('AlgoGridApp: Setting up StepController events');
        
        if (!this.stepController) return;
        
        // Обработчик шага алгоритма
        this.stepController.addEventListener('algo:step', (event) => {
            console.log('AlgoGridApp: algo:step event', event.detail);
            
            // Обновляем статистику
            if (this.statsPanel) {
                this.statsPanel.setVisitedCount(event.detail.visitedCount);
                this.statsPanel.setExecutionTime(event.detail.time);
            }
            
            // Перерисовываем сетку
            if (this.renderer) {
                this.renderer.render();
            }
        });
        
        // Обработчик завершения алгоритма
        this.stepController.addEventListener('algo:complete', (event) => {
            console.log('AlgoGridApp: algo:complete event', event.detail);
            
            // Обновляем статистику
            if (this.statsPanel) {
                this.statsPanel.setVisitedCount(event.detail.visitedCount);
                this.statsPanel.setExecutionTime(event.detail.time);
                this.statsPanel.setPathLength(event.detail.path ? event.detail.path.length : 0);
                this.statsPanel.setStatus('completed');
            }
            
            // Подсвечиваем путь
            if (this.renderer && event.detail.path) {
                this.renderer.highlightPath(event.detail.path);
            }
        });
        
        // Обработчик ошибки
        this.stepController.addEventListener('algo:error', (event) => {
            console.error('AlgoGridApp: algo:error event', event.detail);
            
            if (this.statsPanel) {
                this.statsPanel.setStatus('error');
            }
        });
    }

    /**
     * Настраивает callbacks для кнопок управления.
     */
    setupControlCallbacks() {
        console.log('AlgoGridApp: Setting up control callbacks');
        
        if (!this.controls) return;
        
        this.controls.setOnPlay(() => this.play());
        this.controls.setOnPause(() => this.pause());
        this.controls.setOnStep(() => this.step());
        this.controls.setOnReset(() => this.reset());
        
        // Callback для импорта
        this.controls.setOnImport((data) => {
            return loadFromJSON(this.grid, data);
        });
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
        
        // Проверяем наличие start и end точек
        if (!this.grid || !this.grid.startCell || !this.grid.endCell) {
            console.warn('AlgoGridApp: Start or End point not set');
            if (this.statsPanel) {
                this.statsPanel.setStatus('error');
            }
            return;
        }
        
        // Создаем генератор алгоритма на основе выбранного
        const algorithm = this.controls ? this.controls.getAlgorithm() : 'bfs';
        const generatorFactory = this.getAlgorithmGenerator(algorithm);
        
        if (!generatorFactory) {
            console.warn('AlgoGridApp: Unknown algorithm', algorithm);
            return;
        }
        
        // Сбрасываем сетку перед запуском
        this.grid.reset();
        
        // Обновляем статистику
        if (this.statsPanel) {
            this.statsPanel.reset();
            this.statsPanel.setStatus('running');
        }
        
        // Запускаем контроллер
        if (this.stepController) {
            this.stepController.start(generatorFactory);
        }
    }

    /**
     * Получает фабрику генератора для указанного алгоритма.
     * @param {string} algorithm - Название алгоритма.
     * @returns {Function|null} Функция-генератор или null.
     */
    getAlgorithmGenerator(algorithm) {
        if (!this.grid || !this.grid.startCell || !this.grid.endCell) return null;
        
        const start = { x: this.grid.startCell.x, y: this.grid.startCell.y };
        const end = { x: this.grid.endCell.x, y: this.grid.endCell.y };
        
        // Преобразуем сетку в формат для алгоритмов (2D массив с isWall)
        const gridData = [];
        for (let y = 0; y < this.grid.rows; y++) {
            gridData[y] = [];
            for (let x = 0; x < this.grid.cols; x++) {
                gridData[y][x] = {
                    isWall: this.grid.cells[y][x].type === 'wall'
                };
            }
        }
        
        switch (algorithm) {
            case 'bfs':
                return () => bfsGenerator(gridData, start, end);
            case 'dfs':
                return () => this.dfsGenerator();
            case 'dijkstra':
                return () => dijkstraGenerator(gridData, start, end);
            case 'astar':
                return () => astarGenerator(gridData, start, end);
            default:
                // По умолчанию используем BFS
                return () => bfsGenerator(gridData, start, end);
        }
    }

    /**
     * Генератор алгоритма BFS.
     * @yields {{type: string, cell?: Cell, path?: Cell[]}}
     */
    *bfsGenerator() {
        const queue = [];
        const visited = new Set();
        
        if (!this.grid.startCell || !this.grid.endCell) {
            yield { type: 'error', msg: 'Start or End point not set' };
            return;
        }
        
        queue.push(this.grid.startCell);
        visited.add(`${this.grid.startCell.x},${this.grid.startCell.y}`);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Yield visit action
            yield { type: 'visit', cell: current };
            
            // Проверяем, достигли ли мы конца
            if (current === this.grid.endCell) {
                // Восстанавливаем путь
                const path = this.reconstructPath(current);
                yield { type: 'complete', path };
                return;
            }
            
            // Добавляем соседей
            const neighbors = this.grid.getNeighbors(current);
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    neighbor.parent = current;
                    queue.push(neighbor);
                }
            }
        }
        
        // Путь не найден
        yield { type: 'complete', path: [] };
    }

    /**
     * Генератор алгоритма DFS.
     * @yields {{type: string, cell?: Cell, path?: Cell[]}}
     */
    *dfsGenerator() {
        const stack = [];
        const visited = new Set();
        
        if (!this.grid.startCell || !this.grid.endCell) {
            yield { type: 'error', msg: 'Start or End point not set' };
            return;
        }
        
        stack.push(this.grid.startCell);
        
        while (stack.length > 0) {
            const current = stack.pop();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) {
                continue;
            }
            
            visited.add(key);
            
            // Yield visit action
            yield { type: 'visit', cell: current };
            
            // Проверяем, достигли ли мы конца
            if (current === this.grid.endCell) {
                // Восстанавливаем путь
                const path = this.reconstructPath(current);
                yield { type: 'complete', path };
                return;
            }
            
            // Добавляем соседей
            const neighbors = this.grid.getNeighbors(current);
            for (const neighbor of neighbors) {
                const nKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(nKey)) {
                    neighbor.parent = current;
                    stack.push(neighbor);
                }
            }
        }
        
        // Путь не найден
        yield { type: 'complete', path: [] };
    }

    /**
     * Восстанавливает путь от конечной точки к начальной.
     * @param {Cell} endCell - Конечная ячейка.
     * @returns {Cell[]} Массив ячеек пути.
     */
    reconstructPath(endCell) {
        const path = [];
        let current = endCell;
        
        while (current) {
            path.unshift(current);
            current = current.parent;
        }
        
        return path;
    }

    /**
     * Ставит алгоритм на паузу.
     */
    pause() {
        console.log('AlgoGridApp: Pause called');
        if (!this.isInitialized) return;
        
        if (this.stepController) {
            this.stepController.pause();
        }
        
        if (this.statsPanel && !this.stepController?.isRunning()) {
            this.statsPanel.setStatus('paused');
        }
    }

    /**
     * Выполняет один шаг алгоритма.
     */
    step() {
        console.log('AlgoGridApp: Step called');
        if (!this.isInitialized) return;
        
        // Если не запущен и не на паузе, запускаем новый алгоритм
        if (!this.stepController || (!this.stepController.isRunning() && !this.stepController.paused)) {
            // Проверяем наличие start и end точек
            if (!this.grid || !this.grid.startCell || !this.grid.endCell) {
                console.warn('AlgoGridApp: Start or End point not set');
                return;
            }
            
            const algorithm = this.controls ? this.controls.getAlgorithm() : 'bfs';
            const generatorFactory = this.getAlgorithmGenerator(algorithm);
            
            if (!generatorFactory) {
                console.warn('AlgoGridApp: Unknown algorithm', algorithm);
                return;
            }
            
            // Сбрасываем сетку перед запуском
            this.grid.reset();
            
            // Обновляем статистику
            if (this.statsPanel) {
                this.statsPanel.reset();
                this.statsPanel.setStatus('running');
            }
            
            // Запускаем контроллер в режиме одного шага
            if (this.stepController) {
                this.stepController.start(generatorFactory);
                this.stepController.pause(); // Сразу ставим на паузу после первого шага
            }
        } else {
            // Делаем один шаг
            if (this.stepController) {
                this.stepController.step();
            }
        }
    }

    /**
     * Сбрасывает состояние приложения.
     */
    reset() {
        console.log('AlgoGridApp: Reset called');
        if (!this.isInitialized) return;
        
        // Останавливаем контроллер
        if (this.stepController) {
            this.stepController.reset();
        }
        
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

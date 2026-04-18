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
        
        // Создаем экземпляр сетки
        this.grid = new Grid(20, 30);
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
        
        // Отрисовываем начальное состояние
        this.renderer.render();
        console.log('AlgoGridApp: Initial render complete');
        
        this.isInitialized = true;
        console.log('AlgoGridApp: Initialization complete');
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

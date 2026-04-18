/**
 * @fileoverview Управление элементами интерфейса.
 * Обрабатывает события кнопок, выбора алгоритма и слайдера скорости.
 */

import { Grid } from '../core/grid.js';
import { CanvasRenderer } from './canvas-renderer.js';

/**
 * Класс для управления элементами UI.
 */
export class Controls {
    /**
     * Создает контроллер управления.
     * @param {Grid} grid - Экземпляр сетки.
     * @param {CanvasRenderer} renderer - Экземпляр рендерера.
     */
    constructor(grid, renderer) {
        /** @type {Grid} */
        this.grid = grid;
        
        /** @type {CanvasRenderer} */
        this.renderer = renderer;
        
        /** @type {number} - Текущая скорость анимации */
        this.speed = 50;
        
        /** @type {string} - Выбранный алгоритм */
        this.selectedAlgorithm = 'bfs';
        
        /** @type {Object|null} - Ссылки на DOM элементы */
        this.elements = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * Инициализирует ссылки на DOM элементы.
     */
    initializeElements() {
        console.log('Controls: initializeElements');
        this.elements = {
            playButton: document.getElementById('btn-play'),
            pauseButton: document.getElementById('btn-pause'),
            stepButton: document.getElementById('btn-step'),
            resetButton: document.getElementById('btn-reset'),
            algorithmSelect: document.getElementById('algorithm-select'),
            speedSlider: document.getElementById('speed-slider'),
            speedValue: document.getElementById('speed-value'),
            canvas: document.getElementById('grid')
        };
    }

    /**
     * Навешивает обработчики событий на элементы управления.
     */
    attachEventListeners() {
        console.log('Controls: attachEventListeners');
        
        if (!this.elements) return;
        
        // Кнопка Play
        this.elements.playButton.addEventListener('click', () => {
            console.log('Controls: Play button clicked');
            this.onPlay();
        });
        
        // Кнопка Pause
        this.elements.pauseButton.addEventListener('click', () => {
            console.log('Controls: Pause button clicked');
            this.onPause();
        });
        
        // Кнопка Step
        this.elements.stepButton.addEventListener('click', () => {
            console.log('Controls: Step button clicked');
            this.onStep();
        });
        
        // Кнопка Reset
        this.elements.resetButton.addEventListener('click', () => {
            console.log('Controls: Reset button clicked');
            this.onReset();
        });
        
        // Выбор алгоритма
        this.elements.algorithmSelect.addEventListener('change', (event) => {
            this.selectedAlgorithm = event.target.value;
            console.log('Controls: Algorithm changed to', this.selectedAlgorithm);
            this.onAlgorithmChange(this.selectedAlgorithm);
        });
        
        // Слайдер скорости
        this.elements.speedSlider.addEventListener('input', (event) => {
            this.speed = parseInt(event.target.value, 10);
            if (this.elements.speedValue) {
                this.elements.speedValue.textContent = this.speed.toString();
            }
            console.log('Controls: Speed changed to', this.speed);
            this.onSpeedChange(this.speed);
        });
        
        // Обработка мыши на canvas
        if (this.elements.canvas) {
            this.elements.canvas.addEventListener('mousedown', (event) => {
                console.log('Controls: Canvas mousedown');
                this.onCanvasMouseDown(event);
            });
            
            this.elements.canvas.addEventListener('mousemove', (event) => {
                console.log('Controls: Canvas mousemove');
                this.onCanvasMouseMove(event);
            });
            
            this.elements.canvas.addEventListener('mouseup', () => {
                console.log('Controls: Canvas mouseup');
                this.onCanvasMouseUp();
            });
        }
    }

    /**
     * Обработчик нажатия кнопки Play.
     */
    onPlay() {
        console.log('Controls: onPlay called');
    }

    /**
     * Обработчик нажатия кнопки Pause.
     */
    onPause() {
        console.log('Controls: onPause called');
    }

    /**
     * Обработчик нажатия кнопки Step.
     */
    onStep() {
        console.log('Controls: onStep called');
    }

    /**
     * Обработчик нажатия кнопки Reset.
     */
    onReset() {
        console.log('Controls: onReset called');
    }

    /**
     * Обработчик изменения алгоритма.
     * @param {string} algorithm - Название алгоритма.
     */
    onAlgorithmChange(algorithm) {
        console.log('Controls: onAlgorithmChange', algorithm);
    }

    /**
     * Обработчик изменения скорости.
     * @param {number} speed - Значение скорости.
     */
    onSpeedChange(speed) {
        console.log('Controls: onSpeedChange', speed);
    }

    /**
     * Обработчик нажатия мыши на canvas.
     * @param {MouseEvent} event - Событие мыши.
     */
    onCanvasMouseDown(event) {
        console.log('Controls: onCanvasMouseDown', event);
    }

    /**
     * Обработчик движения мыши по canvas.
     * @param {MouseEvent} event - Событие мыши.
     */
    onCanvasMouseMove(event) {
        console.log('Controls: onCanvasMouseMove', event);
    }

    /**
     * Обработчик отпускания мыши.
     */
    onCanvasMouseUp() {
        console.log('Controls: onCanvasMouseUp');
    }

    /**
     * Устанавливает состояние кнопок.
     * @param {boolean} isRunning - Выполняется ли алгоритм.
     */
    setButtonsState(isRunning) {
        console.log('Controls: setButtonsState', isRunning);
    }

    /**
     * Получает текущую скорость.
     * @returns {number} Текущая скорость.
     */
    getSpeed() {
        return this.speed;
    }

    /**
     * Получает выбранный алгоритм.
     * @returns {string} Название алгоритма.
     */
    getAlgorithm() {
        return this.selectedAlgorithm;
    }
}

export default Controls;

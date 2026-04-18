/**
 * @fileoverview Управление элементами интерфейса.
 * Обрабатывает события кнопок, выбора алгоритма и слайдера скорости.
 */

import { Grid } from '../core/grid.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { StepController } from './step-controller.js';
import { saveToJSON, importFromString, createExportBlob } from '../io/storage.js';

/**
 * Класс для управления элементами UI.
 */
export class Controls {
    /**
     * Создает контроллер управления.
     * @param {Grid} grid - Экземпляр сетки.
     * @param {CanvasRenderer} renderer - Экземпляр рендерера.
     * @param {StepController} [stepController] - Контроллер выполнения алгоритма.
     */
    constructor(grid, renderer, stepController = null) {
        /** @type {Grid} */
        this.grid = grid;
        
        /** @type {CanvasRenderer} */
        this.renderer = renderer;
        
        /** @type {StepController|null} */
        this.stepController = stepController;
        
        /** @type {number} - Текущая скорость анимации */
        this.speed = 50;
        
        /** @type {string} - Выбранный алгоритм */
        this.selectedAlgorithm = 'bfs';
        
        /** @type {Object|null} - Ссылки на DOM элементы */
        this.elements = null;
        
        /** @type {HTMLElement|null} - Контейнер для toast уведомлений */
        this.toastContainer = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupKeyboardShortcuts();
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
            canvas: document.getElementById('grid'),
            exportButton: document.getElementById('btn-export'),
            importButton: document.getElementById('btn-import'),
            importFileInput: document.getElementById('import-file-input')
        };
        
        // Создаем контейнер для toast уведомлений если нет
        this.toastContainer = document.getElementById('toast-container');
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
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
        
        // Кнопка Экспорт
        if (this.elements.exportButton) {
            this.elements.exportButton.addEventListener('click', () => {
                console.log('Controls: Export button clicked');
                this.onExport();
            });
        }
        
        // Кнопка Импорт
        if (this.elements.importButton) {
            this.elements.importButton.addEventListener('click', () => {
                console.log('Controls: Import button clicked');
                if (this.elements.importFileInput) {
                    this.elements.importFileInput.click();
                }
            });
        }
        
        // Input для импорта файла
        if (this.elements.importFileInput) {
            this.elements.importFileInput.addEventListener('change', (event) => {
                console.log('Controls: File input changed');
                this.onImportFile(event);
            });
        }
        
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
     * Настраивает горячие клавиши.
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Игнорируем если фокус в input/select/textarea
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'select' || tag === 'textarea') {
                return;
            }
            
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    // Play/Pause toggle
                    if (this.stepController && this.stepController.isRunning()) {
                        this.onPause();
                    } else {
                        this.onPlay();
                    }
                    break;
                    
                case 'KeyR':
                    event.preventDefault();
                    this.onReset();
                    break;
                    
                case 'Digit1':
                case 'Numpad1':
                    event.preventDefault();
                    this.selectAlgorithm('bfs');
                    break;
                    
                case 'Digit2':
                case 'Numpad2':
                    event.preventDefault();
                    this.selectAlgorithm('dfs');
                    break;
                    
                case 'Digit3':
                case 'Numpad3':
                    event.preventDefault();
                    this.selectAlgorithm('dijkstra');
                    break;
                    
                case 'Digit4':
                case 'Numpad4':
                    event.preventDefault();
                    this.selectAlgorithm('astar');
                    break;
            }
        });
    }

    /**
     * Выбирает алгоритм программно.
     * @param {string} algorithm - Название алгоритма.
     */
    selectAlgorithm(algorithm) {
        if (this.elements.algorithmSelect) {
            this.elements.algorithmSelect.value = algorithm;
            this.selectedAlgorithm = algorithm;
            this.onAlgorithmChange(algorithm);
            this.showToast(`Алгоритм: ${this.getAlgorithmDisplayName(algorithm)}`, 'info');
        }
    }

    /**
     * Получает отображаемое имя алгоритма.
     * @param {string} algorithm - Название алгоритма.
     * @returns {string} Отображаемое имя.
     */
    getAlgorithmDisplayName(algorithm) {
        const names = {
            'bfs': 'BFS (Поиск в ширину)',
            'dfs': 'DFS (Поиск в глубину)',
            'dijkstra': 'Dijkstra',
            'astar': 'A*'
        };
        return names[algorithm] || algorithm;
    }

    /**
     * Обработчик нажатия кнопки Play.
     */
    onPlay() {
        console.log('Controls: onPlay called');
        
        // Вызываем callback если есть
        if (this.onPlayCallback) {
            this.onPlayCallback();
        }
    }

    /**
     * Обработчик нажатия кнопки Pause.
     */
    onPause() {
        console.log('Controls: onPause called');
        
        if (this.stepController) {
            this.stepController.pause();
        }
        
        // Вызываем callback если есть
        if (this.onPauseCallback) {
            this.onPauseCallback();
        }
    }

    /**
     * Обработчик нажатия кнопки Step.
     */
    onStep() {
        console.log('Controls: onStep called');
        
        // Вызываем callback если есть
        if (this.onStepCallback) {
            this.onStepCallback();
        }
    }

    /**
     * Обработчик нажатия кнопки Reset.
     */
    onReset() {
        console.log('Controls: onReset called');
        
        // Вызываем callback если есть
        if (this.onResetCallback) {
            this.onResetCallback();
        }
    }

    /**
     * Обработчик нажатия кнопки Экспорт.
     */
    onExport() {
        console.log('Controls: onExport called');
        
        try {
            const data = saveToJSON(this.grid);
            const blobUrl = createExportBlob(data);
            
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'algogrid-grid.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Освобождаем URL
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            
            this.showToast('Сетка экспортирована успешно!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Ошибка экспорта: ' + error.message, 'error');
        }
    }

    /**
     * Обработчик импорта файла.
     * @param {Event} event - Событие изменения input.
     */
    onImportFile(event) {
        console.log('Controls: onImportFile called');
        
        const file = event.target?.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target?.result;
                if (typeof jsonString !== 'string') {
                    throw new Error('Invalid file content');
                }
                
                const data = importFromString(jsonString);
                if (!data) {
                    throw new Error('Invalid JSON format');
                }
                
                // Импортируем в grid через callback
                if (this.onImportCallback) {
                    const success = this.onImportCallback(data);
                    if (success) {
                        this.showToast('Сетка импортирована успешно!', 'success');
                    } else {
                        this.showToast('Ошибка импорта: несовместимый формат', 'error');
                    }
                }
            } catch (error) {
                console.error('Import failed:', error);
                this.showToast('Ошибка импорта: ' + error.message, 'error');
            }
        };
        
        reader.onerror = () => {
            this.showToast('Ошибка чтения файла', 'error');
        };
        
        reader.readAsText(file);
        
        // Очищаем input для возможности повторного выбора того же файла
        if (event.target) {
            event.target.value = '';
        }
    }

    /**
     * Показывает toast уведомление.
     * @param {string} message - Сообщение.
     * @param {'success'|'error'|'info'|'warning'} type - Тип уведомления.
     */
    showToast(message, type = 'info') {
        if (!this.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        // Анимация появления
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Устанавливает callback для кнопки Play.
     * @param {Function} callback - Функция обратного вызова.
     */
    setOnPlay(callback) {
        this.onPlayCallback = callback;
    }

    /**
     * Устанавливает callback для кнопки Pause.
     * @param {Function} callback - Функция обратного вызова.
     */
    setOnPause(callback) {
        this.onPauseCallback = callback;
    }

    /**
     * Устанавливает callback для кнопки Step.
     * @param {Function} callback - Функция обратного вызова.
     */
    setOnStep(callback) {
        this.onStepCallback = callback;
    }

    /**
     * Устанавливает callback для кнопки Reset.
     * @param {Function} callback - Функция обратного вызова.
     */
    setOnReset(callback) {
        this.onResetCallback = callback;
    }

    /**
     * Устанавливает callback для импорта.
     * @param {Function} callback - Функция обратного вызова, принимающая данные и возвращающая boolean.
     */
    setOnImport(callback) {
        this.onImportCallback = callback;
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
        
        // Обновляем скорость в StepController если есть
        if (this.stepController) {
            this.stepController.setSpeed(speed);
        }
    }

    /**
     * Устанавливает StepController.
     * @param {StepController} stepController - Контроллер выполнения.
     */
    setStepController(stepController) {
        this.stepController = stepController;
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

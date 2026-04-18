/**
 * @fileoverview Контроллер управления выполнением алгоритмов поиска пути.
 * Управляет запуском, паузой, шагом и сбросом выполнения алгоритма через generator.
 */

/**
 * Класс для управления пошаговым выполнением алгоритмов.
 */
export class StepController extends EventTarget {
    /**
     * Создает контроллер.
     */
    constructor() {
        super();

        /** @type {Generator|null} - Текущий генератор алгоритма */
        this.generator = null;

        /** @type {number|null} - ID таймера setInterval */
        this.timerId = null;

        /** @type {boolean} - Статус выполнения (запущен/не запущен) */
        this.running = false;

        /** @type {boolean} - Статус паузы */
        this.paused = false;

        /** @type {number} - Скорость выполнения в мс (10-1000) */
        this.speed = 50;

        /** @type {number} - Количество посещенных узлов */
        this.visitedCount = 0;

        /** @type {Date|null} - Время начала выполнения */
        this.startTime = null;

        /** @type {number} - Общее время выполнения в мс */
        this.totalTime = 0;
    }

    /**
     * Запускает выполнение алгоритма.
     * @param {Function} algorithmGenerator - Функция-генератор алгоритма.
     */
    start(algorithmGenerator) {
        console.log('StepController: start called');

        // Если уже запущен - игнорируем двойной start
        if (this.running && !this.paused) {
            console.warn('StepController: Already running, ignoring duplicate start');
            return;
        }

        // Если на паузе - возобновляем
        if (this.paused) {
            console.log('StepController: Resuming from pause');
            this.paused = false;
            this.running = true;
            this._startTimer();
            return;
        }

        // Новый запуск
        console.log('StepController: Starting new algorithm');
        this.generator = algorithmGenerator();
        this.running = true;
        this.paused = false;
        this.visitedCount = 0;
        this.startTime = Date.now();
        this.totalTime = 0;

        this._startTimer();
    }

    /**
     * Выполняет один шаг алгоритма.
     * @returns {IteratorResult|undefined} Результат шага или undefined если генератор не активен.
     */
    step() {
        console.log('StepController: step called');

        if (!this.generator) {
            console.warn('StepController: No generator to step');
            return undefined;
        }

        try {
            const result = this.generator.next();

            if (result.done) {
                console.log('StepController: Generator completed');
                this._stop();
                return result;
            }

            const action = result.value;
            console.log('StepController: Processing action', action);

            if (action.type === 'visit') {
                // Обновляем счетчик посещений
                this.visitedCount++;

                // Вычисляем текущее время
                if (this.startTime) {
                    this.totalTime = Date.now() - this.startTime;
                }

                // Отправляем событие шага
                this.dispatchEvent(new CustomEvent('algo:step', {
                    detail: {
                        x: action.x,
                        y: action.y,
                        queueSize: action.queueSize,
                        visitedCount: this.visitedCount,
                        time: this.totalTime
                    }
                }));
            } else if (action.type === 'complete') {
                // Завершение успешно
                console.log('StepController: Algorithm completed successfully');
                this._stop();

                if (this.startTime) {
                    this.totalTime = Date.now() - this.startTime;
                }

                this.dispatchEvent(new CustomEvent('algo:complete', {
                    detail: {
                        path: action.path || [],
                        visitedCount: this.visitedCount,
                        time: this.totalTime
                    }
                }));
            } else if (action.type === 'error') {
                // Ошибка
                console.error('StepController: Algorithm error', action.message);
                this._stop();

                this.dispatchEvent(new CustomEvent('algo:error', {
                    detail: {
                        message: action.message || 'Unknown error'
                    }
                }));
            }

            return result;
        } catch (error) {
            console.error('StepController: Error during step', error);
            this._stop();
            this.dispatchEvent(new CustomEvent('algo:error', {
                detail: {
                    message: error.message || 'Step execution error'
                }
            }));
            return undefined;
        }
    }

    /**
     * Ставит выполнение на паузу.
     */
    pause() {
        console.log('StepController: pause called');

        if (!this.running || this.paused) {
            console.warn('StepController: Not running or already paused');
            return;
        }

        this.paused = true;
        this.running = false;
        this._clearTimer();
    }

    /**
     * Сбрасывает состояние контроллера.
     */
    reset() {
        console.log('StepController: reset called');

        this._clearTimer();
        this.generator = null;
        this.running = false;
        this.paused = false;
        this.visitedCount = 0;
        this.startTime = null;
        this.totalTime = 0;
    }

    /**
     * Устанавливает скорость выполнения.
     * @param {number} ms - Интервал в миллисекундах (10-1000).
     */
    setSpeed(ms) {
        console.log('StepController: setSpeed called', ms);

        // Ограничиваем диапазон 10-1000
        this.speed = Math.max(10, Math.min(1000, ms));
        console.log('StepController: Speed set to', this.speed);

        // Если сейчас работает, перезапускаем таймер с новой скоростью
        if (this.running && !this.paused) {
            this._clearTimer();
            this._startTimer();
        }
    }

    /**
     * Проверяет, запущен ли алгоритм.
     * @returns {boolean} true если алгоритм выполняется.
     */
    isRunning() {
        return this.running && !this.paused;
    }

    /**
     * Получает текущую скорость.
     * @returns {number} Скорость в мс.
     */
    getSpeed() {
        return this.speed;
    }

    /**
     * Получает количество посещенных узлов.
     * @returns {number} Количество посещенных узлов.
     */
    getVisitedCount() {
        return this.visitedCount;
    }

    /**
     * Получает общее время выполнения.
     * @returns {number} Время в мс.
     */
    getTotalTime() {
        return this.totalTime;
    }

    /**
     * Запускает таймер для автоматического выполнения шагов.
     * @private
     */
    _startTimer() {
        console.log('StepController: Starting timer with speed', this.speed);
        this.timerId = setInterval(() => {
            this.step();
        }, this.speed);
    }

    /**
     * Очищает таймер.
     * @private
     */
    _clearTimer() {
        if (this.timerId !== null) {
            console.log('StepController: Clearing timer');
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    /**
     * Останавливает выполнение (без установки паузы).
     * @private
     */
    _stop() {
        console.log('StepController: Stopping');
        this._clearTimer();
        this.running = false;
        this.paused = false;
    }
}

export default StepController;

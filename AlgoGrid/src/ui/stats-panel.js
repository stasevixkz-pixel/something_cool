/**
 * @fileoverview Панель статистики.
 * Отображает информацию о выполнении алгоритма: посещенные узлы, длина пути, время, статус.
 */

/**
 * Класс для управления панелью статистики.
 */
export class StatsPanel {
    /**
     * Создает панель статистики.
     */
    constructor() {
        /** @type {Object|null} - Ссылки на DOM элементы */
        this.elements = null;
        
        /** @type {number} - Количество посещенных узлов */
        this.visitedCount = 0;
        
        /** @type {number} - Длина найденного пути */
        this.pathLength = 0;
        
        /** @type {number} - Время выполнения в миллисекундах */
        this.executionTime = 0;
        
        /** @type {string} - Текущий статус */
        this.status = 'idle';
        
        this.initializeElements();
    }

    /**
     * Инициализирует ссылки на DOM элементы.
     */
    initializeElements() {
        console.log('StatsPanel: initializeElements');
        this.elements = {
            visited: document.getElementById('stat-visited'),
            pathLength: document.getElementById('stat-path-length'),
            time: document.getElementById('stat-time'),
            status: document.getElementById('stat-status')
        };
    }

    /**
     * Обновляет количество посещенных узлов.
     * @param {number} count - Количество посещенных узлов.
     */
    setVisitedCount(count) {
        console.log('StatsPanel: setVisitedCount', count);
        this.visitedCount = count;
        if (this.elements && this.elements.visited) {
            this.elements.visited.textContent = count.toString();
        }
    }

    /**
     * Увеличивает счетчик посещенных узлов на 1.
     */
    incrementVisitedCount() {
        console.log('StatsPanel: incrementVisitedCount');
        this.visitedCount++;
        if (this.elements && this.elements.visited) {
            this.elements.visited.textContent = this.visitedCount.toString();
        }
    }

    /**
     * Обновляет длину пути.
     * @param {number} length - Длина пути.
     */
    setPathLength(length) {
        console.log('StatsPanel: setPathLength', length);
        this.pathLength = length;
        if (this.elements && this.elements.pathLength) {
            this.elements.pathLength.textContent = length.toString();
        }
    }

    /**
     * Обновляет время выполнения.
     * @param {number} timeMs - Время в миллисекундах.
     */
    setExecutionTime(timeMs) {
        console.log('StatsPanel: setExecutionTime', timeMs);
        this.executionTime = timeMs;
        if (this.elements && this.elements.time) {
            this.elements.time.textContent = `${timeMs} ms`;
        }
    }

    /**
     * Обновляет статус выполнения.
     * @param {string} status - Строка статуса ('idle', 'running', 'paused', 'completed', 'error').
     */
    setStatus(status) {
        console.log('StatsPanel: setStatus', status);
        this.status = status;
        
        if (this.elements && this.elements.status) {
            // Удаляем все классы статусов
            this.elements.status.classList.remove(
                'status-idle',
                'status-running',
                'status-paused',
                'status-completed',
                'status-error'
            );
            
            // Добавляем новый класс статуса
            this.elements.status.classList.add(`status-${status}`);
            
            // Обновляем текст
            const statusTexts = {
                idle: 'Ожидание',
                running: 'Выполнение',
                paused: 'Пауза',
                completed: 'Завершено',
                error: 'Ошибка'
            };
            
            this.elements.status.textContent = statusTexts[status] || status;
        }
    }

    /**
     * Сбрасывает всю статистику.
     */
    reset() {
        console.log('StatsPanel: reset');
        this.visitedCount = 0;
        this.pathLength = 0;
        this.executionTime = 0;
        this.setStatus('idle');
        
        if (this.elements) {
            if (this.elements.visited) this.elements.visited.textContent = '0';
            if (this.elements.pathLength) this.elements.pathLength.textContent = '0';
            if (this.elements.time) this.elements.time.textContent = '0 ms';
        }
    }

    /**
     * Получает текущее количество посещенных узлов.
     * @returns {number} Количество посещенных узлов.
     */
    getVisitedCount() {
        return this.visitedCount;
    }

    /**
     * Получает текущую длину пути.
     * @returns {number} Длина пути.
     */
    getPathLength() {
        return this.pathLength;
    }

    /**
     * Получает время выполнения.
     * @returns {number} Время выполнения в мс.
     */
    getExecutionTime() {
        return this.executionTime;
    }

    /**
     * Получает текущий статус.
     * @returns {string} Текущий статус.
     */
    getStatus() {
        return this.status;
    }
}

export default StatsPanel;

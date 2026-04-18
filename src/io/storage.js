/**
 * @fileoverview Модуль для сохранения и загрузки состояния сетки.
 * Использует localStorage для автосохранения и поддерживает экспорт/импорт JSON файлов.
 */

const STORAGE_KEY = 'algogrid_v1';

/**
 * Сохраняет состояние сетки в объект JSON.
 * @param {import('../core/grid.js').Grid} grid - Экземпляр сетки.
 * @returns {{cols: number, rows: number, walls: Array<{x: number, y: number}>, start: {x: number, y: number}|null, end: {x: number, y: number}|null}} Объект для сериализации.
 */
export function saveToJSON(grid) {
    if (!grid) {
        throw new Error('Grid is required for saveToJSON');
    }

    const walls = [];
    
    // Собираем все стены
    for (let y = 0; y < grid.rows; y++) {
        for (let x = 0; x < grid.cols; x++) {
            const cell = grid.cells[y][x];
            if (cell.type === 'wall') {
                walls.push({ x, y });
            }
        }
    }

    // Получаем координаты start и end
    const start = grid.startCell ? { x: grid.startCell.x, y: grid.startCell.y } : null;
    const end = grid.endCell ? { x: grid.endCell.x, y: grid.endCell.y } : null;

    return {
        cols: grid.cols,
        rows: grid.rows,
        walls,
        start,
        end
    };
}

/**
 * Загружает состояние сетки из объекта JSON.
 * @param {import('../core/grid.js').Grid} grid - Экземпляр сетки для обновления.
 * @param {{cols: number, rows: number, walls: Array<{x: number, y: number}>, start: {x: number, y: number}|null, end: {x: number, y: number}|null}} obj - Объект с данными.
 * @returns {boolean} true если загрузка успешна, false в случае ошибки валидации.
 */
export function loadFromJSON(grid, obj) {
    if (!grid || !obj) {
        return false;
    }

    // Валидация структуры объекта
    if (typeof obj.cols !== 'number' || typeof obj.rows !== 'number') {
        console.error('Invalid grid dimensions');
        return false;
    }

    if (!Array.isArray(obj.walls)) {
        console.error('Walls must be an array');
        return false;
    }

    // Проверяем, что размеры совпадают с текущей сеткой
    if (obj.cols !== grid.cols || obj.rows !== grid.rows) {
        console.error('Grid dimensions mismatch');
        return false;
    }

    // Очищаем сетку перед загрузкой (сохраняем размеры)
    grid.clear();

    // Восстанавливаем стены
    for (const wall of obj.walls) {
        if (typeof wall.x === 'number' && typeof wall.y === 'number') {
            if (grid.isValidCell(wall.x, wall.y)) {
                grid.setWall(wall.x, wall.y);
            }
        }
    }

    // Восстанавливаем start
    if (obj.start && typeof obj.start.x === 'number' && typeof obj.start.y === 'number') {
        if (grid.isValidCell(obj.start.x, obj.start.y)) {
            grid.setStart(obj.start.x, obj.start.y);
        }
    }

    // Восстанавливаем end
    if (obj.end && typeof obj.end.x === 'number' && typeof obj.end.y === 'number') {
        if (grid.isValidCell(obj.end.x, obj.end.y)) {
            grid.setEnd(obj.end.x, obj.end.y);
        }
    }

    return true;
}

/**
 * Автосохранение состояния сетки в localStorage.
 * @param {import('../core/grid.js').Grid} grid - Экземпляр сетки.
 */
export function autoSave(grid) {
    try {
        const data = saveToJSON(grid);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

/**
 * Автозагрузка состояния сетки из localStorage.
 * @param {import('../core/grid.js').Grid} grid - Экземпляр сетки.
 * @returns {boolean} true если загрузка успешна, false если данных нет или ошибка.
 */
export function autoLoad(grid) {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return false;
        }

        const data = JSON.parse(stored);
        return loadFromJSON(grid, data);
    } catch (error) {
        console.error('Auto-load failed:', error);
        return false;
    }
}

/**
 * Создает Blob URL для скачивания файла.
 * @param {Object} data - Данные для экспорта.
 * @returns {string} Blob URL.
 */
export function createExportBlob(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    return URL.createObjectURL(blob);
}

/**
 * Импортирует данные из JSON строки.
 * @param {string} jsonString - JSON строка.
 * @returns {{cols: number, rows: number, walls: Array<{x: number, y: number}>, start: {x: number, y: number}|null, end: {x: number, y: number}|null}|null} Распарсенные данные или null при ошибке.
 */
export function importFromString(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        // Базовая валидация
        if (!data || typeof data.cols !== 'number' || typeof data.rows !== 'number') {
            return null;
        }
        return data;
    } catch (error) {
        console.error('Import parse error:', error);
        return null;
    }
}

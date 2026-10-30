import {sortMap} from "../lib/sort.js"; // sortCollection больше не нужен

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // запоминаем выбранный режим сортировки
            action.dataset.value = sortMap[action.dataset.value];
            field = action.dataset.field;
            order = action.dataset.value;

            // сбрасываем сортировки остальных колонок
            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            // получаем выбранный режим сортировки
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        const sort = (field && order !== 'none') ? `${field}:${order}` : null; // параметр сортировки в виде field:direction

        return sort ? Object.assign({}, query, { sort }) : query; // если есть сортировка — добавляем, если нет — не трогаем query
    }
}
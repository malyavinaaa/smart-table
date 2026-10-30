import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";


// API приложения — источник данных для таблицы
const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    const rowsPerPage = parseInt(state.rowsPerPage); // приведём количество строк к числу
    const page = parseInt(state.page ?? 1); // номер страницы по умолчанию 1 и тоже число

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    const state = collectState(); // состояние полей из таблицы
    let query = {}; // здесь будут формироваться параметры запроса
    query = applySearching(query, state, action); // добавляем параметр поиска
    query = applyFiltering(query, state, action); // добавляем параметры фильтрации
    query = applySorting(query, state, action); // добавляем параметр сортировки
    query = applyPagination(query, state, action); // добавляем параметры пагинации

    const { total, items } = await api.getRecords(query); // запрос с собранными параметрами

    updatePagination(total, query); // перерисовываем пагинатор по фактическим данным
    sampleTable.render(items)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);

const applySearching = initSearching('search'); // имя поля поиска в state


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

const init = async () => {
    const indexes = await api.getIndexes();

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
};

init().then(render);
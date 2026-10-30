import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();
    let pageCount;

    // формирует параметры запроса: сколько строк и с какой страницы вернуть
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // обработка действий кнопок пагинатора
        if (action) switch(action.name) {
            case 'prev': page = Math.max(1, page - 1); break;
            case 'next': page = Math.min(pageCount, page + 1); break;
            case 'first': page = 1; break;
            case 'last': page = pageCount; break;
        }

        return Object.assign({}, query, { // добавляем параметры к query, не изменяя исходный объект
            limit,
            page
        });
    }

    // перерисовывает пагинатор по количеству строк, пришедшему с сервера
    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);

        // выводим список видимых страниц
        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        // обновляем статус пагинации
        fromRow.textContent = (page - 1) * limit + 1;
        toRow.textContent = Math.min((page * limit), total);
        totalRows.textContent = total;
    }

    return {
        updatePagination,
        applyPagination
    };
}
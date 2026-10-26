import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // #1.2 — дополнительные шаблоны до и после таблицы
    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // #1.3 — обработка событий формы и вызов onAction()
    root.container.addEventListener('change', () => onAction());
    root.container.addEventListener('reset', () => setTimeout(onAction));
    root.container.addEventListener('submit', e => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        // #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);

            Object.keys(item).forEach(key => {
                if (key in row.elements) {
                    row.elements[key].textContent = item[key];
                }
            });

            return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}
# Блок works-with («Works great with»)

Только страницы продуктов (`/crypto-processing`, `/invoicing`, `/ramp`, `/mass-payouts`); в Figma блока нет, собран кодом по дизайн-системе, по просьбе дизайнера (2026-10-27). Компонент: [../../src/components/blocks/WorksWith/](../../src/components/blocks/WorksWith/). Тесты: [../../tests/works-with.spec.ts](../../tests/works-with.spec.ts).
Место: после блоков про продукт (`sections`), перед Industries ([../pages.md](../pages.md)).

## Что в блоке
Малый серый заголовок «Works great with» слева и три плашки с другими продуктами (из четырёх живых продуктов — три остальных; Banking и Wallet «Soon» не берём, у них нет страниц). Плашка целиком — одна ссылка `<a>` на страницу продукта; внутри нет ни ссылок, ни кнопок.
Содержимое плашки: сверху слева иконка продукта 24 px (`text-icon-primary`, те же файлы, что в выпадашке Products, `src/assets/icons/products/`), сверху справа круг со стрелкой ↗ (`ArrowCircle`); снизу название (`heading-md`, от 1280 px `heading-lg`) и одна строка про то, как продукты работают вместе. Название, иконка и адрес берутся из `productMenuItems` (`productMenu.ts`), поэтому продукт называется везде одинаково; на странице продукта в данных страницы (`content.ts`, поле `worksWith`) лежит только порядок продуктов и своя строка для каждой пары.

| Страница | 1 | 2 | 3 |
|---|---|---|---|
| Crypto Processing | Invoicing | Crypto to Cash | Mass Payouts |
| Invoicing | Crypto Processing | Crypto to Cash | Mass Payouts |
| Crypto to Cash | Crypto Processing | Invoicing | Mass Payouts |
| Mass Payouts | Crypto to Cash | Crypto Processing | Invoicing |

Тексты строк — черновик copywriter (`[CONFIRM]` в `content.ts`). Два отличия от присланного примера: название «On- and off-ramp» заменено на **Crypto to Cash** (как в меню и на главной), «from 0.0%» на **from 0.5%** (как в Features).

## Отклик на курсор
Плашка: `interactive-card` (при наведении растёт на 3 %, при нажатии сжимается до 98,5 %) плюс `hover:bg-surface-hover` (серая); круг со стрелкой остаётся белым (`surface-subtle`), в Dark плашка светлеет до `neutral-800`, круг остаётся `neutral-900`. Только на устройствах с hover; под reduced-motion цвет меняется, масштаба нет. Стрелка при наведении на плашку даёт короткий толчок ↗ и возвращается (`interactive-nudge`, вариант B из трёх, выбран дизайнером 2026-10-27; A «один шаг» и C «сквозь круг» отклонены и удалены).

## Раскладка (выведена, в макете нет)
Ниже 768 px плашки столбиком (зазор 16), от 768 px три в ряд (зазор 24); внутри колонки отступы как у соседних блоков (48 / 60 / 80 сверху и снизу), линия колонки по бокам, угловые точки сверху и снизу, граница снизу. Плашка: радиус 40, отступ 24 (от 768 — 32), зазор между верхним рядом и текстом не меньше 48.

## Слои (`data-el`)
`works-with`, `works-with__title`, `works-with__list`, `works-with__card-{product}` и `-icon`, `-arrow`, `-title`, `-desc`; `{product}` — `crypto-processing`, `crypto-to-cash`, `invoicing`, `mass-payouts`. Весь текст — через `RevealLines` (по словам), плашки появляются каскадом `appear.card.step`.

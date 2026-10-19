# UI Kit (дизайн-система проекта)

Живая витрина: **http://localhost:5173/ui-kit** (при запущенном `npm run dev`). Она показывает токены и общие компоненты в текущей теме, переключатель Light/Dark — вверху страницы. Код витрины: [../src/ui-kit/UiKitPage.tsx](../src/ui-kit/UiKitPage.tsx); тесты: [../tests/ui-kit.spec.ts](../tests/ui-kit.spec.ts).

## 1. Принципы
1. **Только токены.** Цвета, шрифты и размеры текста — из [tokens.css](../src/styles/tokens.css) и [typography.css](../src/styles/typography.css); значений «из головы» (`#fff`, `text-[17px]`) в компонентах нет. Соответствие Figma → CSS: [tokens-map.md](tokens-map.md).
2. **Одна сущность — один компонент.** Если элемент встретился во втором блоке, он выносится в `src/components/ui/` и попадает в витрину. До этого он живёт внутри блока.
3. **Имя слоя Figma = `data-el`.** Компоненты UI Kit не знают о блоках: `data-el` передаёт блок снаружи.
4. **Тема.** Все цвета — семантические токены, поэтому Dark работает без правок компонента. Одноцветные SVG из Figma рисуются через `Icon` (маска по `currentColor`).
5. **Доступность.** Кнопка без текста — всегда с `aria-label`; ссылки — `<a>`, действия — `<button>`; видимый фокус (`focus-visible`) есть у всех интерактивных элементов.
6. **Состояния.** В макете нарисован только default; hover/active берутся из токенов Figma (`surface-hover`, `surface-brand-hover`, `surface-brand-active`), фокус — контур цвета `typography-brand`.

## 2. Токены
| Что | Где | В витрине |
|---|---|---|
| Цвета (40 семантических, Light/Dark) | `--color-*` → `bg-surface-page`, `text-typography-primary`, `border-border-subtle`, `text-icon-brand` | раздел Colors |
| Текстовые стили (18) | классы `type-ui-sm`, `type-heading-lg`… | раздел Typography |
| Расстояния | шкала Tailwind, шаг 4 px | раздел Layout |
| Радиус | `rounded-pill` (9999 px) | раздел Layout |
| Колонка и отступы | `Container`, `--gutter` 16 / 32 / 80 px | раздел Layout |
| Брейкпоинты | `tablet:` ≥ 768 px, `desktop:` ≥ 1280 px (`max-desktop:` — ниже 1280) | раздел Layout |

## 3. Компоненты (`src/components/ui/`)
| Компонент | Назначение | Свойства |
|---|---|---|
| `ButtonLink` | кнопка-ссылка «таблетка» (`<a>`) | `variant`: `primary` \| `secondary`; `size`: `md` (44 px, шапка) \| `lg` (56 px, секции); `icon`: `'export'`; остальное как у `<a>` |
| `IconButton` | круглая кнопка 44 px под одну иконку 24 px | как у `<button>`; обязателен `aria-label` |
| `ThemeToggle` | переключатель Light/Dark (солнце/луна) | как у `<button>`, кроме `children`/`onClick` |
| `Icon` | одноцветный SVG из Figma цветом текста | `src`, `width`, `height` (размер SVG из Figma) |
| `Container` | колонка контента ≤ 1440 px с боковым отступом | как у `<div>` |

Служебное: `src/lib/theme.ts` — хук `useTheme` (тема живёт в `data-theme` на `<html>`).

### Откуда что взялось
- **Header** дал: `ButtonLink` (md), `IconButton`, `ThemeToggle`, `Icon`, `Container`, пилюли меню (пока внутри блока).
- **Hero** дал: размер `lg` у кнопки, иконку export 24 px, `Container` с вертикальными отступами секции.

### Пока внутри блоков (вынести, когда повторится)
- Пилюля пункта меню (`Header`): состояния current / default / hover.
- Бургер-иконка `MenuToggleIcon` (нарисована в коде, заменить иконкой Figma).
- Вертикальные отступы секции (Hero 140 px на десктопе; значения других блоков сравним — тогда станет токеном).

## 4. Как добавить компонент
1. Проверить витрину: нет ли похожего.
2. Файл в `src/components/ui/`, только токены, `className` пробрасывается; без бизнес-логики блока.
3. Добавить пример в `UiKitPage.tsx` (все варианты и размеры) и строку в таблицу выше.
4. Новый токен или текстовый стиль — сначала в Figma, затем синк (`figma-to-tokens`). Новый класс `type-*` вносится в список текстовых стилей витрины (Tailwind видит только явно написанные имена классов); тест `ui-kit.spec.ts` падает, если список и `typography.css` разошлись.
5. Прогнать `npm run build`, `npm run lint`, `npx playwright test`.

## 5. Идеи на будущее
- `Button` на `<button>` (для форм, меню), когда понадобится.
- Бейдж, карточка, поле ввода — по мере появления в блоках.
- Storybook вместо самодельной витрины — если компонентов станет много или нужна публикация для дизайнеров.

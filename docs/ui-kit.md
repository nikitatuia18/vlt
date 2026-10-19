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
| Цвета (41 семантический, Light/Dark) | `--color-*` → `bg-surface-page`, `text-typography-primary`, `border-border-subtle`, `text-icon-brand` | раздел Colors |
| Текстовые стили (18) | классы `type-ui-sm`, `type-heading-lg`… | раздел Typography |
| Расстояния | шкала Tailwind, шаг 4 px | раздел Layout |
| Радиус | `rounded-pill` (9999 px), `rounded-32`, `rounded-40`, `rounded-48` (из свойств узлов Figma) | раздел Layout |
| Колонка и отступы | `Container`, `--gutter` 16 / 32 / 80 px | раздел Layout |
| Брейкпоинты | `tablet:` ≥ 768 px, `desktop:` ≥ 1280 px (`max-desktop:` — ниже 1280) | раздел Layout |

## 3. Компоненты (`src/components/ui/`)
| Компонент | Назначение | Свойства |
|---|---|---|
| `ButtonLink` | кнопка-ссылка «таблетка» (`<a>`) | `variant`: `primary` \| `secondary`; `size`: `md` (44 px, шапка) \| `lg` (56 px, секции); `icon`: `'export'`; остальное как у `<a>` |
| `IconButton` | круглая кнопка под одну иконку 24 px | `size`: `md` 44 px (шапка) \| `lg` 48 px; как у `<button>`; обязателен `aria-label` |
| `IconLink` | то же, но ссылка (`<a>`), например стрелка в карточке | `size` как у `IconButton`; как у `<a>`; обязателен `aria-label` |
| `Badge` | маленькая пилюля-метка, например «Coming soon» | `icon`: `'clock'`; как у `<span>` |
| `ThemeToggle` | переключатель Light/Dark (солнце/луна) | как у `<button>`, кроме `children`/`onClick` |
| `Icon` | одноцветный SVG из Figma цветом текста | `src`, `width`, `height` (размер SVG из Figma) |
| `Container` | колонка контента: содержимое до 1440 px, боковой отступ (16 / 32 / 80) снаружи | как у `<div>` |
| `CornerDots` | две точки 5 px на углах блока ровно там, где линии колонки встречают горизонтальную линию | `edge`: `'top'` \| `'bottom'`; `block`: имя блока для `data-el`; родитель должен быть позиционирован; точки лежат поверх соседнего блока (`z-10`), иначе он закрывает их внешнюю половину |
| `ColumnFade` | две вертикальные линии колонки, продолженные за блок и гаснущие в ноль (начинаются у угловых точек) | `edge`: `'bottom'` (вниз) \| `'top'` (вверх); `block`: имя блока для `data-el` (`{block}__deco-column-fade-{top|bottom}-{left|right}`); `length`: длина, px (160); родитель позиционирован |
| `Header` | шапка сайта на все страницы: логотип, меню, переключатель темы, две кнопки; на планшете и телефоне бургер | `navItems` (по умолчанию меню сайта из `navigation.ts`), `currentId`: выбранный пункт (серая заливка, как при наведении), `primaryCta`, `secondaryCta`, `isPinned` (по умолчанию закреплён вверху и прячется при прокрутке вниз) |
| `InteractiveDots` | «живой» фон: точки отталкиваются курсором (<canvas>, прозрачный) | `spacing` 40, `dotSize` 1, `radius` 150, `force` 1, `ease` 0.1 (значения утверждённого прототипа); `className` |

Служебное: `src/lib/theme.ts` — хук `useTheme` (тема живёт в `data-theme` на `<html>`).

### Откуда что взялось
- **Header** теперь сам в UI Kit (`src/components/ui/Header/`): раньше был блоком. Дал: `ButtonLink` (md), `IconButton`, `ThemeToggle`, `Icon`, `Container`, пилюли меню (пока внутри блока).
- **Hero** дал: размер `lg` у кнопки, иконку export 24 px, `InteractiveDots`, радиусы 32 / 48.
- **InteractiveDots** теперь в двух местах: фон Hero и фон карточки Crypto Processing (Features), поэтому он в UI Kit.`n- **Industries** дал: ColumnFade (линии колонки уходят вниз за блок и гаснут), нижние CornerDots и линию под блоком.
- **Features** дал: `Badge`, `IconLink`, `IconButton` размера `lg`, `CornerDots`, радиус 40.

### Пока внутри блоков (вынести, когда повторится)
- Карточки `FeatureCard` / `SoonCard` (`Features`): белая карточка с круглой ссылкой и серая с бейджем.
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

## 6. Интерактивный фон `InteractiveDots` — коротко
**Что это.** Сетка точек (шаг 40 px, точка r = 1), которая отталкивается от курсора и плавно возвращается: фон выглядит живым. Показан в витрине `/ui-kit`, раздел «Interactive background».

**Как взять.**
```tsx
<section className="relative overflow-hidden">
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    <InteractiveDots />
  </div>
  {/* контент поверх, с relative */}
</section>
```
Родитель должен быть `relative` с `overflow-hidden`; холст занимает его целиком.

**Затухание книзу (как в Hero).** Поверх точек кладётся градиент в цвет страницы: сверху прозрачный, снизу сплошной.
```tsx
<div aria-hidden="true" className="pointer-events-none absolute inset-0">
  <InteractiveDots />
  <div className="absolute inset-0 bg-linear-to-b from-surface-page/0 to-surface-page" />
</div>
```
Градиент берёт токен `surface-page`, поэтому работает в обеих темах. Высоту обёртки задавайте по макету секции (в Hero — 79,17 % высоты секции, обёртка выше секции на 4,85 %).

**Как устроен.**
- Цвет точек — токен `surface-dots` (Figma `theme/surface/dots`: Light `neutral/400`, Dark `neutral/600`); фон холста прозрачный, поэтому тема работает сама.
- Курсор отслеживается по всему окну, касания игнорируются; клики холст не перехватывает (`pointer-events-none` на обёртке).
- Физика из прототипа: точка в радиусе 150 отталкивается силой, пропорциональной близости, и возвращается со скоростью 0,1 за кадр.
- Цикл анимации идёт, только пока точки движутся и холст виден; при `prefers-reduced-motion` точки статичны.
- Чёткий на retina (учтён `devicePixelRatio`).

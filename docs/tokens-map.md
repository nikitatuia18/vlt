# Токены: соответствие Figma → CSS

Источник: переменные и текстовые стили файла Figma `tF23PDdcgeTKK5hsmDZIKg`. Код: [../src/styles/tokens.css](../src/styles/tokens.css), [../src/styles/typography.css](../src/styles/typography.css).
Расстояния и радиусы в Figma переменными не заданы — они выведены из макета (раздел 4).

## 1. Как устроены слои
| Слой | CSS | Зачем |
|---|---|---|
| Примитивы (Figma: коллекция «Primitives -- Colors») | `--primitive-brand-500`, `--primitive-neutral-900`… | Сырая палитра. **Без утилит Tailwind** — компоненты ими не пользуются. |
| Семантика (Figma: «Semantic -- Theme», режимы Light/Dark) | `--color-surface-page`… → `bg-surface-page` | Цвета, которые используются в разметке. Light — по умолчанию. |
| Тёмная тема | `:root[data-theme="dark"]` | Переопределяет только токены, у которых Dark отличается от Light. |
| Типографика (Figma: «Primitives -- Typography» + 18 стилей) | `--type-*`, классы `type-*` | Размеры/интерлиньяж/трекинг и готовые стили. |

Переключение темы: атрибут `data-theme="dark"` на `<html>` (`src/lib/theme.ts`, кнопка `ThemeToggle`).
Палитра Tailwind по умолчанию отключена (`--color-*: initial`): существуют только цвета ниже.

## 2. Цвета: имя в Figma → класс
Правило имени: `theme/{группа}/{имя}` → `--color-{группа}-{имя}`; группа `typography` → `typography`, `surface` → `surface`, `icon` → `icon`, `borders & dividers` → `border`. Пробелы → дефисы, регистр нижний.
Использование: `bg-surface-page`, `text-typography-secondary`, `border-border-subtle`, `text-icon-brand`.

| Figma (Light / Dark) | CSS-токен |
|---|---|
| typography/primary: neutral/900 / neutral/0 | `--color-typography-primary` |
| typography/secondary: neutral/900 @64% / neutral/0 @64% | `--color-typography-secondary` |
| typography/tertiary: @34% | `--color-typography-tertiary` |
| typography/inverse: neutral/0 / neutral/950 | `--color-typography-inverse` |
| typography/brand: brand/500 / brand/400 | `--color-typography-brand` |
| typography/Success: green/500 / green/400 | `--color-typography-success` |
| typography/static-w, static-b, «static-w secondary» | `--color-typography-static-w`, `-static-b`, `-static-w-secondary` |
| icon/primary, secondary, brand, static-b | `--color-icon-primary`, `-secondary`, `-brand`, `-static-b` |
| icon/**statiw** | `--color-icon-static-w` (опечатка исправлена) |
| surface/page: neutral/50 / neutral/950 | `--color-surface-page` |
| surface/subtle: neutral/0 / neutral/900 | `--color-surface-subtle` |
| surface/hover: neutral/100 / neutral/800 | `--color-surface-hover` |
| surface/inverse: neutral/900 / neutral/0 | `--color-surface-inverse` |
| surface/brand-default, brand-hover, brand-active: brand/500, 600, 700 | `--color-surface-brand-default`, `-brand-hover`, `-brand-active` |
| surface/brand-light: brand/50 / brand/900 | `--color-surface-brand-light` |
| surface/Success, Success-hover, Success-secondary | `--color-surface-success`, `-success-hover`, `-success-secondary` |
| surface/static-w, static-b | `--color-surface-static-w`, `-static-b` |
| surface/dots: neutral/400 / neutral/600 (создана нами) | `--color-surface-dots` |
| surface/«0 white», «16 white», «0 black», «16 black» | `--color-surface-white-0`, `-white-16`, `-black-0`, `-black-16` |
| surface/«0 **barand**», «16 **barand**» | `--color-surface-brand-0`, `-brand-16` (опечатка исправлена) |
| borders & dividers/subtle, medium, strong, very strong, alpha-0 (neutral/900 @6/12/18/24/0 %; в Dark neutral/0) | `--color-border-subtle`, `-medium`, `-strong`, `-very-strong`, `-alpha-0` |
| borders & dividers/brand, brand-light | `--color-border-brand`, `-brand-light` |

Всего семантических цветов: 42 переменные Figma (из них `theme/surface/dots` создана нами, см. раздел 7) минус служебная `current_theme` (строка режима) = 41; в CSS — 41 токен + `transparent`, `current`.

**Не перенесено (и почему):**
- `theme/icons/text/*` и `Content/primary` — эти переменные приходят в кадры из другой библиотеки, в файле их нет; дублируют `theme/icon/*`. Подключим, если блоку понадобятся.
- `current_theme` — служебная строковая переменная режима, не цвет.

## 3. Типографика
Шрифты: `--font-sans` = Inter, `--font-display` = Manrope. В Figma Manrope назван `font-family-serif`, но это гротеск; в CSS имя `display`, чтобы не путать с засечками.
Шрифты подключены пакетами `@fontsource-variable/inter` и `@fontsource-variable/manrope`.

Примитивы (px → rem при 16px): размеры `50…1000` (12, 14, 16, 18, 20, 24, 32, 40, 64, 72, 80, 96), интерлиньяж `50…1000`, трекинг `none/-50/-100/-150/+50` (0, −1, −1.5, −2.5, +1 px), веса `regular/medium/semibold`.

Текстовые стили: имя Figma `группа/размер` → класс `type-группа-размер`:
`type-display-2xl|xl|lg|sm`, `type-heading-xl|lg|md|sm`, `type-body-lead|lead-medium|lg|md|sm`, `type-ui-lg|md|sm|xs|caps` (всего 18, `ui-caps` — верхний регистр).
Замечание: стиль `display/2xl` в Figma имеет трекинг −1.5 px, а переменная `letter-spacing/-150` (−2.5 px) ни одним стилем не используется — взято значение стиля.

## 4. Выведенные токены (в Figma переменных нет)
| Что | Значение | Откуда |
|---|---|---|
| Расстояния | шкала Tailwind, шаг 4 px (`p-3` = 12 px, `gap-15` = 60 px) | все значения макета кратны 4 (10, 12, 16, 24, 60, 160); отдельные токены не нужны |
| Радиус | `rounded-pill` = 9999 px, `rounded-32` = 32 px, `rounded-40` = 40 px, `rounded-48` = 48 px, `rounded-60` = 60 px (исключение, см. раздел 7) | из свойств узлов Figma (переменных радиуса нет): кнопки и пункты меню; `hero__dash`; карточки `features`; `hero__media`. Палитра радиусов Tailwind по умолчанию отключена |
| Колонка контента | `--container-page` = 90rem (1440 px); `Container`: содержимое до 1440 px, боковой отступ снаружи | десктопный кадр: колонка 1440 внутри отступа 160 при ширине 2560 |
| Боковой отступ | `px-(--gutter)`: 1rem / 2rem (от 768) / 5rem (от 1280) | вывод: в кадре 160 px при ширине 2560 и колонке 1440, на реальных экранах колонка центрируется |
| Брейкпоинты | `tablet` = 48rem (768), `desktop` = 80rem (1280) | `docs/responsive.md` |

## 5. Проблемы в именах переменных Figma (в Figma не исправлялись)
| Проблема | Где | Как обошли в CSS |
|---|---|---|
| Опечатки | `theme/icon/statiw`, `theme/surface/0 barand`, `16 barand` | исправлено в CSS (`static-w`, `brand-0`, `brand-16`) |
| Пробелы и `&` в имени | `borders & dividers`, `0 white`, `16 black`… | нормализовано |
| Разный регистр | `Success`, `Success-hover` | нижний регистр |
| «serif» для гротеска | `font-family-serif` = Manrope | `--font-display` |
| Две ветки одного смысла | `theme/icon/*` и `theme/icons/text/*` (вторая — из внешней библиотеки) | вторая не перенесена |
Исправить имена в самом Figma можно по желанию — это не ломает привязки; тогда карта обновится.

## 6. Пересинхронизация
Токены читаются **всем набором**, а не только использованными в кадре: `get_variable_defs` возвращает лишь переменные, привязанные к узлу, и пропускает режимы. Полный список — через `use_figma` (чтение): `figma.variables.getLocalVariableCollectionsAsync()`, `getLocalVariablesAsync()`, `getLocalTextStylesAsync()`. Значения Dark и алиасы с прозрачностью (`color` + `opacity`) разворачиваются в `color-mix(...)`.

## 7. Не из Figma
**Исключения (2):** радиус баннера cta --radius-60: 3.75rem (класс ounded-60) в 	okens.css с пометкой EXCEPTION. В макете у баннера радиус 60 px (свойство узла, переменной радиуса нет); ближайшие токены 48 и 40 заметно меньше, а баннер крупный. Предложение: завести переменную радиуса 60 в Figma (по согласованию с дизайнером), тогда исключение снимается. На экранах уже 1280 px у баннера ounded-40 (выведено).

**Исключение (2): цвета свечения.** Тёмные сцены блока Industries (`data-theme="dark"` на секции, свечение за открытой карточкой): `surface-glow-violet / pink / orange / blue / green` в `tokens.css`. Переменных в Figma для них нет. Розовый `#ea2e95` — цвет слоя `Ellipse 215` макета (свойство узла, не переменная); фиолетовый `#7c3aed` и синий `#2563eb` подобраны разработчиком (примитивы `pink/violet/blue-500` с пометкой EXCEPTION); оранжевый — `brand/400`, зелёный — `green/500`. Предложение: завести переменные `theme/surface/glow-*` в Figma (по согласованию с дизайнером), тогда исключение снимается. Стеклянная карточка использует существующий токен `surface/16-white` (в Figma так и сделано).

Создано нами в Figma (с согласия пользователя):
| Переменная | Значения | Зачем |
|---|---|---|
| `theme/surface/dots` (Semantic -- Theme, область: заливки) | Light → `neutral/400` (#a3a3a3), Dark → `neutral/600` (#525252) | цвет точек интерактивного фона Hero: заметны, но не громче контента. В прототипе был `#8f8f8f`; ближайший токен по значению — `neutral/400` |

Правило для будущих случаев: если пользователь даёт значение без токена и есть близкий токен — выбираю его сам и сообщаю одной строкой. Если подходящего нет — в `tokens.css` одна переменная с пометкой «EXCEPTION», строка в этом разделе и предложение завести переменную в Figma.

**Исключение (3): моношрифт.** `--font-mono` (JetBrains Mono Variable) и текстовый стиль `type-code-sm` (14/24) в `tokens.css` / `typography.css` для окна с кодом блока Global. В Figma такого шрифта и стиля нет. Предложение: завести `font-family-mono` и стиль `code/sm` в Figma, тогда исключение снимается.

**Радиусы 16 и 24 (2026-10-26, производные, не из Figma):** `--radius-16` (1rem) и `--radius-24` (1,5rem) в `tokens.css` для мелких карточек и панелей внутри сцен страниц продуктов (карточка получателя, полоса, таблица, drop-зона): радиус 32 слишком круглый для карточек с двумя строками текста. Внешние карточки сцен остаются 32 / 48. Предложение: завести эти радиусы в Figma.

**Тень «поднятой карточки» (2026-10-26, производная, не из Figma):** `--shadow-lifted` в `tokens.css` (на цвете `surface-black-16`, сама меняется с темой): карточка получателя в блоке маршрутов Mass Payouts, пока её держат (белый фон `surface-subtle` + тень + увеличение 1,04). Предложение: завести эффект «Lifted» в Figma и в UI Kit.

**Тень выпадающей панели (2026-10-27, производная, не из Figma):** `--shadow-menu` (один широкий слабый слой на `surface-black-16`): выпадашка Products в хедере; мягче `--shadow-lifted`.

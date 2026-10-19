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
| surface/«0 white», «16 white», «0 black», «16 black» | `--color-surface-white-0`, `-white-16`, `-black-0`, `-black-16` |
| surface/«0 **barand**», «16 **barand**» | `--color-surface-brand-0`, `-brand-16` (опечатка исправлена) |
| borders & dividers/subtle, medium, strong, very strong, alpha-0 (neutral/900 @6/12/18/24/0 %; в Dark neutral/0) | `--color-border-subtle`, `-medium`, `-strong`, `-very-strong`, `-alpha-0` |
| borders & dividers/brand, brand-light | `--color-border-brand`, `-brand-light` |

Всего семантических цветов: 41 переменная Figma минус служебная `current_theme` (строка режима) = 40; в CSS — 40 токенов + `transparent`, `current`.

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
| Радиус | `rounded-pill` = 9999 px | в макете (Header) только «таблетки»; остальные радиусы добавим вместе с блоками |
| Колонка контента | `max-w-page` = 90rem (1440 px) | десктопный кадр, `header__container` |
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

---
name: figma-to-tokens
description: Перенос Figma variables и text styles в CSS-переменные и Tailwind v4 @theme (src/styles/tokens.css, typography.css). Использовать на этапе 2 и при пересинхронизации.
---
# Figma → токены

## Вход
`get_variable_defs` (variables, режимы) и текстовые стили из `get_design_context`.

## Правила маппинга
- Имя Figma `color/brand/primary` → `--color-brand-primary`. Слэши → дефисы, нижний регистр, без пробелов. Группы Figma = префиксы Tailwind v4: `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--text-*`, `--leading-*`, `--tracking-*`, `--font-weight-*`.
- Токены кладём в `@theme { … }` в `src/styles/tokens.css`, чтобы Tailwind сгенерировал утилиты (`bg-brand-primary`).
- Режимы (light/dark и т.п.): базовый режим — в `@theme`, остальные — переопределение тех же переменных в `[data-theme="dark"] { … }`.
- Алиасы/ссылки на другие переменные сохраняем ссылками: `--color-button-bg: var(--color-brand-primary)`.
- Текстовые стили → классы в `typography.css` (`.text-heading-1 { font-family; font-size; line-height; letter-spacing; font-weight }`) на токенах размера/шрифта; имя класса = имя стиля Figma в kebab-case.
- Запрещены значения «из головы»: если значение не нашлось в variables — сообщи, не придумывай.

## Проверка
Число записанных токенов = число variables в Figma; перечисли пропущенные и причину. Пересинхронизация меняет только изменившиеся строки.

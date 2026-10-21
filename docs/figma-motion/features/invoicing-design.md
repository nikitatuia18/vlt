# features__invoicing-illustration (1110:8815) — статика

Источник: get_design_context, 2026-10-21. Корень: relative, size-full (размер задаёт родитель).

## features__invoicing-doc (1110:8816) — документ
- Позиция: по центру корня (left 50%, top calc(50% + 0.5px), translate -50% -50%).
- Ширина 246px, высота по контенту. Auto-layout: колонка, gap 16px, items center, padding 16px, overflow clip. Ширина контента 214px.
- Заливка: `theme/surface/page` (fallback #fbfbfb). Обводка 1px solid `theme/borders-&-dividers/subtle` (fallback в коде #181818 — это значение по умолчанию переменной, реальный цвет брать из токена проекта). Радиус 24px.

## Тексты и шрифты (все Inter Medium, weight 500, not-italic)
| id | Слой | Текст | Размер / line-height / letter-spacing | Цвет |
|---|---|---|---|---|
| 1110:8817 | doc-title | `Invoice #2144` | 20px / 28px / -0.4px, по центру | `theme/typography/primary` |
| 1110:8819 | doc-value | `$12,263.00` | 28px / 36px / -0.56px, по центру | `theme/typography/primary` |
| 1110:8821 | doc-due label | `Due in 7 days` | 14px / 20px / -0.28px, nowrap | `theme/typography/tertiary` |
| 1110:8833 | doc-action label | `Send invoice` | 14px / 20px / -0.28px, nowrap | `theme/typography/brand` (fallback #b63b12) |

## Элементы
- doc-divider (1110:8818): ширина 100%, высота 0, линия 1px (SVG, inset -1px сверху). Asset: https://www.figma.com/api/mcp/asset/efb93f51-7f7d-499b-96c7-ab2abab54df4.svg (не сохранён).
- doc-due (1110:8820): плашка, заливка `theme/surface/hover` (fallback #f3f3f3), padding 12px по горизонтали / 8px по вертикали, радиус pill (99999px), содержимое по центру, ширина по тексту (высота 36px).
- doc-lines (1110:8822): колонка, gap 8px, ширина 100%. Три строки, каждая row, justify space-between, items center, ширина 100%. Полоски (bars): высота 9px, радиус 9999px, заливка `theme/surface/hover`.
  - line-1 (1110:8823): left 80px (1110:8824), right 28px (1110:8825)
  - line-2 (1110:8826): left 104px (1110:8827), right 45px (1110:8828)
  - line-3 (1110:8829): left 66px (1110:8830), right 40px (1110:8831)
- doc-action (1110:8832): кнопка, ширина 100% (214px), padding 12px, заливка `theme/surface/brand-light` (fallback #fef0eb), обводка 1px solid `theme/borders-&-dividers/subtle`, радиус pill, содержимое по центру (высота 20+24+2 = 46px).
- loader (1110:8834): absolute, left 107.5px, top 246.5px (относительно doc), 30x30. Asset SVG: https://www.figma.com/api/mcp/asset/585352d6-3991-4109-b9fc-f097551e8589.svg (не сохранён).
- icon-tick-circle (1110:8837): absolute, left 15.5px, top 102.5px (относительно doc), 48x48. Заливка #16A34A (жёстко в SVG, токена в ответе нет). Сохранён: `src/assets/features/tick-circle.svg`.
- loader и tick лежат поверх документа, вне потока auto-layout.

## Узлы, помеченные как animated (motion.*)
doc (1110:8816), doc-due, doc-lines, doc-action, loader, icon-tick-circle. Данные анимации не запрашивались (инструмент советует get_motion_context для 1110:8815).

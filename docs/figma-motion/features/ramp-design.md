# features__ramp-counter (1110:8853) — статика

Источник: get_design_context, 2026-10-21.

## Общее
- Контейнер: row, items start, nowrap, все дочерние слои absolute; размер size-full.
- Шрифт: Urbanist Light (weight 300), 120px, line-height 128px, letter-spacing -2.4px. Цвет `theme/typography/primary` (fallback #181818). Других цветов и ассетов нет.

## Слои
| id | Слой | Текст | Позиция |
|---|---|---|---|
| 1110:8854 | текст | `0.` | left 0, top 0 |
| 1110:8855 | features__ramp-counter-scroll (motion.div) | колонка цифр | left 89, top 0, w 72, h 768, column, items center |
| 1110:8856..8861 | цифры внутри scroll | `0`, `1`, `2`, `3`, `4`, `5` (сверху вниз) | каждая 128px высотой, shrink-0 |
| 1110:8862 | текст | `%` | left 161, top 0 |

- scroll: высота 768 = 6 x 128; видимо одно окно 128px, маска родителя в ответе не указана (overflow не задан, проверить по макету).
- Итоговая надпись: `0.<цифра>%`, колонка цифр шириной 72px.
- Шрифт Urbanist (остальные иллюстрации Inter).

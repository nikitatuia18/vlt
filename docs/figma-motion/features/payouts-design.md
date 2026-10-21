# features__payouts-illustration (1110:8871) — статика

Источник: get_design_context, 2026-10-21. Корень: relative, size-full. Все слои absolute, координаты в px от левого верхнего угла корня. Размер корня в ответе не указан; по координатам схема занимает примерно 388 x 230 px (правый край аватара bank 346+42, низ аватара card 188+42).

## Источник (1110:8872) features__payouts-source
- left 0, top 112, 48x48, радиус 50px. Внутри img-coin-renbtc (1110:8873), на весь размер.
- Asset: coin.svg (сохранён). В SVG: круг fill #B63B12 opacity 0.16, stroke #181818 opacity 0.06, внутри значок USDC (белая заливка).

## Методы (pill)
Одинаковые: заливка `theme/surface/page` (fallback #fbfbfb), обводка 1px solid rgba(24,24,24,0.06) (задано числом, не переменной), радиус pill (99999px), padding 12px по горизонтали / 8px по вертикали, gap 8px, row, items center, justify center, left 165px. Высота 24+16+2 = 42px (по ширине — по контенту).
Текст: Inter Medium 500, 14px / 20px, letter-spacing -0.28px, nowrap, цвет `theme/typography/primary`.
| Слой | id | top | Текст | Иконка 24x24 |
|---|---|---|---|---|
| features__payouts-method-bank | 1110:8876 | 41 | `Bank transfer` (1110:8878) | icon-bank (1110:8877), fill #B63B12 |
| features__payouts-method-crypto | 1110:8879 | 115 | `Crypto` (1110:8881) | icon-cryptocurrency-payment (1110:8880), радиус 50px, внутри renBTC (I1110:8880;43:58500) |
| features__payouts-method-card | 1110:8882 | 189 | `Card` (1110:8884) | icon-card (1110:8883), fill #B63B12 |
Шаг по вертикали 74px.

## Линии (static) и потоки (flow, motion)
Статичные линии лежат под потоками; flow-слои повторяют координаты одноимённых линий и помечены как animated. SVG-ассеты линий не сохранены. Базовый адрес: https://www.figma.com/api/mcp/asset/
- line-dollar-bank (1110:8885): inset 23.25% 57.47% 49.82% 12.37% (проценты от корня); asset 91452023-b12c-4a74-80d2-c28c8791e1d8.svg
- line-dollar-card (1110:8886): inset 50.18% 57.47% 22.88% 12.37%, поворот -180deg + scale-x -1 (по сути зеркало bank-линии по вертикали); использует тот же SVG, что line-dollar-bank
- line-dollar-crypto (1110:8887): left 48, top 136, w 116.5, h 0; asset ebfdfb8b-4c63-460c-b7fc-990d53b88528.svg
- line-card-person (1110:8888): left 255, top 209, w 36, h 0; asset a2df104d-283a-4487-bb77-002be706efac.svg
- line-crypto-person (1110:8889): left 268, top 136, w 36, h 0; тот же SVG
- line-bank-person (1110:8890): left 310, top 63, w 36, h 0; тот же SVG
Flow-слои (motion.div): flow-dollar-bank 1110:8897 (98102f4b-4f4f-4c24-97d7-0d7353a93a23.svg), flow-dollar-crypto 1110:8898 (166ce89b-d69c-41af-9e6e-c10ea53b0bb0.svg), flow-dollar-card 1110:8899 (4f99403e-bc2f-401b-a060-e2c0703c8f24.svg, в той же поворотной обёртке), flow-bank-person 1110:8900 (740c4674-6f1d-4a56-94aa-f70b8fe9705b.svg), flow-crypto-person 1110:8901 (60edac12-4fec-4ce9-b158-198296891eda.svg), flow-card-person 1110:8902 (c1cb83e8-76f8-4f27-b3de-da9eb980c763.svg). Позиции совпадают с одноимёнными line-слоями.

## Получатели (recipient)
Круг 42x42, радиус pill, заливка `theme/surface/brand-default` (fallback #b63b12), внутри аватар 42x42 (PNG 84x84 @2x).
| Слой | id | left | top | Аватар |
|---|---|---|---|---|
| recipient-crypto | 1110:8891 | 304 | 115 | avatar-crypto 1110:8892 |
| recipient-bank | 1110:8893 | 346 | 41 | avatar-bank 1110:8894 |
| recipient-card | 1110:8895 | 291 | 188 | avatar-card 1110:8896 (у recipient-card overflow clip) |
Текстов у получателей нет.

## Сохранённые файлы (src/assets/features/)
avatar-bank.png, avatar-crypto.png, avatar-card.png (84x84 PNG RGBA), coin.svg (48x48), icon-bank.svg (24x24), icon-crypto.svg (24x24), icon-card.svg (24x24).

## Замечания
- icon-crypto многоцветная (круг #B63B12 с белым знаком BTC), под mask/currentColor не подходит. icon-bank и icon-card одноцветные, но в SVG залиты #B63B12 (не нейтральным цветом); для окраски через маску цвет значения не имеет.
- Обводка методов rgba(24,24,24,0.06) — не переменная; сверить с токеном border/subtle в tokens.css.
- Проценты inset у line-dollar-bank/card дают px только при известном размере корня.

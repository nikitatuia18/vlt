# Страница Crypto Processing

Адрес: `/crypto-processing`. Структура и тексты (черновик, версия 2): [../pages/crypto-processing.md](../pages/crypto-processing.md); как делать страницы продуктов: [../pages.md](../pages.md); разбор конкурента: [../research/mosta-crypto-processing.md](../research/mosta-crypto-processing.md).
Код: [src/pages/crypto-processing/](../../src/pages/crypto-processing/) · тесты: [tests/crypto-processing.spec.ts](../../tests/crypto-processing.spec.ts).
Статус: **версия 2, три интерактивные сцены** (2026-10-23). Ждёт выбора дизайнера: заголовки (варианты в `docs/pages/crypto-processing.md`), скорость и плотность сцен.

## Что на странице
Header → hero (`ProductHero`, заголовок «Accept crypto payments through one integration.») → Logos → блок 1 `crypto-processing__flow` → блок 2 `crypto-processing__api` → Industries (7 сценариев) → Faq (8 вопросов) → Cta → Footer.
Тексты внутри сцен (корни `*-illustration`) не появляются по словам: это часть интерактива, как карточки Features: под них в `tests/reveal.spec.ts` уже есть исключение `*-illustration`. Что оно теперь покрывает и страницу продукта, нужно подтвердить дизайнеру. Заголовки блоков, подводки и кнопки «Book a demo» — по словам.

## Demo-значения
Монеты USDT / USDC / DAI, сети Ethereum / Tron / Polygon, суммы 120 / 250 / 480 / 1,000, курс 1 монета = 0.92 EUR (`demo.ts`). Это только для картинки, не список поддерживаемого и не курсы продукта [CONFIRM]. Выбор посетителя (монета, сеть, сумма) живёт в `demo.ts` (`useSelection`): блок 1 его меняет, блок 2 показывает в запросе.

## Hero-сцена: живая карта из точек (`DotMapScene.tsx`, `flatLand.ts`)
Плоская карта из точек (та же маска суши, что у глобуса: `isLand` из `Global/globe/landDots.ts`), canvas. Платежи прилетают дугами из мест мира на точку «Your account» (Европа), на посадке круг и кольцо; панель слева внизу показывает последний платёж: Waiting for payment → Payment confirmed → Settled (+сумма в EUR). Интерактив: мышь отталкивает точки (формулы `InteractiveDots`), клик по карте или кнопка «Send a payment» отправляет платёж из этого места. Автоплатёж каждые 1,6–3 с, не больше 8 в полёте; цикл идёт только пока карта на экране; reduced motion: карта стоит, статус Settled. Телефон: карточка выше (4:5, `heroMediaClassName`), карта в верхней части, панель и кнопка под ней.
Цвета из токенов через скрытые «пробы» (следуют теме).

## Блок 1: «Follow one payment» (`PaymentJourney.tsx`)
Три станции Accept / Convert / Settle на пунктирной дорожке; кольцо — платёж, переезжает между станциями (motion, `duration.reveal`); пройденная часть дорожки закрашена цветом бренда. Само играет по кругу (3 с на станцию) пока блок виден на 40 %; клик по станции или чипу ставит на паузу, кнопка Play / Pause. Стрелки ← → переключают станции (`role="tablist"`). Панели: Accept (чипы монеты, сети и суммы), Convert (отправлено, курс, получено), Settle (куда зачислено, сумма, Settled). Reduced motion и выключенное появление: без автоплея и без кнопки Play, станция 1.

## Блок 2: «Run a test payment» (`TestPayment.tsx`)
Три колонки Request → Events → Your system. Request: код запроса с выбранной монетой, сетью и суммой, после отправки ответ `< 201 "status": "pending"`. Events: кнопка «Send test payment» (Sending… / Replay), события `payment.created` → `confirmed` → `settled` по очереди (0,5 с и далее через 1,4 с), между колонками бежит точка. Your system: журнал «Order #1042 …», последняя строка «marked as paid» с галочкой. Один раз играет само при показе блока, дальше по кнопке. Без движения сразу итоговое состояние.

## Замер (Playwright + CDP, CPU ×4, мышь над сценой, 6 с)
Долгих задач нет у всех трёх сцен; кадры: карта p50 17 мс, p95 33 мс, max 50 мс; блоки 1 и 2 p95 17 мс.

## Что ждёт
- Решение дизайнера: заголовки (hero A/B/C, блок 1 A/B/C, блок 2 A/B/C), скорость, плотность и размах дуг карты.
- Факты от продукта (`[CONFIRM]` в `content.ts`, `demo.ts`, `sceneText.ts`): валюта расчёта, монеты и сети, комиссии, курс, сроки, события и способ сообщения о платеже (webhooks?).
- Ссылка с карточки Crypto Processing на главной (`Features/cards.ts`: `#crypto-processing` → `/crypto-processing`) — после утверждения страницы.
- Единое название продукта: в подвале «Crypto processing», в карточке «Crypto Processing».

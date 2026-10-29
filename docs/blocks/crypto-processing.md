# Страница Crypto Processing

Адрес: `/crypto-processing`. Структура и тексты (черновик, версия 2): [../pages/crypto-processing.md](../pages/crypto-processing.md); как делать страницы продуктов: [../pages.md](../pages.md); разбор конкурента: [../research/mosta-crypto-processing.md](../research/mosta-crypto-processing.md).
Код: [src/pages/crypto-processing/](../../src/pages/crypto-processing/) · тесты: [tests/crypto-processing.spec.ts](../../tests/crypto-processing.spec.ts).
Статус: **версия 2, три интерактивные сцены** (2026-10-23). Ждёт выбора дизайнера: заголовки (варианты в `docs/pages/crypto-processing.md`), скорость и плотность сцен.

## Что на странице
Header → hero (`ProductHero`, заголовок в две строки: «Accept crypto payments» / «through one integration.») → Logos → блок 1 `crypto-processing__flow` → блок 2 `crypto-processing__api` → Industries (7 сценариев) → Faq (8 вопросов) → Cta → Footer.
Тексты внутри сцен (корни `*-illustration`) не появляются по словам: это часть интерактива, как карточки Features: под них в `tests/reveal.spec.ts` уже есть исключение `*-illustration`. Что оно теперь покрывает и страницу продукта, нужно подтвердить дизайнеру. Заголовки блоков, подводки и кнопки «Book a demo» — по словам.

## Demo-значения (слова «Demo» на странице нет)
Монеты USDT / USDC / DAI, сети Ethereum / Tron / Polygon, суммы 120 / 250 / 480 / 1,000, курс 1 монета = 0.92 EUR (`demo.ts`). Метки «Demo» / «Demo values» дизайнер велел убрать со всех блоков (2026-10-23). Это только для картинки, не список поддерживаемого и не курсы продукта [CONFIRM]. Выбор посетителя (монета, сеть, сумма) живёт в `demo.ts` (`useSelection`): блок 1 его меняет, блок 2 показывает в запросе.

## Hero-сцена: живая карта из точек (`DotMapScene.tsx`, `flatLand.ts`)
Плоская карта из точек (та же маска суши, что у глобуса: `isLand` из `Global/globe/landDots.ts`), canvas. Платежи прилетают дугами из мест мира на точку «Your account» (Европа), на посадке кольцо и сумма «+230.00 EUR» у аккаунта; на карте подписан только последний платёж (откуда и сумма в пути). Нижний ряд: две карточки слева, кнопка «Send a payment» прижата к правому нижнему углу. Первая карточка: id платежа (`pay_xxxxxx`), сумма и сеть, маршрут «From Asia → Your account», три шага Created / Confirmed / Settled с секундами (на телефоне шаги скрыты), статус. Вторая карточка рядом (от 1024 px) «Recent payments»: три последних приземлившихся (регион, сумма в EUR, монета и сеть). Регион по точке — `regionOf` в `flatLand.ts` (грубые рамки). Интерактив: мышь отталкивает точки (формулы `InteractiveDots`), клик по карте или кнопка «Send a payment» отправляет платёж из этого места. Автоплатёж каждые 1,6–3 с, не больше 8 в полёте; цикл идёт только пока карта на экране; reduced motion: карта стоит, статус Settled. Телефон: карточка выше (4:5, `heroMediaClassName`), карта в верхней части, панель и кнопка под ней.
Цвета из токенов через скрытые «пробы» (следуют теме).

## Блок 1: «Follow one payment» (`PaymentJourney.tsx`)
Три станции Accept / Convert / Settle на пунктирной дорожке; пройденная часть закрашена цветом бренда (кольцо-«платёж» убрано: дизайнер счёл его непонятным и кривым). На каждой станции под значениями печатается консоль (`TypedLog.tsx`): строки `payment.created` → сумма и сеть → `waiting for confirmations…` → `payment.confirmed` (Convert: курс и пересчёт, Settle: отправка и `payment.settled`), тонкая полоса показывает, сколько написано, точка статуса пульсирует, пока пишется. Само играет по кругу пока блок виден на 40 %: когда лог дописан, пауза 1,6 с и следующая станция; клик по станции или чипу ставит на паузу и печатает лог заново; кнопка Play / Pause стоит в правом верхнем углу карточки-панели (не над сценой), Play печатает лог текущей станции сразу и продолжает круг. Стрелки ← → переключают станции (`role="tablist"`). Панели: Accept (чипы монеты, сети и суммы), Convert (отправлено, курс, получено), Settle (куда зачислено, сумма, Settled). Reduced motion и выключенное появление: без автоплея и без кнопки Play, станция 1.

## Блок 2: «Run a test payment» (`TestPayment.tsx`)
Три колонки Request → Events → Your system. Request: код запроса с выбранной монетой, сетью и суммой, после отправки ответ `< 201 "status": "pending"`. Кнопка «Send test payment» (Sending… / Replay) стоит в карточке Request под кодом: это запрос, который она отправляет. Events: события `payment.created` → `confirmed` → `settled` по очереди (0,5 с и далее через 1,4 с), между колонками бежит точка. Your system: журнал «Order #1042 …», последняя строка «marked as paid» с галочкой. Один раз играет само при показе блока, дальше по кнопке. Без движения сразу итоговое состояние.

## Замер (Playwright + CDP, CPU ×4, мышь над сценой, 6 с)
Долгих задач нет у всех трёх сцен; кадры: карта p50 17 мс, p95 33 мс, max 50 мс; блоки 1 и 2 p95 17 мс.

## Что ждёт
- Решение дизайнера: заголовки (hero A/B/C, блок 1 A/B/C, блок 2 A/B/C), скорость, плотность и размах дуг карты.
- Факты от продукта (`[CONFIRM]` в `content.ts`, `demo.ts`, `sceneText.ts`): валюта расчёта, монеты и сети, комиссии, курс, сроки, события и способ сообщения о платеже (webhooks?).
- Ссылка с карточки Crypto Processing на главной (`Features/cards.ts`: `#crypto-processing` → `/crypto-processing`) — после утверждения страницы.
- Единое название продукта: в подвале «Crypto processing», в карточке «Crypto Processing».

## Полоса из трёх пунктов и «What you get» (2026-10-29)
Два новых блока по тексту и референсу дизайнера (в Figma их нет). Порядок: hero → **Highlights** → «Follow one payment» → «Run a test payment» → **WhatYouGet** → Works great with → Industries → Faq → Cta.
- `Highlights.tsx` (`crypto-processing__highlights`): светлая карточка как у фактов Invoicing, три пункта («Converted at the moment of payment, safe from price swings» / «Paid out to your bank over local rails: SEPA Instant, FedNow, Pix, UPI, RIPS…» / «No chargebacks: a crypto payment cannot be pulled back»); начало фразы тёмное, продолжение серое; три колонки от 1024 px, ниже столбиком (на 768 три колонки тесные).
- `WhatYouGet.tsx` (`crypto-processing__benefits`): «What you get» / «Built for finance teams, not just developers.» и шесть карточек (иконка в круге сверху, название и строка внизу). Карточки не ссылки, поэтому без hover. Колонок: 1 / 2 (от 768) / 3 (от 1024). Иконки: `swap.svg` и пять новых в `src/assets/icons/benefits/` (bank, card, shield, chart, user), нарисованы в стиле иконок меню Products (24 px, линия 1,5), в круге 20 px — **заменить на иконки дизайнера, если есть**.
- Тексты — `highlightsContent` и `whatYouGetContent` в `content.ts`, дословно от дизайнера. Общими блоками станут, когда понадобятся на второй странице.

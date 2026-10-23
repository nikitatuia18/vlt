# Страница Crypto Processing

Адрес: `/crypto-processing`. Структура и тексты (черновик): [../pages/crypto-processing.md](../pages/crypto-processing.md); как делать страницы продуктов: [../pages.md](../pages.md).
Код: [src/pages/crypto-processing/](../../src/pages/crypto-processing/) · тесты: [tests/crypto-processing.spec.ts](../../tests/crypto-processing.spec.ts).
Статус: **первая версия, статика** (2026-10-23). Креатив (живые сцены из точек) подключаем после выбора дизайнера.

## Что на странице
Header → hero (`ProductHero`) → Logos → блок 1 `crypto-processing__flow` → блок 2 `crypto-processing__api` → Industries (7 сценариев) → Faq (8 вопросов) → Cta («Ready to accept crypto payments?») → Footer.
Hero: заголовок «Accept crypto. Convert. Settle.», подзаголовок, кнопки «Book a demo» и «See how it works» (якорь `#how-it-works` на блок 1). Карточка под текстом пока пустая (место окна оплаты глазами клиента).

## Блок 1 «Путь платежа» (`PaymentFlow.tsx`)
Три узла на пунктирной линии (Client wallet → Velant → Your account), под ними бейджи выбора (Coin, Network / Rate / Settlement) и шаги Accept, Convert, Settle с текстом. Узлы появляются «хлопком» по очереди. Ниже 768 px шаги друг под другом без линии.

## Блок 2 «Код и события» (`ApiEvents.tsx`)
Слева заголовок, текст и список webhook-событий (`payment.created`, `payment.confirmed`, `payment.settled`); справа окно с двумя вкладками (запрос и событие), код статичный. Поля кода выдуманы для картинки (как в окне Global), значения, которых нет у продукта, заменены на «…». Окно с кодом — исключение из правила «по словам», как в Global.

## Что ждёт
- Креатив: окно оплаты в hero, живая точечная схема в блоке 1, печатающийся код и лента событий в блоке 2 (несколько вариантов на выбор).
- Факты от продукта (`[CONFIRM]` в `content.ts`): валюта расчёта, монеты и сети, комиссии, курс, сроки, события webhooks (вопросы — в `docs/pages/crypto-processing.md`, раздел «Вопросы к продукту»).
- Ссылка с карточки Crypto Processing на главной (`Features/cards.ts`: `#crypto-processing` → `/crypto-processing`) — после утверждения страницы.
- Единое название продукта: в подвале «Crypto processing», в карточке «Crypto Processing».

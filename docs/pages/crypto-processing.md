# Страница Crypto Processing (тексты и структура, черновик)

Статус: **структура и тексты на утверждение** (2026-10-23). Все тексты ниже — черновик, написан по навыку `project-copywriting` (разд. 4а), финальным текст делает пользователь. `src/pages/crypto-processing/content.ts` **не создан**: сначала утверждается структура.
Макет Figma для страницы не открывался: у страницы нет кадра, `data-el` ниже — предложение (в `naming-spec.md` для неё нет слоёв).
Метка `[CONFIRM]` — нужен факт продукта, которого у нас нет; в `content.ts` текст пойдёт без факта, метка останется комментарием.

Опора на факты (только из сайта и макета): один API; принять, конвертировать, рассчитаться; клиент платит из кошелька, получает fiat («Let your clients pay in crypto, and receive fiat» — макет, Startups); интеграция «From 1 week», KYB входит в онбординг; custodial + MPC; канадская MSB licence; демо → KYB → запуск → первая боевая транзакция. Остальное — без цифр.

## (а) Карта вопросов посетителя

| # | Вопрос посетителя | Кто спрашивает | Где отвечаем |
|---|---|---|---|
| 1 | Что это и для кого? | бизнес | Hero (h1, подзаголовок), Industries |
| 2 | Как платёж идёт по шагам? | бизнес, разработчик | Блок 1 «Путь платежа» |
| 3 | Что я получу в итоге и в какой валюте? | бизнес, финансы | Hero, блок 1 (шаг Settle), FAQ «What do I receive» |
| 4 | Как это подключается, нужен ли разработчик? | разработчик | Блок 2 «Код и события», FAQ «integration» |
| 5 | Как я узнаю, что платёж пришёл? | разработчик, финансы | Блок 2 (лента событий), FAQ «How do I know» |
| 6 | Какие монеты и сети? | бизнес, разработчик | FAQ (пока без списка, `[CONFIRM]`) |
| 7 | Сколько стоит? | бизнес | FAQ «How much does it cost?» (без цифр, `[CONFIRM]`) |
| 8 | Безопасно ли, как хранятся средства? | compliance | FAQ «How do you keep funds safe?» |
| 9 | Под какой лицензией работаете? | compliance | FAQ «What licence do you have?» |
| 10 | За какой срок запуститься, с чего начать? | все | FAQ «estimated time» + Cta |
| 11 | Подходит ли это моей отрасли? | бизнес | Industries (сценарии под Crypto Processing) |
| 12 | Что не покрыто, можно ли под себя? | бизнес, разработчик | FAQ «custom payment method» |
| 13 | Что с возвратами, недоплатой, просроченным платежом? | финансы, разработчик | **нет ответа** → вопросы к продукту |
| 14 | Лимиты, комиссии сети, сроки зачисления? | финансы | **нет ответа** → вопросы к продукту |

## (б) Структура страницы

Обёртка страницы: `page-crypto-processing__body`. Блоки страницы по порядку; общие блоки сохраняют свои `data-el` (`logos`, `industries`, `faq`, `cta`), меняются только данные.

| # | Блок / `data-el` | Отвечает на | Заголовок | Суть (1–2 фразы) | Что показывает картинка / микро-интерфейс |
|---|---|---|---|---|---|
| 0 | `header` (общий) | — | — | — | — |
| 1 | `crypto-processing__hero` | вопросы 1, 3 | Accept crypto. Convert. Settle. | Клиент платит в крипто, Velant конвертирует и рассчитывает на счёт компании через один API. Две кнопки. | Карточка-сцена (как `hero__media`): окно оплаты глазами клиента. Заполняются «Amount», «Coin», «Network», появляется «Rate» и «You receive», нажимается «Pay now», статус «Waiting for payment» → «Payment confirmed» → «Settled». |
| 2 | `logos` (общий) | доверие | — (текста нет) | — | Лента логотипов как на главной. |
| 3 | `crypto-processing__flow` | вопросы 2, 3 | How a crypto payment reaches your account. | Три шага: Accept, Convert, Settle. Один интеграционный путь, статусы видны по ходу. | Точечная схема слева направо: кошелёк клиента → Velant → счёт компании. Над стрелками метки выбора монеты и сети, курса, расчёта. Шаги подсвечиваются по очереди. Это путь целиком, а hero показывает только экран клиента. |
| 4 | `crypto-processing__api` | вопросы 4, 5 | Integrate once. Track every payment. | Платёж создаётся одним запросом; webhooks сообщают системе о подтверждении и расчёте. | Слева окно с кодом (две вкладки: запрос и событие), справа лента событий `payment.created` → `payment.confirmed` → `payment.settled`; события появляются по очереди. |
| 5 | `industries` (общий) | вопрос 11 | From first payment to final payout. (общий) | Семь пунктов: вводный и шесть сценариев приёма крипто. | Как на главной: закреплённая сцена, тёмные сцены со свечением у средних пунктов. |
| 6 | `faq` (общий) | вопросы 3–10, 12 | Still have questions? (общий) | Восемь вопросов по Crypto Processing. | Аккордеон как на главной. |
| 7 | `cta` (общий) | вопрос 10 | Ready to accept crypto payments? | Следующий шаг: демо, на нём разбираем путь платежа клиента. | Баннер с человеком и бейджами как на главной. |
| 8 | `footer` (общий) | — | — | — | — |

Оставляем ли блок 2 — см. отчёт: оставить, но поставить в очередь блок «Coins and networks», как только продукт даст список. `NextSteps` на странице не нужен: «как начать» отвечают вопрос FAQ про срок (там же шаги) и Cta; блок одинаков на всех продуктовых страницах, а страница уже длинная из-за закреплённого Industries.

Сцены микро-интерфейсов: тексты внутри картинок считаем частью анимации (как тексты в иллюстрациях карточек Features) и из правила «по словам» исключаем. Это расширение правила: **нужно подтверждение пользователя**.

## (в) Тексты

Знаки считаются с пробелами и знаками препинания; для списков строк (Industries) — по строкам отдельно. Статусы: «черновик» — написан мной; «макет» — текст уже на главной (из макета), повтор без изменений.

### Hero

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__hero-title` | Accept crypto. Convert. Settle. (три строки: «Accept crypto.», «Convert.», «Settle.») | 31 (14 / 8 / 7) | черновик |
| `crypto-processing__hero-subtitle` | Your clients pay in crypto. Velant converts the payment and settles it to your account through one API. | 103 | черновик `[CONFIRM: куда рассчитываем — счёт, кошелёк, баланс Velant]` |
| `crypto-processing__hero-cta-primary` | Book a demo | 11 | макет |
| `crypto-processing__hero-cta-secondary` | See how it works (якорь на блок `flow`) | 16 | черновик (запасной: «Explore products», как на главной) |

Варианты заголовка на выбор (отдельно): «One integration for every crypto payment.» (41); «Get paid in crypto. Settle in fiat.» (35, `[CONFIRM]`: только ли fiat).

Микро-интерфейс hero (окно оплаты, подписи):

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__hero-scene-title` | Pay with crypto | 15 | черновик |
| `crypto-processing__hero-scene-amount-label` | Amount | 6 | черновик |
| `crypto-processing__hero-scene-coin-label` | Coin | 4 | черновик |
| `crypto-processing__hero-scene-network-label` | Network | 7 | черновик |
| `crypto-processing__hero-scene-rate-label` | Rate | 4 | черновик |
| `crypto-processing__hero-scene-receive-label` | You receive | 11 | черновик |
| `crypto-processing__hero-scene-pay-label` | Pay now | 7 | черновик |
| `crypto-processing__hero-scene-status-waiting` | Waiting for payment | 19 | черновик |
| `crypto-processing__hero-scene-status-confirmed` | Payment confirmed | 17 | черновик |
| `crypto-processing__hero-scene-status-settled` | Settled | 7 | черновик |

Значения в сцене (сумма, название монеты и сети, курс) — часть картинки, не текст страницы; **названия монет и сетей не берём, пока продукт не подтвердит список** (`[CONFIRM]`); до тех пор — значки без названий или нейтральные заглушки.

### Блок 1 — `crypto-processing__flow`

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__flow-title` | How a crypto payment reaches your account. | 43 | черновик |
| `crypto-processing__flow-intro` | Three steps, one integration. You see the status of every payment on the way. | 77 | черновик `[CONFIRM: где видны статусы — API, webhooks, кабинет]` |
| `crypto-processing__flow-step-accept-title` | Accept | 6 | черновик |
| `crypto-processing__flow-step-accept-text` | Your client picks a coin and a network and pays from their own wallet. | 70 | черновик |
| `crypto-processing__flow-step-convert-title` | Convert | 7 | черновик |
| `crypto-processing__flow-step-convert-text` | Velant converts the payment into your settlement currency at the current rate. | 78 | черновик `[CONFIRM: фиксация курса, источник курса, валюты расчёта]` |
| `crypto-processing__flow-step-settle-title` | Settle | 6 | черновик |
| `crypto-processing__flow-step-settle-text` | The funds reach your company account. Your system gets every status update. | 75 | черновик `[CONFIRM: срок зачисления не указываем]` |

Подписи схемы:

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__flow-node-wallet` | Client wallet | 13 | черновик |
| `crypto-processing__flow-node-velant` | Velant | 6 | черновик |
| `crypto-processing__flow-node-account` | Your account | 12 | черновик `[CONFIRM: тип счёта]` |
| `crypto-processing__flow-chip-coin` | Coin | 4 | черновик |
| `crypto-processing__flow-chip-network` | Network | 7 | черновик |
| `crypto-processing__flow-chip-rate` | Rate | 4 | черновик |
| `crypto-processing__flow-chip-settlement` | Settlement | 10 | черновик |

### Блок 2 — `crypto-processing__api`

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__api-title` | Integrate once. Track every payment. | 36 | черновик |
| `crypto-processing__api-text` | Create a payment with one request. Webhooks tell your system when it is confirmed and settled. | 94 | черновик `[CONFIRM: набор и названия событий]` |
| `crypto-processing__api-tab-create` | Create payment | 14 | черновик |
| `crypto-processing__api-tab-webhook` | Webhook event | 13 | черновик |
| `crypto-processing__api-feed-title` | Webhook events | 14 | черновик |
| `crypto-processing__api-feed-event-created` | payment.created | 15 | черновик `[CONFIRM]` |
| `crypto-processing__api-feed-note-created` | Payment request created | 23 | черновик |
| `crypto-processing__api-feed-event-confirmed` | payment.confirmed | 17 | черновик `[CONFIRM]` |
| `crypto-processing__api-feed-note-confirmed` | Transfer confirmed on the network | 33 | черновик |
| `crypto-processing__api-feed-event-settled` | payment.settled | 15 | черновик `[CONFIRM]` |
| `crypto-processing__api-feed-note-settled` | Funds sent to your account | 26 | черновик |

Окно с кодом (форма; поля и пути — выдуманы для картинки, как в черновике Global, `codeScripts.ts`). Значения в `[…]` нужны от продукта:

```
POST /v1/payments
{
  "amount": 1200,
  "currency": "EUR",
  "asset": "[CONFIRM coin]",
  "network": "[CONFIRM network]",
  "settle_in": "[CONFIRM]"
}
< 201  status: "pending"
```

Вкладка «Webhook event»: `payment.confirmed`, `"status": "confirmed"`, `"payment_id"`, `"amount"` (набор полей `[CONFIRM]`). В черновике Global уже стоит `settle_in: "USDT"`: если продукт подтвердит USDT, можно взять оттуда.

### Industries (общий блок; данные страницы)

Формат как `Industries/items.ts`: заголовок + две строки (первая с точкой, вторая без, как в макете). Порядок и свечения: пункт 1 и 7 светлые, 2–6 с цветным свечением, как на главной. Id для `items.ts` — в скобках.

| # (id) | Заголовок | Строка 1 | Строка 2 | Знаков (заг. / 1 / 2) | Статус |
|---|---|---|---|---|---|
| 1 (`industry-first`) | Industry-first scenarios | Crypto acceptance shaped around your industry. | Pick a scenario and see it in a demo | 24 / 46 / 35 | черновик (заголовок с главной) |
| 2 (`ecommerce`) | E-commerce | Add crypto to your checkout through one integration. | Shoppers pay from their wallet, you receive fiat | 10 / 52 / 48 | черновик |
| 3 (`marketplaces`) | Marketplaces and platforms | Let buyers pay in crypto on your platform. | Follow every payment through the API | 26 / 42 / 36 | черновик |
| 4 (`luxury-automotive`) | Luxury goods and Automotive | Take high-value payments in crypto from buyers abroad. | Receive the settlement in your account | 27 / 54 / 38 | черновик `[CONFIRM: лимиты на сумму платежа]` |
| 5 (`real-estate`) | Real estate | Accept deposits and final payments in crypto. | Settle to your account in the currency you use | 11 / 45 / 46 | черновик `[CONFIRM: валюты расчёта]` |
| 6 (`export-import`) | Export/Import | Get paid by buyers abroad in crypto. | Skip the chain of correspondent banks | 13 / 35 / 37 | черновик (проверить с продуктом: сравнение с банками) |
| 7 (`psps-acquirers`) | PSPs and Acquirers | Offer crypto as a payment method to your merchants. | One integration instead of a separate crypto stack | 18 / 51 / 50 | черновик (отрасль взята из «Solutions» футера) |

Кнопка у всех — «Book a demo» (11), как на главной. Заголовок блока общий: «From first payment to final payout.» (35, макет).

### Faq (общий блок; данные страницы)

Формат как `Faq/items.ts`: вопрос, `lead` (основной цвет, необязателен), ответ (вторичный цвет). Порядок — по важности для посетителя.

| # (id) | Вопрос | Lead | Ответ | Знаков (в / l / о) | Статус |
|---|---|---|---|---|---|
| 1 (`receive`) | What do I receive, and in what currency? | Your clients pay in crypto, and you receive fiat. | Tell us the currencies you need, and we will set up settlement for them. | 39 / 49 / 72 | черновик, lead из макета `[CONFIRM: список валют, расчёт в крипто]` |
| 2 (`coins`) | Which coins and networks do you support? | Tell us what your clients use. | We will confirm the coins and networks available for your flow during the demo. | 40 / 30 / 79 | черновик `[CONFIRM: список монет и сетей]` |
| 3 (`status`) | How do I know a payment is confirmed? | Through webhooks. | You get an event when a payment is created, confirmed, and settled. | 37 / 17 / 67 | черновик `[CONFIRM: события]` |
| 4 (`timeline`) | What is the estimated time for integration? | From 1 week. | Book a demo, pass KYB, and send your first live transaction. KYB is included as part of the onboarding process. | 43 / 12 / 111 | вопрос и lead — макет; ответ — дополнен шагами |
| 5 (`safety`) | How do you keep funds safe? | — | We use a custodial solution with MPC under the hood and shared-secret cryptography | 27 / — / 80 | макет |
| 6 (`licence`) | What licence do you have? | — | Velant Pay operates under a Canadian MSB licence and works with licensed third-party financial providers. | 25 / — / 105 | макет |
| 7 (`cost`) | How much does it cost? | It depends on your flow. | Book a demo and we will walk you through the fees for your flow. | 22 / 24 / 64 | черновик `[CONFIRM: модель комиссий, можно ли показывать на странице]` |
| 8 (`custom-method`) | I need a custom payment method/new currency/specific financial flow. Can you do that? | Probably. Tell us what you're building. | We can discuss custom payment methods, currencies, settlement flows, and other requirements with our team. | 85 / 39 / 106 | макет |

В макете ответ на вопрос 5 без точки в конце — оставлено как в макете. Открыт при загрузке — вопрос 1 (в макете главной открыт первый).

### Cta (общий блок; данные страницы)

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `cta__title` | Ready to accept crypto payments? | 32 | черновик (на главной «Tell us what you're building.» — 29) |
| `cta__subtitle` | We'll map the path from your client's wallet to your account. | 61 | черновик (на главной 67) |
| `cta__button` | Book a demo | 11 | макет |

Бейджи баннера (по желанию, иначе остаются главные): «Accept crypto» (13), «Multi-currency» (14, макет), «KYB included» (12, из ответа FAQ про онбординг); главные «Pay-in / Pay-out» и «Instant KYB» (проверить с продуктом) остаются на главной. Статус: предложение.

## (г) Вопросы к продукту

1. В какой валюте расчёт: только fiat, ещё стейблкоины или крипто? (в макете «receive fiat», в описании продукта «рассчитаться в крипто»)
2. Куда приходят деньги: банковский счёт, крипто-кошелёк, баланс в Velant?
3. Список монет и сетей, которые можно показывать на сайте (и в каких нет).
4. Комиссии: модель (процент, фикс, сеть), можно ли называть на странице или только на демо?
5. Курс: фиксируется ли на время оплаты, какой источник, есть ли допуск?
6. Срок расчёта после подтверждения и число подтверждений сети (без этого фраза про срок в тексте не пишется).
7. Лимиты на один платёж и в день; есть ли отдельный сценарий для крупных платежей (Luxury, Real estate).
8. Что с недоплатой, переплатой, просроченным платежом и возвратом клиенту.
9. Webhooks: названия и список событий, подписи, повторные отправки; есть ли песочница и документация, на которые можно вести вторую кнопку.
10. Формы подключения: только API или ещё платёжная страница и ссылки на оплату (окно оплаты в hero это подразумевает)?
11. Ограничения: страны, клиенты, проверка входящих крипто-платежей (AML/KYT); что можно сказать публично.
12. Лицензия MSB: на какие виды деятельности и регионы распространяется; хранит ли Velant средства до конвертации.
13. Что не поддерживается (карты, рекуррентные платежи, возвраты в крипто), чтобы честно ответить на «что не покрыто».
14. Подходит ли формулировка «Instant KYB» из макета: в шаге 02 главной KYB проходят по документам.

## (д) Допущения

1. Тексты строятся только на фактах из п. 2 навыка и макета; всё остальное — без цифр и с `[CONFIRM]`.
2. Путь платежа «кошелёк клиента → Velant → счёт компании», выбор монеты и сети, курс, расчёт — из задания; сам механизм (где хранятся средства, как считается курс) не описываем.
3. Hero показывает экран клиента, блок 1 — весь путь, блок 2 — сторону разработчика; повторов фраз между ними нет.
4. Вторая кнопка hero — «See how it works» (якорь на блок 1), потому что документации и страницы продуктов пока нет; запасной вариант «Explore products».
5. Названия событий `payment.created` / `confirmed` / `settled` — из задания, не подтверждены продуктом.
6. Тексты в сценах и лентах (hero, схема, лента событий) считаются частью иллюстраций и не появляются по словам; код печатается по символам, как в Global (нужно согласие пользователя).
7. Industries: 7 пунктов, как на главной (вводный + 6 сценариев, ради совпадения с тёмными сценами: у пунктов 1 и 7 нет свечения); отрасли выбраны из главной и «Solutions» футера (Merchants, Platforms, PSPs & Acquirers). Startups и Operations and payroll на этой странице не повторяются.
8. Ответы FAQ про безопасность, лицензию и «custom» повторены с главной слово в слово, включая «licence» (UK).
9. Длина: заголовки до 8 слов (самый длинный — «How a crypto payment reaches your account.»), описания 60–110 знаков; пункты Industries на 20 % не превышают строки главной (самая длинная строка 54 против 61 у главной).

# Страница Crypto Processing (тексты и структура, черновик)

Статус: **черновик, версия 2 после замечаний дизайнера** (2026-10-23). Все тексты — черновик, написан по навыку `project-copywriting` (разд. 4а), финальным текст делает пользователь. `src/pages/crypto-processing/content.ts` создан; в версии 2 в нём заменены только заголовок и подзаголовок hero, заголовок и подводка блоков 1 и 2 (рекомендованные варианты). Микротексты интерактивов в код ещё не перенесены.
Макет Figma для страницы не открывался: у страницы нет кадра, `data-el` ниже — предложение (в `naming-spec.md` для неё нет слоёв).

## Версия 2 (после замечаний дизайнера)

Что изменилось: hero и блоки 1–2 переписаны. Старые разделы ниже **устарели в части hero и блоков 1–2** (карта вопросов, Industries, Faq, Cta, вопросы к продукту остаются в силе). Знаки считаются с пробелами и знаками препинания. Метка `[CONFIRM]` — нужен факт продукта.

Причины замен: «Accept crypto. Convert. Settle.» в три строки повторял ритм главной («Banking for today. …») и ничего не сообщал; блок 1 не объяснял, что происходит; блок 2 показывал код без ответа «что дальше». Приёмы разбора конкурента (`docs/research/mosta-crypto-processing.md`): заголовок как конкретное утверждение, объяснение действием, а не картинкой с подписями. Тексты конкурента не использованы.

### Правила для монет, сетей и сумм в интерактивах

- Монеты и сети в интерактивах — **только demo-значения**, но слова «Demo» на странице нет (решение дизайнера 2026-10-23: чистая картинка). В списки «что мы поддерживаем» они не попадают, в FAQ на вопрос про монеты и сети остаётся «подтвердим на демо».
- Набор demo: монеты USDT, USDC, DAI; сети Ethereum, Tron, Polygon. Взяты потому, что любая пара монета + сеть правдоподобна (все три монеты ходят во всех трёх сетях). Если продукт не хочет называть даже в demo, запасной вариант: «Coin A / B / C» и «Network A / B / C» (хуже читается, в версию 2 не берём).
- Формат суммы: число с разделителем тысяч и двумя знаками, пробел, код валюты, без символов валют: `1,000.00 USDT`, `920.00 EUR`. Вход: «`{amount} {COIN}`», зачисление: «`+{amount} {CUR}`» со знаком плюс.
- Demo-курс один на все сцены: `1 USDT = 0.92 EUR` (суммы сходятся: 120.00 → 110.40, 250.00 → 230.00, 480.00 → 441.60, 1,000.00 → 920.00). Комиссий в сумме нет: ни одна сумма не должна читаться как «после комиссии». `[CONFIRM: валюта расчёта, EUR взят как пример]`
- Номер заказа в журнале: `#1042` (любой, меняется по желанию).

### Заголовки: варианты и рекомендация

| Место | Вариант | Знаков | Рекомендация |
|---|---|---|---|
| Hero `crypto-processing__hero-title` (две строки: «Accept crypto payments» / «through one integration.») | A. Accept crypto payments / through one integration. | 47 | **рекомендую**: рабочая версия дизайнера; называет действие и способ, не повторяет ритм главной |
| | B. Crypto payments, settled to your account. | 41 | результат первым; но «settled to your account» требует `[CONFIRM: куда рассчитываем]` |
| | C. One API to accept and settle crypto. | 36 | самый короткий; «One API» уже открывает подзаголовок главной, повтор |
| Блок 1 `crypto-processing__flow-title` | A. Follow one payment. | 19 | **рекомендую**: называет действие посетителя; не конфликтует с Cta и подзаголовком hero, где уже есть путь «кошелёк → счёт» |
| | B. From their wallet to your account. | 34 | объясняет результат, но повторяет подзаголовок hero и Cta («from your client's wallet to your account»); «their» без контекста |
| | C. One payment, three steps. | 25 | считает станции; нет глагола, слабее зовёт к действию |
| Блок 2 `crypto-processing__api-title` | A. Run a test payment. | 19 | **рекомендую**: действие и результат в самом слове «test»; рабочая версия дизайнера |
| | B. Your system knows when you are paid. | 36 | говорит про результат интеграции; длиннее, без действия |
| | C. From one request to a paid order. | 33 | показывает весь путь; повторяет конструкцию «From … to» (в Industries «From first payment to final payout.») |

Пара рекомендаций (блок 1 «Follow one payment.» и блок 2 «Run a test payment.») — два повелительных наклонения подряд. Это намеренно: оба блока интерактивные, заголовок сразу говорит «нажми». Если дизайнеру покажется однообразно, замена: блок 1 B.

### Hero (версия 2)

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__hero-title` | Accept crypto payments / through one integration. (две строки, чтобы «integration» не висело одно) | 47 | черновик (вариант A) |
| `crypto-processing__hero-subtitle` | Your client pays from their wallet. Velant converts the payment and settles it to your account, with a status for every payment. | 128 | черновик `[CONFIRM: куда рассчитываем — счёт, кошелёк, баланс Velant; где виден статус — API, webhooks, кабинет]` |
| `crypto-processing__hero-cta-primary` | Book a demo | 11 | макет |
| `crypto-processing__hero-cta-secondary` | See how it works | 16 | черновик (без изменений) |

Подзаголовок: клиент → конвертация → расчёт → статус, всё про результат; слов «crypto» и «API» в нём нет, чтобы не повторять заголовок.

### Hero-сцена: карта из точек (версия 2)

Тексты сцены — часть картинки, по словам не появляются.

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__hero-scene-hint` | Click the map to send a payment | 31 | черновик, рекомендую (как у дизайнера: глагол, действие и результат; короче и ясней вариантов) |
| то же, узкий экран, где нет мыши | Tap the map to send a payment | 29 | черновик |
| то же, после первого платежа | Try another place | 17 | черновик (по желанию, заменяет подсказку) |
| `crypto-processing__hero-scene-status-waiting` | Waiting for payment | 19 | черновик (из версии 1) |
| `crypto-processing__hero-scene-status-confirmed` | Payment confirmed | 17 | черновик (из версии 1) |
| `crypto-processing__hero-scene-status-settled` | Settled | 7 | черновик (из версии 1) |
| `crypto-processing__hero-scene-account` (метка точки счёта) | Your account | 12 | черновик |
| сумма в полёте (пример) | 250.00 USDT | 11 | demo, формат выше |
| сумма при зачислении (пример) | +230.00 EUR | 11 | demo, формат выше |

Запасные подсказки (не рекомендую): «Click anywhere to send a payment» (32), «Click anywhere on the map to send a payment» (43).

### Блок 1 «Follow one payment» (версия 2)

Интерактив: платёж проходит три станции по точечной дорожке; посетитель нажимает станцию или Play.

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__flow-title` | Follow one payment. | 19 | черновик (вариант A) |
| `crypto-processing__flow-intro` | Press Play or pick a step to see what happens to one demo payment. | 66 | черновик (запасной: «Press Play, or pick a step to see what happens to the payment at each stage.», 75) |
| `crypto-processing__flow-station-accept` | Accept | 6 | черновик |
| `crypto-processing__flow-station-convert` | Convert | 7 | черновик |
| `crypto-processing__flow-station-settle` | Settle | 6 | черновик |
| подпись под станцией Accept | Client pays | 11 | черновик |
| подпись под станцией Convert | Rate applied | 12 | черновик |
| подпись под станцией Settle | Funds credited | 14 | черновик `[CONFIRM: тип счёта]` |
| `crypto-processing__flow-play` | Play | 4 | черновик |
| `crypto-processing__flow-pause` | Pause | 5 | черновик |
| `crypto-processing__flow-replay` (после конца круга, по желанию) | Replay | 6 | черновик |
| `crypto-processing__flow-hint` | Try another coin or network. | 28 | черновик (одна строка-подсказка; запасной: «Change the coin or network on the Accept step.», 46) |

Мини-панели:

| Панель | Заголовок | Поля и значения (demo) | Статус платежа |
|---|---|---|---|
| Accept | Client payment (14) | Coin (4): чипы USDT · USDC · DAI; Network (7): чипы Ethereum · Tron · Polygon; Amount (6): 1,000.00 USDT | Waiting for payment |
| Convert | Conversion (10) | Client sends (12): 1,000.00 USDT; You receive (11): 920.00 EUR; Rate (4): 1 USDT = 0.92 EUR | Payment confirmed |
| Settle | Settlement (10) | Credited to (11): Your account (12); Amount (6): 920.00 EUR; Status (6): Settled (7) | Settled |

В панели Accept при выборе монеты меняется код монеты в сумме и в панели Convert («Client sends»); курс остаётся 0.92 (demo), чтобы не изобретать курсы разных монет.

Старые тексты шагов (`flow-step-*-text`, `node`, `chips`) в версии 2 не нужны, если дизайнер оставит только станции и панели; из `content.ts` они не удалены.

### Блок 2 «Run a test payment» (версия 2)

Интерактив: три колонки Request → Events → Your system.

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__api-title` | Run a test payment. | 19 | черновик (вариант A) |
| `crypto-processing__api-text` | Your integration ends when your system learns that the order is paid. Send a test payment and watch it get there. | 113 | черновик `[CONFIRM: механизм сообщения — webhooks?; набор событий]` |
| `crypto-processing__api-column-request` | Request | 7 | черновик |
| подпись колонки Request | What you send | 13 | черновик |
| `crypto-processing__api-column-events` | Events | 6 | черновик |
| подпись колонки Events | What Velant sends back | 22 | черновик `[CONFIRM]` |
| `crypto-processing__api-column-system` | Your system | 11 | черновик |
| подпись колонки Your system | What your system does | 21 | черновик |
| `crypto-processing__api-send` | Send test payment | 17 | черновик |
| `crypto-processing__api-sending` (пока события летят) | Sending… | 8 | черновик |
| `crypto-processing__api-replay` | Replay | 6 | черновик |
| `crypto-processing__api-empty` (пустые колонки Events и Your system) | No events yet | 13 | черновик |
| подсказка под колонкой Request (если монета и сеть выбраны в блоке 1) | Uses the coin and network you picked above. | 43 | черновик; если выбора выше нет, не нужна |

Тексты событий (имена — из версии 1, не подтверждены продуктом `[CONFIRM]`):

| Событие | Имя | Знаков | Пояснение | Знаков |
|---|---|---|---|---|
| 1 | payment.created | 15 | Payment created | 15 |
| 2 | payment.confirmed | 17 | Confirmed on the network | 24 |
| 3 | payment.settled | 15 | Funds sent to your account | 26 |

Журнал «Your system» (номер заказа `#1042` — пример, нейтральный):

| После события | Строка журнала | Знаков |
|---|---|---|
| payment.created | Order #1042: waiting for payment | 32 |
| payment.confirmed | Order #1042: payment confirmed | 30 |
| payment.settled | Order #1042 marked as paid | 26 |

Код в колонке Request: форма как в версии 1 (`POST /v1/payments`, поля выдуманы для картинки), в `asset` и `network` подставляются выбранные монета и сеть; `settle_in` остаётся `[CONFIRM]`. Кнопка отправки выглядит «выключенной» (`Sending…`), пока события летят; по окончании меняется на «Replay».

### Industries, Faq, Cta: вычитка на повторы с главной и с новыми заголовками

Менять нечего обязательно, но есть повторы, которые стоит решить (в `content.ts` не правил, жду решения):

| Место | Что повторяется | Предложение (не применено) |
|---|---|---|
| Industries, E-commerce, строка 1: «Add crypto to your checkout through one integration.» | «through one integration» слово в слово повторяет заголовок hero | «Let shoppers pay in crypto at your checkout.» (43) |
| Industries, PSPs and Acquirers, строка 2: «One integration instead of a separate crypto stack» | третий «one integration» на странице | допустимо (другой смысл); при желании «No separate crypto stack to build» (34) |
| Industries, Marketplaces, строка 2: «Follow every payment through the API» | эхо «Follow one payment» в блоке 1 | «See every payment status through the API» (39) |
| Cta subtitle: «We'll map the path from your client's wallet to your account.» | путь «кошелёк клиента → счёт» уже в подзаголовке hero (при рекомендованном заголовке блока 1 «Follow one payment.» конфликта с блоком 1 нет) | оставить; если нужно меньше повторов: «We'll show you the payment path for your business.» (52) |
| Cta title: «Ready to accept crypto payments?» | эхо заголовка hero | оставить: в конце страницы повтор сознательный |
| Faq `status` («You get an event when a payment is created, confirmed, and settled.») | совпадает с событиями блока 2 | оставить, согласовано |
| Faq `receive` lead («you receive fiat») | в демо расчёт в EUR | согласовано (`[CONFIRM]` валюты) |

Остальное (Faq 2–8, бейджи Cta, пункты Industries 1, 3–7 кроме перечисленных) повторов с главной и с новыми заголовками не создаёт.

---

## Версия 1 (устарела в части hero и блоков 1–2)
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

**Строки 1, 3 и 4 таблицы (hero, блоки 1 и 2) устарели: заголовки и содержание картинок — в версии 2 выше.** Обёртка страницы: `page-crypto-processing__body`. Блоки страницы по порядку; общие блоки сохраняют свои `data-el` (`logos`, `industries`, `faq`, `cta`), меняются только данные.

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

### Hero (устарело, см. версию 2)

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `crypto-processing__hero-title` | Accept crypto payments / through one integration. (две строки, чтобы «integration» не висело одно) | 47 | черновик (вариант A) |
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

### Блок 1 — `crypto-processing__flow` (устарело, см. версию 2)

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

### Блок 2 — `crypto-processing__api` (устарело, см. версию 2)

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

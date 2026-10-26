# Страница Crypto on- and off-ramp: структура и тексты (черновик, 2026-10-26)

**Сцены версии 1 (hero «Каждая точка — 5 €», блок `ramp__flow`) устарели; актуальные тексты сцен — в разделе «Тексты (версия 2, 2026-10-26)» в конце файла. Faq, Industries, Cta, meta и заголовок hero из версии 1 остаются в силе.**

Адрес: `/ramp`. Статус: **черновик; код собран 2026-10-26 ([../blocks/ramp.md](../blocks/ramp.md)), решения дизайнера там же**, написан по навыку `project-copywriting` (разд. 4а). Финальным текст делает пользователь; структуру и тексты утверждает он. В `src/` ничего не менялось, `content.ts` не создан, Figma не открывалась (у страницы нет кадра, `data-el` ниже — предложение).
Образцы: [invoicing.md](invoicing.md) (раздел «Тексты (версия 2)»), [crypto-processing.md](crypto-processing.md); как делать страницы — [../pages.md](../pages.md). Референс Mosta не использован: у них страницы ramp нет.
Знаки считаются с пробелами и знаками препинания (стрелка `→` и точка `·` — по одному знаку). `[CONFIRM]` = нужен факт продукта: в `content.ts` текст пойдёт без факта, метка останется комментарием, на сайт она не попадает. Слов «Demo» на странице нет (кроме кнопки «Book a demo» и фразы «during the demo» в ответах Faq, как на двух готовых страницах).

Опора на факты (только из сайта, макета и кода): карточка главной «Crypto on- and off-ramp. Convert seamlessly between fiat and crypto with rates from 0.5%.» (`Features/cards.ts`; в навыке стоит устаревшее «от 0.0%», берём 0.5% `[CONFIRM]`); цифры макета «99.9% Target SLA uptime», «15+ Direct local rails», «<1 sec API processing time» (`Global.tsx`); шаги подключения демо → KYB → запуск → первая боевая транзакция; «From 1 week» для интеграции; лицензия (ответ главной слово в слово). Названия рельсов — из `Global/pins.ts`: для EUR там «SEPA / INSTANT», для USD «ACH / Fedwire / FedNow», для BRL «Pix / TED»; на странице в картинке использован только `SEPA` (EUR), с `[CONFIRM]`.

## Решено дизайнером (не пересматривается)
- Hero-сцена «Каждая точка — 5 €»: слева банк, справа кошелёк, 200 точек = 1 000 €, 1 точка (0,5 %) отделяется оранжевой и уходит в сторону (комиссия); кнопка Flip меняет направление, посетитель вводит сумму.
- Один блок `ramp__flow` («Money in. Money out.»): переключатель On-ramp / Off-ramp, по три станции. Rate lock внутри станции Convert. Второго блока про продукт нет.
- Общие блоки: Logos без изменений, Industries (7, первая и последняя светлые), Faq (8), Cta со своим заголовком и бейджами, Meta.

## Формат демо-данных (единый на все сцены)

- Формат как на Invoicing: фиат кодом **перед** суммой, крипта кодом **после**, запятая — разделитель тысяч, два знака: `EUR 1,000.00`, `1,081.52 USDT`. Комиссия в сумме отправителя: `EUR 5.00` / `5.00 USDT`. Курс: `1 USDT = EUR 0.92` (тот же, что на других страницах). Один курс в обе стороны (спред в картинке не показываем `[CONFIRM]`).
- Монета USDT, сеть Ethereum (в чипах также Tron, Polygon — как на Crypto Processing), фиат EUR, рельс `SEPA`: **только для картинки**, не список поддерживаемого `[CONFIRM]`. Адреса вымышленные: кошелёк `0x7a3F…c91D` (Tron: `TQn9…x2Wk`), адрес приёма в off-ramp `0x91bE…4d2A` (Tron: `TLw4…p8Ze`), референс депозита `VP-4821`, счёт выплаты `•••• 0426`.
- **Поле суммы всегда «You send» в той валюте, что отправляется**, умолчание 1,000.00 в обе стороны (это даёт чистые числа и 200 точек в обоих направлениях). Комиссия 0,5 % берётся из отправленной суммы, конвертируется остаток.
- Правила: `fee = send × 0.005`; `net = send − fee`; on-ramp: `get = net ÷ 0.92` (USDT); off-ramp: `get = net × 0.92` (EUR); округление до цента на последнем шаге; **200 точек всегда, 1 точка — комиссия, 199 приходят**; значение точки `dot = send ÷ 200`, подписывается в валюте отправки.

| Отправлено | Точка (1 dot) | Комиссия 0,5 % | Конвертируется | Получите |
|---|---|---|---|---|
| on-ramp: EUR 500.00 | EUR 2.50 | EUR 2.50 | EUR 497.50 | 540.76 USDT |
| on-ramp: **EUR 1,000.00** (умолч.) | EUR 5.00 | EUR 5.00 | EUR 995.00 | **1,081.52 USDT** |
| on-ramp: EUR 2,500.00 | EUR 12.50 | EUR 12.50 | EUR 2,487.50 | 2,703.80 USDT |
| on-ramp: EUR 10,000.00 | EUR 50.00 | EUR 50.00 | EUR 9,950.00 | 10,815.22 USDT |
| off-ramp: 500.00 USDT | 2.50 USDT | 2.50 USDT | 497.50 USDT | EUR 457.70 |
| off-ramp: **1,000.00 USDT** (умолч.) | 5.00 USDT | 5.00 USDT | 995.00 USDT | **EUR 915.40** |
| off-ramp: 2,500.00 USDT | 12.50 USDT | 12.50 USDT | 2,487.50 USDT | EUR 2,288.50 |
| off-ramp: 10,000.00 USDT | 50.00 USDT | 50.00 USDT | 9,950.00 USDT | EUR 9,154.00 |

Проверка арифметики: 200 × точка = сумма во всех строках (200 × 2.50 = 500, × 5 = 1,000, × 12.50 = 2,500, × 50 = 10,000); 995 ÷ 0.92 = 1,081.5217 → 1,081.52; 497.5 ÷ 0.92 = 540.7609 → 540.76; 2,487.5 ÷ 0.92 = 2,703.8043 → 2,703.80; 9,950 ÷ 0.92 = 10,815.2174 → 10,815.22; 995 × 0.92 = 915.40; 497.5 × 0.92 = 457.70; 2,487.5 × 0.92 = 2,288.50; 9,950 × 0.92 = 9,154.00. Для произвольной суммы: комиссия округляется до цента первой (1,234.56 → 6.17), потом остаток.
Чипы суммы (по желанию, рядом с полем): on-ramp `EUR 500` (7) · `EUR 1,000` (9) · `EUR 2,500` (9) · `EUR 10,000` (10); off-ramp `500 USDT` (8) · `1,000 USDT` (10) · `2,500 USDT` (10) · `10,000 USDT` (11).

**Отличие от слов дизайнера:** он описал середину сцены как «1 000 €». В off-ramp посетитель отправляет USDT, поэтому в середине `1,000.00 USDT`, точка `5.00 USDT`, получите `EUR 915.40` (не `EUR 995.00`: курс 0.92 уменьшает сумму). Альтернатива, если хочется «всегда в евро»: в off-ramp отправляется `1,086.96 USDT` (= EUR 1,000.00 при курсе 0.92, округление), комиссия `EUR 5.00`, получите `EUR 995.00`. Цена: умолчание 1,086.96 некруглое, поле суммы значит разное в разных направлениях. Рекомендую основной вариант (в таблице).

## Карта вопросов посетителя

| Вопрос | Кто | Где отвечаем |
|---|---|---|
| Что это и для кого? | бизнес | Hero (заголовок, подзаголовок, сцена), Industries |
| Что я получу и в какой валюте? | бизнес, финансы | Hero-сцена (You send / You get), `ramp__flow` (результат), Faq «cost», «coins» |
| Сколько это стоит? | бизнес, финансы | Hero-сцена (Fee 0.5%), Convert (строка Fee), Faq «cost» |
| Как это работает по шагам, в обе стороны? | бизнес, разработчик | `ramp__flow` (переключатель, три станции в каждую сторону) |
| Какой курс и как долго он действует? | финансы | Convert (таймер 30 с, обновление котировки), Faq «rate» |
| Какие рельсы, банки, страны? | бизнес, финансы | Deposit / Payout (чипы рельса), Faq «rails» (без списка, `[CONFIRM]`) |
| Какие монеты и сети? | бизнес, разработчик | Receive / Send (чипы сети), Faq «coins» (без списка, `[CONFIRM]`) |
| Нужен ли свой кошелёк, куда идут деньги? | бизнес, compliance | Receive / Send (адрес), Faq «wallet» |
| Лимиты и срок перевода? | финансы | Faq «limits-time» (без цифр, `[CONFIRM]`) |
| Как подключиться и за какой срок? | бизнес, разработчик | Faq «start», Cta (шаги демо → KYB → запуск → первая транзакция из Faq) |
| Безопасно ли, какая лицензия? | compliance | Faq «licence» (слово в слово с главной); вопрос «safety» в набор из 8 не вошёл |
| Что не покрыто, можно ли под себя? | бизнес | нет ответа в фактах: вопросы к продукту; при желании заменить Faq 6 на «custom-method» с главной |
| API, события, подключение к своей системе? | разработчик | консоль в `ramp__flow` (`ramp.*`, `[CONFIRM]`); отдельного Faq-вопроса нет |

## Структура страницы

Header → `ramp__hero` → Logos → `ramp__flow` → Industries → Faq → Cta → Footer. Тексты внутри сцен (`*-illustration`) по словам не появляются (по согласию дизайнера, как на двух готовых страницах). Заголовок и подводка блока, заголовки и описания общих блоков, кнопки — по словам.

| Блок / `data-el` | Отвечает на | Заголовок | Что показывает |
|---|---|---|---|
| `ramp__hero` | что это, сколько стоит, что получу | Move money between / your bank and your wallet. | Большая карточка: банк и кошелёк, между ними 200 точек (= сумма), одна оранжевая уходит в сторону (комиссия); поле суммы, Flip, строки «You send / Fee / Rate / You get» |
| `logos` | доверие | — | как на главной |
| `ramp__flow` | шаги, курс, рельсы, сети, результат | Money in. Money out. | Переключатель On-ramp / Off-ramp; три станции на пунктирной дорожке; под станцией панель с полями и консоль `TypedLog`; на Convert таймер 30 с; в конце результат «деньги в кошельке / на счёте» |
| `industries` | для кого | общий («From first payment to final payout.») | данные ниже |
| `faq` | детали | общий | данные ниже |
| `cta` | следующий шаг | Ready to move money both ways? | данные ниже |

Допущение (на решение дизайнера): сумма и направление из hero переходят в блок `ramp__flow` (как выбор монеты на Crypto Processing). Если нет, тексты работают в обоих вариантах.

## Заголовки: варианты и рекомендации

| Место | Вариант | Знаков | Рекомендация |
|---|---|---|---|
| Hero (две строки) | **A.** Move money between / your bank and your wallet. | 18 + 26 | **рекомендую**: конкретно, повторяет картинку (банк слева, кошелёк справа), не копирует ритм главной, Crypto Processing и Invoicing; слабость: в заголовке нет слова «crypto» (оно в подзаголовке, `meta` и ссылке с главной) |
| | B. Fiat in, crypto out. / Or the other way around. | 20 + 24 | сильный ритм, сочетается с Flip; но «in / out» повторяется в рекомендованном заголовке блока «Money in. Money out.». Брать, только если блок получит вариант B или C |
| | C. Fiat to crypto and back, / with the fee in plain sight. | 24 + 28 | называет оба мира и выгоду; «in plain sight» обещает прозрачность комиссии `[CONFIRM]`, строки неровные |
| Блок `ramp__flow` | **A.** Money in. Money out. | 20 | **рекомендую**: рабочее имя дизайнера; две точки-предложения, как «Get paid. Reconciled.» на Invoicing; совпадает с переключателем |
| | B. Pick a direction. See the fee. | 30 | зовёт трогать, но «See the fee» сужает блок до комиссии |
| | C. Three steps each way. | 21 | считает станции; нет действия |
| Cta | **A.** Ready to move money both ways? | 30 | **рекомендую**: «both ways» = on-ramp и off-ramp, эхо блока без повтора |
| | B. Ready to convert between fiat and crypto? | 41 | нейтрально, повторяет карточку главной |

## Hero

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__hero-title` | Move money between / your bank and your wallet. (две строки, одно слово не висит) | 18 + 26 | черновик (вариант A) |
| `ramp__hero-subtitle` | Convert fiat to crypto and back. Send from your bank or wallet, see the rate and the fee, then confirm. | 103 | черновик `[CONFIRM: курс и комиссия показываются до подтверждения (как в сцене); «crypto»: монеты]` |
| `ramp__hero-cta-primary` | Book a demo | 11 | макет |
| `ramp__hero-cta-secondary` (якорь на `ramp__flow`) | See how it works | 16 | черновик (как на двух других страницах) |

### Hero-сцена «Каждая точка — 5 €» (тексты внутри картинки, по словам не появляются)

Значения даны для умолчания; при другой сумме и направлении меняются по таблице «Формат демо-данных». Слева банк, справа кошелёк всегда (позиции не меняются); Flip меняет направление движения точек и подписи.

| Место | On-ramp (умолчание) | Off-ramp (после Flip) | Знаков | Статус |
|---|---|---|---|---|
| метка слева | Bank | Bank | 4 | черновик |
| подпись под ней | EUR account | EUR account | 11 | черновик `[CONFIRM: валюты]` |
| метка справа | Wallet | Wallet | 6 | черновик |
| подпись под ней | 0x7a3F…c91D | 0x7a3F…c91D | 11 | demo |
| направление | On-ramp · EUR → USDT | Off-ramp · USDT → EUR | 20 / 21 | черновик |
| поле суммы, метка | You send | You send | 8 | черновик |
| поле суммы, значение | EUR 1,000.00 | 1,000.00 USDT | 12 / 13 | demo |
| кнопка | Flip | Flip | 4 | черновик (aria-label «Flip direction», 14) |
| подпись точки | 1 dot = EUR 5.00 | 1 dot = 5.00 USDT | 16 / 17 | demo |
| оранжевая точка | Fee | Fee | 3 | черновик |
| легенда | 1 dot is the fee | 1 dot is the fee | 16 | черновик |
| счётчик точек (по желанию) | 199 dots arrive | 199 dots arrive | 15 | черновик |
| строка комиссии | Fee 0.5% · EUR 5.00 | Fee 0.5% · 5.00 USDT | 8 + 8 / 8 + 9 | demo `[CONFIRM: 0.5% — комиссия или маржа курса; «from 0.5%» с карточки]` |
| строка курса | Rate · 1 USDT = EUR 0.92 | Rate · 1 USDT = EUR 0.92 | 4 + 17 | demo `[CONFIRM]` |
| строка «получите» | You get · 1,081.52 USDT | You get · EUR 915.40 | 7 + 13 / 7 + 10 | demo |
| подсказка | Change the amount, then press Flip. | то же | 35 | черновик |
| подсказка, узкий экран | Change the amount, then tap Flip. | то же | 33 | черновик |
| поле пустое | Enter an amount | то же | 15 | черновик |
| поле пустое, длинный вариант | Enter an amount to see the fee | то же | 30 | черновик |

Лимиты на сумму в поле не называем (`[CONFIRM: min / max]`); ошибки вида «max 100,000» не пишем.

## Блок `ramp__flow`

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__flow-title` | Money in. Money out. | 20 | черновик (вариант A, рабочее имя дизайнера) |
| `ramp__flow-intro` | Pick a direction and follow one transfer through three steps. Change the amount and watch the fee. | 98 | черновик (запасной: «Pick a direction, then press Play to follow one transfer.», 59) |
| `ramp__flow-toggle-on` | On-ramp | 7 | черновик |
| `ramp__flow-toggle-off` | Off-ramp | 8 | черновик |
| подпись под переключателем | Fiat to crypto · Crypto to fiat | 14 · 14 | черновик |
| `ramp__flow-play` / `-pause` / `-replay` | Play · Pause · Replay | 4 · 5 · 6 | черновик (как на Crypto Processing) |

Интерактив: станция играет сама по кругу, пока блок на экране; клик по станции или чипу ставит на паузу и печатает консоль заново (как `PaymentJourney`). На Convert идёт таймер: если пробыть там дольше 30 с, котировка обновляется.

### Станции: названия, подписи, панели

| Направление | Станция (`data-el`) | Название | Подпись под станцией | Заголовок панели | Строка в панели | Знаков (назв. / подп. / загол. / строка) | Статус |
|---|---|---|---|---|---|---|---|
| On-ramp | `ramp__flow-station-deposit` | Deposit | From your bank | Bank deposit | Pay from your bank by transfer or a local rail. | 7 / 14 / 12 / 47 | черновик `[CONFIRM: рельсы]` |
| On-ramp | `ramp__flow-station-convert` | Convert | Rate locked | Quote | The rate is locked for 30 seconds, then the quote updates. | 7 / 11 / 5 / 58 | черновик `[CONFIRM: 30 секунд, обновление котировки]` |
| On-ramp | `ramp__flow-station-receive` | Receive | To your wallet | Your wallet | USDT is sent to your wallet on the network you pick. | 7 / 14 / 11 / 52 | черновик `[CONFIRM: монета, сети, кошелёк]` |
| Off-ramp | `ramp__flow-station-send` | Send | From your wallet | Send USDT | Send USDT to the address we show, on the network you pick. | 4 / 16 / 9 / 58 | черновик `[CONFIRM: адрес приёма создаётся на заказ?]` |
| Off-ramp | `ramp__flow-station-convert` | Convert | Rate locked | Quote | The rate is locked for 30 seconds, then the quote updates. | 7 / 11 / 5 / 58 | черновик (тот же компонент) |
| Off-ramp | `ramp__flow-station-payout` | Payout | To your bank | Bank payout | We pay out to your bank account by a local rail. | 6 / 12 / 11 / 48 | черновик `[CONFIRM: рельс выплаты]` |

### Поля панелей (значения demo)

| Станция | Поле: значение | Знаков (метка / значение) |
|---|---|---|
| Deposit | Amount: EUR 1,000.00 (поле, синхронно с hero) | 6 / 12 |
| Deposit | Pay with: чипы `Bank transfer` · `Local rail` | 8 / 13, 10 |
| Deposit | Rail (только при Local rail): SEPA | 4 / 4 `[CONFIRM: из pins.ts]` |
| Deposit | Reference: VP-4821 | 9 / 7 |
| Deposit | статус: Waiting for deposit → Deposit received | 19 → 16 |
| Convert | You send: EUR 1,000.00 (off-ramp: 1,000.00 USDT) | 8 / 12 (13) |
| Convert | Fee 0.5%: EUR 5.00 (off-ramp: 5.00 USDT) | 8 / 8 (9) |
| Convert | Rate: 1 USDT = EUR 0.92 | 4 / 17 |
| Convert | You get: 1,081.52 USDT (off-ramp: EUR 915.40) | 7 / 13 (10) |
| Convert | таймер: Rate locked for 0:30 (идёт вниз) → Rate updated → снова 0:30 | 20 → 12 |
| Convert | статус: Locking the rate → Converted | 16 → 9 |
| Receive | Network: чипы `Ethereum` · `Tron` · `Polygon` | 7 / 8, 4, 7 |
| Receive | Wallet: 0x7a3F…c91D (Tron: TQn9…x2Wk) | 6 / 11 (9) |
| Receive | Received: 1,081.52 USDT | 8 / 13 |
| Receive | статус: Sending to your wallet → Completed | 22 → 9 |
| Send | Network: чипы `Ethereum` · `Tron` · `Polygon` | 7 / 8, 4, 7 |
| Send | Send to: 0x91bE…4d2A (Tron: TLw4…p8Ze), кнопка Copy / Copied | 7 / 11 (9); 4 / 6 |
| Send | Amount: 1,000.00 USDT (синхронно с hero) | 6 / 13 |
| Send | статус: Waiting for USDT → USDT received | 16 → 13 |
| Payout | Pay out to: EUR account · •••• 0426 | 10 / 9 |
| Payout | Pay with: чипы `Bank transfer` · `Local rail`; Rail: SEPA | 8 / 13, 10; 4 / 4 |
| Payout | Amount: EUR 915.40 | 6 / 10 |
| Payout | статус: Sending to your bank → Completed | 20 → 9 |

### Консоль (`TypedLog`): строки по станциям

Имена событий `ramp.*` не подтверждены продуктом `[CONFIRM]`. Скобки в таблице — длина строки в знаках. Строка с рельсом: `bank transfer` или `SEPA` по выбору чипа.

| Направление · станция | Строки по порядку | Знаков |
|---|---|---|
| On · Deposit | `ramp.deposit.created` · `EUR 1,000.00 · bank transfer · ref VP-4821` (с рельсом: `EUR 1,000.00 · SEPA · ref VP-4821`) · `waiting for the deposit…` · `ramp.deposit.received` | 20 · 42 (33) · 24 · 21 |
| On · Convert | `ramp.quote.locked` · `1 USDT = EUR 0.92 · locked for 30 s` · `fee 0.5% = EUR 5.00` · `EUR 995.00 → 1,081.52 USDT` · `ramp.convert.completed` | 17 · 35 · 19 · 26 · 22 |
| On · Receive | `ramp.crypto.sent` · `1,081.52 USDT → 0x7a3F…c91D (Ethereum)` · `waiting for confirmations…` · `ramp.order.completed` | 16 · 38 · 26 · 20 |
| Off · Send | `ramp.send.created` · `send 1,000.00 USDT to 0x91bE…4d2A (Ethereum)` · `waiting for confirmations…` · `ramp.crypto.received` | 17 · 44 · 26 · 20 |
| Off · Convert | `ramp.quote.locked` · `1 USDT = EUR 0.92 · locked for 30 s` · `fee 0.5% = 5.00 USDT` · `995.00 USDT → EUR 915.40` · `ramp.convert.completed` | 17 · 35 · 20 · 24 · 22 |
| Off · Payout | `ramp.payout.sent` · `EUR 915.40 → bank account · SEPA` · `waiting for the bank…` · `ramp.order.completed` | 16 · 32 · 21 · 20 |
| любая, по истечении 30 с на Convert | `ramp.quote.refreshed` (в demo курс тот же, 0.92) | 20 |

### Результат, подсказки

| Место | Текст | Знаков | Статус |
|---|---|---|---|
| результат, on-ramp | EUR 1,000.00 became 1,081.52 USDT in your wallet. | 49 | черновик (суммы по таблице) |
| результат, off-ramp | 1,000.00 USDT became EUR 915.40 in your bank account. | 53 | черновик |
| заголовок результата, on-ramp | USDT is in your wallet. | 23 | черновик |
| заголовок результата, off-ramp | Money is in your bank account. | 30 | черновик |
| подсказка «что попробовать» | Try another amount, rail or network. | 36 | черновик |
| вторая подсказка (показывается на Convert) | Stay on Convert for 30 seconds to see the quote update. | 55 | черновик `[CONFIRM: 30 секунд]` |

Результат «на счёте / в кошельке» появляется после последней строки консоли третьей станции вместе со статусом Completed.

## Industries (данные страницы; формат `Industries/items.ts`, кнопка у всех «Book a demo»)

Порядок и свечение: `industry-first` и `agencies` светлые (без `glow`), остальные 2–6 по кругу `violet`, `pink`, `orange`, `blue`, `green`. Открыт при загрузке: `fintech`. Каждая строка до 54 знаков (самая длинная 48).

| # (id) | Заголовок | Строка 1 (с точкой) | Строка 2 (без точки) | Знаков (заг. / 1 / 2) | Статус |
|---|---|---|---|---|---|
| 1 (`industry-first`) | Industry-first scenarios | On- and off-ramp shaped around your industry. | Choose the flow that looks like yours | 24 / 45 / 37 | черновик (заголовок общий) |
| 2 (`fintech`, violet) | Fintech and neobanks | Offer on- and off-ramp inside your product. | Connect once through the API | 19 / 43 / 30 | черновик `[CONFIRM: можно ли встраивать в продукт клиента; API]` |
| 3 (`crypto-native`, pink) | Crypto-native companies | Pay fiat costs from crypto you already hold. | Sell USDT, get money in your bank | 23 / 44 / 32 | черновик `[CONFIRM: монета]` |
| 4 (`treasury`, orange) | Treasury and finance teams | Move company funds between bank and wallet. | Lock the rate before each transfer | 26 / 43 / 34 | черновик `[CONFIRM: фиксация курса]` |
| 5 (`marketplaces`, blue) | Marketplaces and platforms | Fund user balances from bank transfers. | Pay users out to their local banks | 26 / 39 / 34 | черновик `[CONFIRM: сценарий для клиентов клиента; граница с Mass Payouts]` |
| 6 (`import-export`, green) | Import and export | Pay suppliers abroad in USDT. | Fund it from your own bank account | 17 / 29 / 34 | черновик `[CONFIRM: монета]` |
| 7 (`agencies`) | Agencies and freelancers | Turn crypto from clients into local currency. | Cash out to your bank by a local rail | 24 / 45 / 37 | черновик `[CONFIRM: рельс выплаты]` |

## Faq (формат `Faq/items.ts`: `question`, `lead`, `answer`)

Открыт при загрузке: `cost`. Где факта нет, ответ «подтвердим на демо». Порядок по важности для посетителя. Вопрос про safety в набор не вошёл (лицензия есть); при желании заменить `limits-time` или `wallet` на «How do you keep funds safe?» с главной слово в слово.

| # (id) | Вопрос | Lead | Ответ | Знаков (в / l / о) | Статус |
|---|---|---|---|---|---|
| 1 (`cost`) | How much does it cost? | Rates from 0.5%. | The final fee depends on your flow. Book a demo and we will walk you through it. | 22 / 16 / 80 | черновик `[CONFIRM: 0.5% с карточки главной (макет); комиссия или маржа курса; ступени; можно ли называть на странице]` |
| 2 (`rate`) | How long is the rate locked? | For 30 seconds. | Then the quote updates, so you confirm a current rate. | 28 / 15 / 54 | черновик `[CONFIRM: срок взят из решения дизайнера, не из продукта; поведение после истечения]` |
| 3 (`rails`) | Which banks and payment rails do you support? | 15+ direct local rails. | Tell us your country and currency, and we will confirm the rails for it. | 44 / 23 / 72 | черновик `[CONFIRM: «15+» из макета Global; относится ли к ramp; список по странам]` |
| 4 (`coins`) | Which coins and networks can I use? | Tell us what you hold. | We will confirm the coins and networks available for your flow during the demo. | 35 / 22 / 79 | черновик `[CONFIRM: монеты и сети]` |
| 5 (`wallet`) | Do I need my own wallet? | You choose the address and the network. | We will confirm the wallet options for your setup during the demo. | 24 / 39 / 66 | черновик `[CONFIRM: свой кошелёк или кошелёк Velant (Wallet на главной «Coming soon»)]` |
| 6 (`limits-time`) | How much can I convert, and how fast? | It depends on the rail and the network. | We will confirm limits and typical times for your setup during the demo. | 37 / 39 / 72 | черновик `[CONFIRM: лимиты, сроки по рельсам; слов «instant» нет]` |
| 7 (`start`) | How do I get started? | From 1 week. | Book a demo, pass KYB, and send your first live transaction. KYB is included as part of the onboarding process. | 21 / 12 / 111 | черновик (lead и ответ с главной / Crypto Processing) `[CONFIRM: «from 1 week» для ramp]` |
| 8 (`licence`) | What licence do you have? | — | Velant Pay operates under a Canadian MSB licence and works with licensed third-party financial providers. | 25 / — / 105 | макет (слово в слово, «licence» как на главной) |

## Cta

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `cta__title` | Ready to move money both ways? | 30 | черновик (рекомендую; запасной: «Ready to convert between fiat and crypto?», 41) |
| `cta__subtitle` | We'll walk through a transfer from bank to wallet and back. | 59 | черновик (запасной: «We'll show the rate, the fee, and the rails for your country.», 61, `[CONFIRM: рельсы]`) |
| `cta__button` | Book a demo | 11 | макет |

Бейджи баннера (по желанию, иначе остаются главные «Pay-in / Pay-out», «Multi-currency», «Instant KYB»; «Instant KYB» и «Pay-in / Pay-out» не повторяем, формулировку «Instant KYB» стоит проверить с продуктом): «On-ramp» (7), «Off-ramp» (8), «Local rails» (11). Статус: предложение.

## Meta

| Поле | Текст | Знаков | Статус |
|---|---|---|---|
| `meta.title` | Crypto on- and off-ramp — Velant Pay | 36 | черновик (как у Crypto Processing: название продукта с карточки главной) |
| `meta.description` | Convert between fiat and crypto with rates from 0.5%. Deposit from your bank, receive crypto in your wallet, or pay out to your bank. | 133 | черновик `[CONFIRM: 0.5%, payout на банк]` |

## Вопросы к продукту `[CONFIRM]`

1. **Что такое 0.5 %:** комиссия (как в сцене), маржа в курсе или то и другое? «From 0.5%» — это ступени по объёму? В какой валюте списывается комиссия (в отправленной, как в демо)? Можно ли называть число на странице?
2. Монеты и сети on- и off-ramp (USDT / USDC и Ethereum / Tron / Polygon взяты как значения картинки).
3. Фиатные валюты и рельсы по ним: относится ли «15+ direct local rails» к ramp; чем отличается «Bank transfer» от «Local rail» в продукте и как это назвать; нужны ли рельсы по странам из `pins.ts` (EUR: SEPA / INSTANT, USD: ACH / Fedwire / FedNow, BRL: Pix / TED) на странице.
4. Фиксация курса: 30 секунд (из решения дизайнера) реально? Когда фиксируется (до депозита, после, при подтверждении); что после истечения (новая котировка с другим курсом, нужно ли подтверждение). Курс в обе стороны один или есть спред.
5. Кто получатель: собственный адрес компании или кошелёк Velant; в off-ramp адрес приёма создаётся на каждый заказ?
6. Депозит в on-ramp: референс обязателен, платить можно только со счёта на имя компании, что при несовпадении суммы, позднем платеже, возврате.
7. Лимиты: минимум и максимум на перевод, дневные, зависимость от уровня KYB.
8. Сроки по рельсам и сетям (на странице без цифр и без «instant», пока нет подтверждения).
9. Как работает продукт для клиента: кабинет, API, встроенный виджет; названия и список событий `ramp.deposit.created / received`, `ramp.quote.locked / refreshed`, `ramp.convert.completed`, `ramp.crypto.sent / received`, `ramp.send.created`, `ramp.payout.sent`, `ramp.order.completed`.
10. Для кого: компания использует ramp для своих денег или может предлагать его своим клиентам (Industries 2, 5, 7)? От этого зависят hero («your bank») и Fintech.
11. Compliance: проверка адресов (AML / KYT), правила путешествия средств, источник средств; что можно сказать публично. Относится ли лицензия MSB к ramp; хранит ли Velant средства между шагами.
12. Что не поддерживается: карты, рекуррентные переводы, возвраты, отмена после блокировки курса (честный ответ на «что не покрыто»).
13. Нужны ли на странице ответы про безопасность (взять с главной слово в слово).
14. «Instant KYB» и «Pay-in / Pay-out» в бейджах главной: проверить формулировки.

## Допущения и что на решение дизайнера

- Выбор заголовков: hero A, блок A, Cta A (таблица выше). Если блок получит вариант B или C, hero B становится рекомендованным.
- Поле суммы «You send» в валюте отправки, умолчание 1,000.00 в обе стороны; в off-ramp середина сцены `1,000.00 USDT`, а не «1 000 €» (см. «Отличие от слов дизайнера»).
- Комиссия 0,5 % удерживается из отправленной суммы, конвертируется остаток; 199 точек из 200 приходят.
- 0,5 % трактуется как комиссия; «from 0.5%» с карточки главной в сцене показан как точное 0.5 % только для картинки.
- Демо-набор: EUR, USDT, Ethereum / Tron / Polygon, SEPA, курс 0.92 в обе стороны, вымышленные адреса и референс. Для картинки; в Faq и подзаголовках фактов из них нет, кроме названных в `[CONFIRM]`.
- 30 секунд, таймер и обновление котировки — решение дизайнера, в тексте помечены `[CONFIRM]`.
- Пользователь страницы — сама компания (её банк и её кошелёк), не её клиенты (`[CONFIRM]` вопрос 10).
- Название продукта в `meta` и на странице — как в карточке главной («Crypto on- and off-ramp»); в `hero` слова «ramp» нет: оно в `meta` и ссылке с главной.
- Станции Convert в двух направлениях — один компонент: меняются только суммы и строки Fee.
- Консоль на Convert в off-ramp пишет комиссию в USDT (`5.00 USDT`), а итог в EUR.

## Вёрстке и коду (для вызывающего, ничего не менялось)

- Строки и счётчики знаков выше; самые длинные: подзаголовок hero (103), строки панелей до 58, интро блока (98), ответ Faq «start» (111, взят с главной), ответ «licence» (105, с главной).
- Hero-заголовок в две строки: 18 + 26 (вторая длиннее; перенос закладывать явно).
- Консоль: самая длинная строка 44 знака (моноширинный шрифт): проверить перенос на телефоне.
- Появление по словам: только `ramp__flow-title`, `ramp__flow-intro`, hero, Industries / Faq / Cta; всё в `*-illustration` — исключение.
- Страницу добавить в `tests/reveal.spec.ts`; ссылка с карточки на главной (`Features/cards.ts`, сейчас `#crypto-ramp`) — после утверждения.

---

## Тексты (версия 2, 2026-10-26)

Статус: **черновик**. Написан по навыку `project-copywriting` после пересборки сцен: дизайнер не понял hero («1 точка = 5 €», «Fee», Flip). В `src/` ничего не менялось, Figma не открывалась. Финальным текст делает пользователь.
Знаки считаются с пробелами и знаками препинания (`→`, `·`, `…` по одному знаку). `[CONFIRM]` = нужен факт продукта: в `content.ts` текст пойдёт без факта, метка останется комментарием. Слов «Demo» на странице нет.

**Правило версии 2: посетитель понимает сцену за три секунды без легенды.** Поэтому: единиц вроде «1 dot = …» нет; подписи простые слова (Your bank, Your wallet, Our fee, You get); комиссия объяснена словами прямо в квитанции («Taken from what you send.»); сложные термины (on-ramp / off-ramp) идут с человеческим пояснением (buy crypto / sell crypto); Flip заменён сегментом из двух вариантов и кнопкой Convert.

**Что остаётся из версии 1 без изменений:** заголовок hero («Move money between / your bank and your wallet.»), Logos, Industries, Faq, Cta, Meta, формат демо-данных и таблица сумм (разд. «Формат демо-данных»). **Что устарело:** таблица «Hero-сцена «Каждая точка — 5 €»» (метки Bank / Fee / Flip / «1 dot = …»), весь блок `ramp__flow` (станции, консоль `ramp.*`, переключатель On-ramp / Off-ramp как блок). Допущение: `ramp__flow` заменён двумя блоками ниже (`ramp__routes` и `ramp__quote`); якорь вторичной кнопки hero «See how it works» теперь ведёт на `ramp__routes`.

Формат сумм: фиат кодом перед суммой (`EUR 1,000.00`), крипта кодом после (`1,081.52 USDT`). Комиссия 0,5 % из отправленной суммы; демо-курс в hero и в блоке маршрутов `1 USDT = EUR 0.92`; на графике блока цены курс колеблется вокруг 0.92 и показан с четырьмя знаками (`0.9213`).

### Карта вопросов посетителя (версия 2)

| Вопрос | Кто | Где отвечаем |
|---|---|---|
| Что это и в какую сторону идут деньги? | бизнес | Hero-сцена (€ слева, ₮ справа, сегмент направления с пояснением) |
| Сколько это стоит и откуда берётся комиссия? | бизнес, финансы | Hero-сцена (оранжевые точки у двери, строка «Our fee 0.5%» с пояснением), квитанция в блоке цены |
| Что я получу? | бизнес, финансы | Квитанция hero (You get), результат в блоке цены |
| Какие банки / рельсы и какие сети? | бизнес, финансы, разработчик | `ramp__routes` (9 рельсов, 3 сети, итог маршрута), Faq «rails», «coins» |
| Какой курс, можно ли его зафиксировать, что будет, если не успею? | финансы | `ramp__quote` (график, Lock, таймер, Quote expired), Faq «rate» |
| Как подключиться, за какой срок, лицензия, лимиты? | все | Faq, Cta (без изменений) |

### Структура страницы (версия 2)

Header → `ramp__hero` → Logos → `ramp__routes` → `ramp__quote` → Industries → Faq → Cta → Footer. Тексты внутри сцен (`*-illustration`) по словам не появляются; заголовки и подводки блоков, hero, Industries / Faq / Cta — по словам. Подписи, значения и статусы внутри сцен и квитанций — часть сцены (исключение, как было).

| Блок / `data-el` | Отвечает на | Заголовок | Что показывает |
|---|---|---|---|
| `ramp__hero` | что это, сколько стоит, что получу | Move money between / your bank and your wallet. (v1) | Облако точек в форме € слева перетекает через «дверь» в форму ₮ справа и обратно; около 0,5 % точек на двери оранжевые и улетают (комиссия); под картинкой направление, сумма, Convert и квитанция из четырёх строк |
| `ramp__routes` | рельсы и сети | Pick your route. | Слева 9 рельсов банка, справа 3 сети, посередине дверь Velant; выбор рельса и сети рисует точечный маршрут; строка итога |
| `ramp__quote` | курс, срок котировки, итог | Know the price before you pay. | Слева живой график курса из точек, справа квитанция; Lock the rate замораживает курс на 30 секунд, Confirm даёт результат |

### Заголовки: варианты и рекомендации (версия 2)

| Место | Вариант | Знаков | Рекомендация |
|---|---|---|---|
| `ramp__routes-title` | **A.** Pick your route. | 16 | **рекомендую**: рабочее имя; короткий глагол, повторяет интерактив (выбираешь рельс и сеть), ритм как у «Get paid. Reconciled.»; не повторяет «Money in. Money out.»; слабость: «route» сам по себе не говорит про банк и сеть (это делают колонки и подводка) |
| | B. Choose a rail. Choose a network. | 32 | точнее называет два выбора, ритм-повтор; но «rail» посетитель может не знать |
| | C. Connect your bank to a network. | 31 | про результат, понятно без терминов; слабее зовёт трогать, в off-ramp смысл обратный |
| `ramp__quote-title` | **A.** Know the price before you pay. | 30 | **рекомендую**: рабочее имя; прямая выгода (цена до оплаты), «price» проще, чем «rate»; слабость: обещает показ цены до оплаты `[CONFIRM]` |
| | B. See the rate. Lock it. Confirm. | 31 | называет три действия блока, ритм как у Invoicing; но без выгоды |
| | C. The rate moves. Your quote doesn't. | 35 | сильнее всех, но обещает «замороженную» котировку `[CONFIRM: фиксация 30 секунд]` |

Сочетание на странице: hero (v1) + «Pick your route.» + «Know the price before you pay.» + Cta «Ready to move money both ways?»: четыре разных ритма, «in / out» нигде не повторяется.

### Hero-сцена (внутри `*-illustration`, по словам не появляется)

Значения даны для умолчания; при другой сумме и направлении меняются по таблице «Формат демо-данных». Банк (€) слева, кошелёк (₮) справа всегда; меняется направление движения точек. Подзаголовок hero (рекомендую новый, он про картинку; версия 1: «Convert fiat to crypto and back. Send from your bank or wallet, see the rate and the fee, then confirm.», 103, в ней «confirm» относится к блоку цены, а не к hero):

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__hero-subtitle` | Turn fiat into crypto and back. See the fee and the rate before you convert. | 76 | черновик, замена версии 1 `[CONFIRM: комиссия и курс показываются до конвертации]` |

**Подписи под знаками и у двери**

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__hero-scene-bank-label` | Your bank | 9 | черновик |
| `ramp__hero-scene-bank-caption` | EUR | 3 | черновик `[CONFIRM: валюта]` |
| `ramp__hero-scene-wallet-label` | Your wallet | 11 | черновик |
| `ramp__hero-scene-wallet-caption` | USDT | 4 | черновик `[CONFIRM: монета]` |
| `ramp__hero-scene-door-label` (в покое) | Velant | 6 | черновик |
| `ramp__hero-scene-door-converting` (точки идут) | Converting… | 11 | черновик |
| `ramp__hero-scene-door-fee`, on-ramp (оранжевые точки улетают) | Our fee · EUR 5.00 | 18 | черновик `[CONFIRM: комиссия]` |
| `ramp__hero-scene-door-fee`, off-ramp | Our fee · 5.00 USDT | 19 | черновик |
| `ramp__hero-scene-door-done` (по окончании) | Done | 4 | черновик |
| `ramp__hero-scene-wallet-caption-done`, on-ramp (по желанию, вместо подписи, что пришло) | 1,081.52 USDT | 13 | черновик, суммы по таблице |
| `ramp__hero-scene-bank-caption-done`, off-ramp (по желанию) | EUR 915.40 | 10 | черновик |

**Управление под картинкой**

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__hero-scene-direction-on` (подпись варианта) | Bank → Wallet | 13 | черновик |
| `ramp__hero-scene-direction-on-caption` (мелкая подпись под вариантом) | On-ramp · buy crypto | 20 | черновик |
| `ramp__hero-scene-direction-off` | Wallet → Bank | 13 | черновик |
| `ramp__hero-scene-direction-off-caption` | Off-ramp · sell crypto | 22 | черновик |
| `ramp__hero-scene-direction-on-explain` (строка пояснения при выбранном варианте; вместо мелких подписей, если место есть) | On-ramp: send money, get crypto in your wallet. | 46 | черновик |
| `ramp__hero-scene-direction-off-explain` | Off-ramp: send crypto, get money in your bank. | 46 | черновик |
| `ramp__hero-scene-direction-label` (aria-label сегмента) | Direction | 9 | черновик |
| `ramp__hero-scene-amount-label` | You send | 8 | черновик |
| `ramp__hero-scene-amount-placeholder` | 0.00 | 4 | черновик |
| `ramp__hero-scene-amount-empty` (поле пустое; квитанция показывает «–») | Enter an amount to see what you get. | 36 | черновик |
| `ramp__hero-scene-convert` | Convert | 7 | черновик |
| `ramp__hero-scene-convert-busy` (пока точки идут) | Converting… | 11 | черновик |
| `ramp__hero-scene-convert-again` (после окончания) | Convert again | 13 | черновик |
| `ramp__hero-scene-hint` | Try another amount or direction, then press Convert. | 52 | черновик |
| `ramp__hero-scene-hint-narrow` | Try another amount or direction, then tap Convert. | 50 | черновик |
| `ramp__hero-scene-footnote` | Example amounts and rates. | 26 | черновик `[CONFIRM: нужна ли честная пометка, что суммы и курс для примера]` |

**Квитанция (четыре строки; пояснения мелким шрифтом под строками)**

| data-el | On-ramp (умолчание) | Off-ramp | Знаков | Статус |
|---|---|---|---|---|
| `ramp__hero-scene-receipt-send-label` | You send | You send | 8 | черновик |
| `ramp__hero-scene-receipt-send-value` | EUR 1,000.00 | 1,000.00 USDT | 12 / 13 | demo |
| `ramp__hero-scene-receipt-fee-label` | Our fee 0.5% | Our fee 0.5% | 12 | черновик `[CONFIRM: 0.5% — комиссия, не маржа курса]` |
| `ramp__hero-scene-receipt-fee-value` | EUR 5.00 | 5.00 USDT | 8 / 9 | demo |
| `ramp__hero-scene-receipt-fee-note` (комиссия словами) | Taken from what you send. | Taken from what you send. | 25 | черновик `[CONFIRM: берётся из отправленной суммы в обе стороны]` |
| `ramp__hero-scene-receipt-rate-label` | Rate | Rate | 4 | черновик |
| `ramp__hero-scene-receipt-rate-value` | 1 USDT = EUR 0.92 | 1 USDT = EUR 0.92 | 17 | demo `[CONFIRM]` |
| `ramp__hero-scene-receipt-get-label` | You get | You get | 7 | черновик |
| `ramp__hero-scene-receipt-get-value` | 1,081.52 USDT | EUR 915.40 | 13 / 10 | demo |
| `ramp__hero-scene-receipt-get-note` | After the fee, at this rate. | After the fee, at this rate. | 28 | черновик |

Лимиты на сумму в поле не называем (`[CONFIRM: min / max]`). Суммы для других значений поля — по таблице «Формат демо-данных».

### Блок `ramp__routes`

Три колонки: слева 9 рельсов (карточки из `Global/pins.ts`: флаг, код валюты, рельсы; **тексты берутся оттуда, не переписываются**), посередине дверь Velant, справа три сети с монетой USDT. Посетитель выбирает рельс и сеть, между ними рисуется маршрут из точек. Слева всегда банк, справа всегда сеть, при смене направления точки идут в обратную сторону.

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__routes-title` | Pick your route. | 16 | черновик (вариант A) |
| `ramp__routes-intro` | Choose a bank rail and a network, then see the route your money takes. | 70 | черновик |
| `ramp__routes-rails-heading` | Your bank rail | 14 | черновик |
| `ramp__routes-networks-heading` | Crypto network | 14 | черновик |
| `ramp__routes-rail-{id}` (карточка: код · рельсы) | из `Global/pins.ts`: CAD · Interac e-Transfer / EFT; USD · ACH / Fedwire / FedNow; EUR · SEPA / INSTANT; GEL · RTGS / RIPS; INR · IMPS / NEFT / UPI; BRL · Pix / TED; CLP · TEF; KGS · AZIPS / XKS; ARS · CBU / CVU | — | pins (не переписывать) `[CONFIRM: все ли девять рельсов работают для ramp]` |
| `ramp__routes-network-ethereum` · `-tron` · `-polygon` (название) | Ethereum · Tron · Polygon | 8 · 4 · 7 | черновик `[CONFIRM: сети]` |
| `ramp__routes-network-coin` (подпись под названием, у всех трёх) | USDT | 4 | черновик `[CONFIRM: монета]` |
| `ramp__routes-door-label` | Velant | 6 | черновик |
| `ramp__routes-door-caption`, on-ramp (код валюты выбранного рельса) | EUR → USDT | 10 | черновик (код подставляется: GBP → USDT и т. д.) |
| `ramp__routes-door-caption`, off-ramp | USDT → EUR | 10 | черновик |
| `ramp__routes-direction-on` | Bank → Wallet | 13 | черновик (как в hero) |
| `ramp__routes-direction-on-caption` | On-ramp · buy crypto | 20 | черновик (как в hero) |
| `ramp__routes-direction-off` | Wallet → Bank | 13 | черновик |
| `ramp__routes-direction-off-caption` | Off-ramp · sell crypto | 22 | черновик |
| `ramp__routes-summary-label` (метка строки итога) | Your route | 10 | черновик |
| `ramp__routes-summary`, on-ramp (шаблон `{code} via {rail} → USDT on {network}`) | EUR via SEPA → USDT on Tron | 27 | черновик |
| `ramp__routes-summary`, off-ramp (шаблон `USDT on {network} → {code} via {rail}`) | USDT on Tron → EUR via SEPA | 27 | черновик |
| `ramp__routes-hint` («что попробовать») | Pick another rail or network, or switch the direction. | 54 | черновик |
| `ramp__routes-hint-start` (по желанию, пока ничего не выбрано) | Pick a rail to start the route. | 31 | черновик |
| `ramp__routes-more` | 15+ direct local rails in total. | 32 | черновик `[CONFIRM: «15+» из макета Global; не вычитаем 9 карточек, см. «Допущения»]` |
| `ramp__routes-more` (запасной, если нужна цифра «ещё») | And {N} more rails. | 19 при N=2 | черновик `[CONFIRM: N]` |

**Две подписи под сценой («откуда платите / где получаете»)**

| data-el | On-ramp: метка · значение | Off-ramp: метка · значение | Знаков (метка / значение) | Статус |
|---|---|---|---|---|
| `ramp__routes-from` | You pay from · Your EUR bank account, via SEPA | You send from · Your wallet, on Tron | on: 12 / 31; off: 13 / 20 | черновик |
| `ramp__routes-to` | You get it in · Your wallet, on Tron | You get it in · Your EUR bank account, via SEPA | 13 / 20; 13 / 31 | черновик |

Код валюты, рельс и сеть подставляются из выбора. Самое длинное значение — для CAD: «Your CAD bank account, via Interac e-Transfer» (45 знаков). Рельс в итоге и подписях — **первый из строки рельсов карточки** (`rails.split(' / ')[0]`: SEPA, ACH, Interac e-Transfer, Pix…), см. «Допущения».

### Блок `ramp__quote`

Слева график курса из точек, который колеблется: текущее значение `1 USDT = EUR 0.9213`. Справа квитанция (сумма и направление из hero / блока маршрутов, `[CONFIRM]` допущение). Состояния: live → (Lock the rate) → locked с кольцом-таймером 30 секунд → Confirm (done) | Cancel (назад в live) | время вышло (expired, затем снова live).

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__quote-title` | Know the price before you pay. | 30 | черновик (вариант A) |
| `ramp__quote-intro` | Watch the rate move, lock it for 30 seconds, then confirm or cancel. | 68 | черновик `[CONFIRM: 30 секунд]` (запасной без числа: «Watch the rate move, lock it, then confirm or cancel.», 53) |

**График**

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__quote-chart-title` | Live rate | 9 | черновик `[CONFIRM: честность «live» (см. «Самое спорное»)]` |
| `ramp__quote-chart-subtitle` | USDT in EUR | 11 | черновик |
| `ramp__quote-chart-value` | 1 USDT = EUR 0.9213 | 19 | demo (обновляется) |
| `ramp__quote-chart-locked` (пока курс заморожен, подпись у линии) | Locked at 1 USDT = EUR 0.9213 | 29 | черновик |
| `ramp__quote-chart-label` (aria-label графика) | USDT to EUR rate chart | 22 | черновик |
| `ramp__quote-footnote` | Example amounts and rates. | 26 | черновик (как в hero) |

**Квитанция (метки)**

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `ramp__quote-receipt-title` | Your quote | 10 | черновик |
| `ramp__quote-receipt-send-label` | You send | 8 | черновик |
| `ramp__quote-receipt-fee-label` | Our fee 0.5% | 12 | черновик `[CONFIRM: 0.5%]` |
| `ramp__quote-receipt-fee-note` | Taken from what you send. | 25 | черновик |
| `ramp__quote-receipt-rate-label` | Rate | 4 | черновик |
| `ramp__quote-receipt-get-label` | You get | 7 | черновик |
| `ramp__quote-receipt-get-note` | After the fee, at this rate. | 28 | черновик |

**Состояния: подписи, кнопки, подсказки**

| Состояние | Что видно | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|---|
| live | метка состояния | `ramp__quote-state-live` | Live | 4 | черновик |
| live | кнопка | `ramp__quote-lock` | Lock the rate | 13 | черновик |
| live | подсказка | `ramp__quote-hint-live` | Lock the rate to hold this price for 30 seconds. | 48 | черновик `[CONFIRM: 30 секунд]` |
| locked | метка состояния | `ramp__quote-state-locked` | Locked | 6 | черновик |
| locked | таймер в кольце (идёт вниз) | `ramp__quote-timer` | 0:30 → 0:00 | 4 | черновик |
| locked | подпись у таймера | `ramp__quote-timer-caption` | to confirm | 10 | черновик |
| locked | кнопки | `ramp__quote-confirm` · `ramp__quote-cancel` | Confirm · Cancel | 7 · 6 | черновик |
| locked | подсказка | `ramp__quote-hint-locked` | The rate is held. Confirm before the timer ends. | 48 | черновик `[CONFIRM: что значит «held»: цена гарантирована до подтверждения]` |
| после Cancel (на 2 секунды) | уведомление | `ramp__quote-canceled` | Quote canceled. | 15 | черновик (US-написание) |
| expired | метка состояния | `ramp__quote-state-expired` | Expired | 7 | черновик |
| expired | сообщение (после него снова живой курс) | `ramp__quote-expired` | Quote expired. Rate updated. | 28 | черновик `[CONFIRM: после истечения курс обновляется автоматически]` |
| expired / live после | подсказка | `ramp__quote-hint-expired` | Lock the rate again to get a new quote. | 39 | черновик |
| done | метка состояния | `ramp__quote-state-done` | Confirmed | 9 | черновик |
| done | заголовок результата | `ramp__quote-result-title` | Quote confirmed. | 16 | черновик |
| done | результат, on-ramp | `ramp__quote-result` | EUR 1,000.00 became 1,081.52 USDT in your wallet. | 49 | черновик (из задания; суммы при курсе 0.92) |
| done | результат, off-ramp | `ramp__quote-result` | 1,000.00 USDT became EUR 915.40 in your bank account. | 53 | черновик (из задания; суммы при курсе 0.92) |
| done | кнопка | `ramp__quote-new` | New quote | 9 | черновик |
| done | подсказка | `ramp__quote-hint-done` | Start a new quote to try another amount. | 40 | черновик |

Шаблон результата: `{send} became {get} in your wallet.` / `{send} became {get} in your bank account.`, где `{get}` берётся по курсу, зафиксированному в момент Lock.

**Арифметика квитанции в блоке цены (сумма 1,000.00, комиссия 0,5 % сначала до цента).** Курс колеблется, поэтому «You get» тоже:

| Курс (1 USDT = EUR …) | On-ramp: `EUR 1,000.00` → fee `EUR 5.00` → get | Off-ramp: `1,000.00 USDT` → fee `5.00 USDT` → get |
|---|---|---|
| 0.92 (как в hero) | 995 ÷ 0.92 = **1,081.52 USDT** | 995 × 0.92 = **EUR 915.40** |
| 0.9213 (пример графика) | 995 ÷ 0.9213 = 1,079.9957 → **1,080.00 USDT** | 995 × 0.9213 = 916.6935 → **EUR 916.69** |

Строки результата из задания (`1,081.52 USDT`, `EUR 915.40`) верны только при курсе ровно 0.92. Если в момент Lock курс другой, в результате должны стоять числа по зафиксированному курсу (код считает, текст — шаблон); иначе квитанция и результат разойдутся.

### Допущения (версия 2)

1. Блок `ramp__flow` версии 1 заменён двумя блоками (`ramp__routes`, `ramp__quote`); вторичная кнопка hero ведёт на `ramp__routes`.
2. Комиссия 0,5 % удерживается из отправленной суммы в валюте отправки («Taken from what you send.»), конвертируется остаток; 0,5 % трактуется как комиссия, а не маржа в курсе `[CONFIRM]`.
3. Левая колонка блока маршрутов всегда банк, правая всегда сеть; в рельсе для итога берётся **первое** название из строки рельсов карточки (`pins.ts` не меняется). Если нужно показывать всю строку («SEPA / INSTANT»), итог станет длиннее (до ~50 знаков).
4. «15+ direct local rails» не вычитаем из девяти карточек: в девяти карточках уже 19 названий рельсов (CAD 2, USD 3, EUR 2, GEL 2, INR 3, BRL 2, CLP 1, KGS 2, ARS 2), значит «15+» считает что-то другое. Поэтому `ramp__routes-more` без «ещё N».
5. Сумма и направление общие для hero, блока маршрутов (направление) и блока цены (сумма, направление); в блоке цены есть тот же переключатель направления (тексты как в hero).
6. Hero и маршруты показывают курс `0.92`, блок цены `0.9213` и колебание вокруг 0.92: это разные картинки одного демо-курса.
7. Названия «Our fee», «Velant» у двери, «Your bank / Your wallet» — простые слова для картинки, не названия продуктов.
8. Пометка «Example amounts and rates.» — предложение: честнее для картинки с выдуманными суммами; если дизайнеру лишнее, убрать (тексты от неё не зависят).
9. Английский US: `canceled` (в отличие от «licence» на главной, которая взята оттуда слово в слово).

### Вопросы к продукту (версия 2, дополняют список выше)

1. 0.5 %: это комиссия или маржа в курсе; удерживается ли из отправленной суммы в обеих сторонах и в валюте отправки? Можно ли называть число на странице (сейчас «Our fee 0.5%», на карточке главной «rates from 0.5%»)?
2. Какие из девяти рельсов `pins.ts` (CAD, USD, EUR, GEL, INR, BRL, CLP, KGS, ARS) реально работают для on- и off-ramp; к чему относится «15+ direct local rails» (рельсы или страны); как называть рельс в итоге, если их несколько в карточке («SEPA / INSTANT»)?
3. Сети Ethereum / Tron / Polygon и монета USDT на ramp: правда ли; можно ли выбирать сеть в каждом платеже?
4. Курс: где берётся (живой источник или фиксированная котировка), один курс в обе стороны или есть спред; можно ли на странице писать «Live rate» (сейчас график симулирует колебание).
5. Фиксация: 30 секунд реально; что после истечения (новая котировка с новым курсом, нужно ли новое подтверждение); можно ли отменить зафиксированную котировку.
6. Что значит «Confirm»: создаётся заказ с этим курсом? Фраза «EUR 1,000.00 became 1,081.52 USDT in your wallet» читается как «уже на месте»: нужны ли срок и статус («Sending…»), чтобы не обещать мгновенность?
7. Для кого картинка: деньги самой компании или её клиентов (от этого «Your bank» и «Your wallet»).

### Самое спорное (на решение дизайнера и продукта)

1. **Слово «Live» и «Locked» на симуляции.** График выдуман; честнее «Example rate» или оставить «Live» с пометкой «Example amounts and rates.». Решает дизайнер вместе с продуктом.
2. **Результат из задания не сходится с «живым» курсом.** При курсе 0.9213 on-ramp даёт `1,080.00 USDT`, off-ramp `EUR 916.69`, а не `1,081.52 USDT` / `EUR 915.40`. Нужно либо считать по зафиксированному курсу (рекомендую), либо держать график ровно на 0.92 в момент Lock.
3. **«Our fee 0.5%» и «Taken from what you send.»** Это факт про комиссию, который продукт не подтверждал (в Faq «cost» мы его не раскрываем: «The final fee depends on your flow.»). Если продукт не согласен называть число, строка комиссии остаётся без «0.5%».
4. **«15+» против девяти карточек:** в строке «15+ direct local rails in total.» цифра из макета Global; пересчёт по карточкам даёт 19, поэтому цифру нельзя разбивать на «ещё N».
5. **Название блока «Pick your route.»:** слово «route» посетитель может читать как «трасса платежа» (для картинки хорошо) или как «выберите страну» (для текста хуже); выручает подводка. Вариант B точнее, но тяжелее для слова «rail».

### Вёрстке и коду (для вызывающего, ничего не менялось)

- Самые длинные строки версии 2: подзаголовок hero 76, пояснения направления 46 (две в зависимости от варианта), подсказка hero 52, значения подписей маршрута до 45 знаков (CAD), подсказки блока цены 48.
- Сегмент: подпись варианта (13) + мелкая подпись (20 / 22) в одну ячейку; на телефоне мелкую подпись можно заменить строкой пояснения под сегментом (46) или скрыть.
- Подпись у двери при комиссии (18 / 19 знаков) нужно место рядом с дверью и без налезания на точки; живёт только в момент вылета оранжевых точек.
- Квитанция: четыре строки плюс два пояснения (25 и 28) мелким шрифтом; для чисел нужен моноширинный или табличный шрифт цифр (суммы меняются при вводе).
- Итог маршрута (27) в одну строку, на телефоне допускается перенос по `→`.
- `ramp__routes-from` / `-to` подставляют код валюты, рельс и сеть; код берёт `rails.split(' / ')[0]` (в `pins.ts` не менять).
- «canceled» пишется в US-варианте.
- Тесты `tests/ramp.spec.ts` и `tests/reveal.spec.ts`: строки версии 1 («Flip», «1 dot = …», «Fee», станции, консоль) больше не должны проверяться; новые сцены в исключения «текст внутри `*-illustration`» не нужны, если подписи остаются внутри сцены.

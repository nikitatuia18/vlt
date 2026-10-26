# Страница Mass Payouts: структура и тексты (черновик, 2026-10-26)

Адрес: `/mass-payouts`. Статус: **черновик; код собран 2026-10-26 ([../blocks/mass-payouts.md](../blocks/mass-payouts.md)), вопросы решены «стандартно»; правки дизайнера 2026-10-26: hero с головами-фото вместо толпы точек, отчёт и скачивание в блоке 2 убраны (строки `report*` в тексте сцены больше не используются)**, написан по навыку `project-copywriting` (разд. 4а). Финальным текст делает пользователь; структуру и тексты утверждает он. В `src/` ничего не менялось, `content.ts` не создан, Figma не открывалась (у страницы нет кадра, `data-el` ниже — предложение, по образцу `ramp__*`, `invoicing__*`).
Образцы: [ramp.md](ramp.md) (раздел «Тексты (версия 2)»), [invoicing.md](invoicing.md), [crypto-processing.md](crypto-processing.md); как делать страницы — [../pages.md](../pages.md). Референс Mosta (mosta.io/mass-payouts) использован только как приёмы: четыре сценария «когда платишь многим и часто», путь «список → маршрут → статус по каждому», блок про API. Их заголовки и формулировки не взяты, в том числе «Pay 1. Pay 10,000. Same effort.» и «Upload. Route. Done.».
Знаки считаются с пробелами и знаками препинания (`·`, `→`, `…` — по одному знаку). **Считал вручную, возможна ошибка в 1 знак.** `[CONFIRM]` = нужен факт продукта: в `content.ts` текст пойдёт без факта, метка останется комментарием, на сайт она не попадает. Слов «Demo» на странице нет (кроме кнопки «Book a demo» и фразы «during the demo» в ответах Faq, как на других страницах).

Опора на факты (только из сайта, макета и кода): карточка главной «Mass Payouts. Automate global payouts to teams and partners in a single workflow.» (`Features/cards.ts`); иллюстрация карточки: один источник (монета) → три способа получить деньги `Bank transfer` / `Crypto` / `Card` → получатели (названия способов беру оттуда); цифры макета «99.9% Target SLA uptime», «15+ Direct local rails», «<1 sec API processing time» (`Global.tsx`); шаги подключения демо → KYB → запуск → первая боевая транзакция; «From 1 week»; лицензия слово в слово с главной. Названия рельсов — из `Global/pins.ts`: на странице названы только SEPA (EUR), Pix (BRL), UPI (INR), ACH (USD), TEF (CLP) — все пять есть в `pins.ts`, помечены `[CONFIRM: работают ли для выплат]`.

## Решено дизайнером (не пересматривается)
1. **Hero-сцена** (внутри `*-illustration`, по словам не появляется): слева облако точек = баланс компании (USDT), справа плавающие точки = получатели (антигравитация, как в hero Ramp). Ползунок числа получателей 10 / 250 / 1,000 / 10,000, кнопка «Pay everyone»: из баланса веером летят потоки, каждый получатель вспыхивает «Paid», счётчик растёт. Смысл без легенды: усилие одно, число любое. Единиц вроде «1 точка = N» нет.
2. **Блок 1 `mass-payouts__batch`** («Add everyone at once», рабочее имя): переключатель CSV / API / Schedule; CSV: drop-зона или «Use sample CSV», строки раскрываются в получателей с ✓, у одного ошибка, «Fix» исправляет, итог «Batch ready: N recipients · M countries»; API: печатается запрос (`TypedLog`) и приходит тот же батч; Schedule: «каждое 1-е число» и следующий запуск.
3. **Блок 2 `mass-payouts__routing`** («Everyone is paid their way», рабочее имя): доска полос Bank / Crypto / Card, получатели сами сортируются по стране, можно перетащить в другую полосу, кнопка «Pay», один сбой повторяется сам, итог «Paid N · Retried 1», «Download report».
4. Общие блоки: Logos без изменений, Industries (до 7, первая и последняя светлые), Faq (8), Cta со своим заголовком и тремя бейджами, Meta.
5. **Каждая сцена держит своё состояние**, общего выбора нет. Суммы и имена в блоках 1 и 2 — один и тот же пример батча, но блоки независимы; hero тоже независим.

## Формат демо-данных (единый для страницы)

- Фиат кодом **перед** суммой, крипта кодом **после**, запятая — разделитель тысяч, два знака: `EUR 1,104.00`, `1,200.00 USDT`. Комиссий в демо-суммах нет (`[CONFIRM]`); курс `1 USDT = EUR 0.92` (как на других страницах) на странице **не показывается**: источник и выплаты в USDT, EUR-эквивалент банковским получателям не пишем (для него нужны курс и комиссия). Если дизайнер захочет: EUR = USDT × 0.92 (1,200.00 → EUR 1,104.00; 600.00 → EUR 552.00).
- Источник средств **USDT** (решение дизайнера). На иллюстрации карточки главной значок монеты USDC; слой в Figma назван `Coin Logo/renBTC` (устаревшее имя, вопрос продукту 1).

### Пример батча (блоки 1 и 2; имена и страны вымышленные, **проверить на совпадения с реальными людьми и компаниями**)

Способ и рельс выбираются по стране (правило выдумано для картинки `[CONFIRM]`): DE, BR, IN, US, CL → Bank transfer; GE, AR → Crypto; FR, CA → Card.

| # | Получатель | Страна (код) | Способ | Рельс / сеть (чип) | Сумма | Особенность |
|---|---|---|---|---|---|---|
| 1 | Anna Keller | Germany (DE) | Bank transfer | SEPA | 1,200.00 USDT | в блоке 1: ошибка «IBAN missing», потом исправлена |
| 2 | Lucas Almeida | Brazil (BR) | Bank transfer | Pix | 900.00 USDT | |
| 3 | Priya Nair | India (IN) | Bank transfer | UPI | 800.00 USDT | в блоке 2: единственный сбой, повтор, затем Paid |
| 4 | Ethan Walker | United States (US) | Bank transfer | ACH | 1,500.00 USDT | |
| 5 | Sofia Reyes | Chile (CL) | Bank transfer | TEF | 700.00 USDT | |
| 6 | Giorgi Beridze | Georgia (GE) | Crypto | Tron | 1,500.00 USDT | |
| 7 | Mateo Fernandez | Argentina (AR) | Crypto | Tron | 900.00 USDT | |
| 8 | Chloe Martin | France (FR) | Card | — | 1,100.00 USDT | |
| 9 | Oliver Smith | Canada (CA) | Card | — | 800.00 USDT | |
| 10 | Jonas Weber | Germany (DE) | Bank transfer | SEPA | 600.00 USDT | |

Проверка арифметики таблицей (строки по полосам, затем итог):

| Полоса | Строки (#) | Сумма | Получателей |
|---|---|---|---|
| Bank transfer | 1, 2, 3, 4, 5, 10 | 1,200 + 900 + 800 + 1,500 + 700 + 600 = **5,700.00 USDT** | 6 |
| Crypto | 6, 7 | 1,500 + 900 = **2,400.00 USDT** | 2 |
| Card | 8, 9 | 1,100 + 800 = **1,900.00 USDT** | 2 |
| **Итого** | 1–10 | 5,700 + 2,400 + 1,900 = **10,000.00 USDT** | **10** |

Страны: Germany, Brazil, India, United States, Chile, Georgia, Argentina, France, Canada = **9** (Германия встречается дважды, строки 1 и 10). Сходится: 10 получателей, 9 стран, `10,000.00 USDT` в блоке 1 (итог), в блоке 2 (сумма полос и результат). Если посетитель перетащил получателя в другую полосу, код пересчитывает полосы: например, Lucas Almeida (900.00) из Bank в Card даёт Bank 5 · `4,800.00 USDT`, Card 3 · `2,800.00 USDT`; общий итог остаётся `10,000.00 USDT`.

### Hero-сцена: числа по положению ползунка (по 50.00 USDT каждому получателю, в сцене явно не подписано)

Баланс до оплаты: `1,000,000.00 USDT` во всех случаях. Страны: демо `[CONFIRM]`, не больше девяти (девять карточек `pins.ts`).

| Получателей | Итого | Страны | Баланс после | Арифметика |
|---|---|---|---|---|
| 10 | 500.00 USDT | 4 | 999,500.00 USDT | 10 × 50 = 500; 1,000,000 − 500 |
| 250 | 12,500.00 USDT | 7 | 987,500.00 USDT | 250 × 50 = 12,500; 1,000,000 − 12,500 |
| **1,000** (умолч.) | 50,000.00 USDT | 9 | 950,000.00 USDT | 1,000 × 50 = 50,000; 1,000,000 − 50,000 |
| 10,000 | 500,000.00 USDT | 9 | 500,000.00 USDT | 10,000 × 50 = 500,000; 1,000,000 − 500,000 |

Баланс доплат не требует (максимум 500,000.00 < 1,000,000.00): состояния «not enough balance» в сцене нет.

## Карта вопросов посетителя

| Вопрос | Кто | Где отвечаем |
|---|---|---|
| Что это и для кого? | бизнес | Hero (заголовок, подзаголовок, сцена), Industries |
| Справится ли с моим объёмом, 10 и 10 000 получателей? | бизнес, финансы | Hero-сцена (ползунок, счётчик), Faq «batch-size» (без цифр, `[CONFIRM]`) |
| Как загрузить список, что проверяется до оплаты? | бизнес, разработчик | `mass-payouts__batch` (CSV, API, Schedule, проверка ✓ и ошибка) |
| Можно ли платить по расписанию? | бизнес, финансы | `mass-payouts__batch` (Schedule) |
| Как получатели получают деньги, в каких странах? | бизнес, финансы | `mass-payouts__routing` (полосы Bank / Crypto / Card, рельсы), Faq «methods» |
| Могу ли я сам выбрать способ для человека? | бизнес | `mass-payouts__routing` (перетащить в другую полосу, «Chosen by you») |
| Что, если платёж не прошёл? | финансы, разработчик | `mass-payouts__routing` (Failed → Retrying → Paid, «Retried 1»); запасной Faq «errors» |
| Как сверить выплаты с бухгалтерией? | финансы | `mass-payouts__routing` (Download report), Faq «report» |
| Где получатели оставляют реквизиты? | бизнес, compliance | `mass-payouts__batch` (ошибка «IBAN missing»), Faq «details» |
| Как быстро получатели получат деньги? | финансы | Faq «timing» (без цифр, `[CONFIRM]`) |
| Сколько стоит? | бизнес | Faq «cost» |
| Как подключиться и за какой срок? | разработчик, бизнес | `mass-payouts__batch` (API), Faq «start», Cta |
| Безопасно ли, какая лицензия? | compliance | Faq «licence» (слово в слово с главной); «safety» в набор из 8 не вошёл |
| Что не покрыто (согласование, роли, лимиты)? | бизнес, compliance | нет ответа в фактах: «Вопросы к продукту» |

## Структура страницы

Header → `mass-payouts__hero` → Logos → `mass-payouts__batch` → `mass-payouts__routing` → Industries → Faq → Cta → Footer. Тексты внутри сцен (`*-illustration`) по словам не появляются (подписи, значения, статусы, таблицы). Заголовки и подводки блоков, hero (заголовок, подзаголовок, кнопки), Industries, Faq, Cta — по словам. Порядок: сначала масштаб (hero), потом как список попадает в продукт (batch), потом как каждый получает деньги и что остаётся бухгалтеру (routing): этот путь повторяет «список → способ → статус», но блоки называют результат, не шаги.

| Блок / `data-el` | Отвечает на | Заголовок (рекомендую) | Что показывает |
|---|---|---|---|
| `mass-payouts__hero` | что это, масштаб | One balance, / any number of recipients. | Большая карточка: слева облако точек = баланс (USDT), справа плавающие точки = получатели; под картинкой ползунок 10 / 250 / 1,000 / 10,000, «Pay everyone», счётчик «Paid 0 of 1,000», строка итога |
| `logos` | доверие | — | как на главной |
| `mass-payouts__batch` | как добавить список, что проверяется | Bring your list. We check it. | Переключатель CSV / API / Schedule; CSV: drop-зона и «Use sample CSV», 10 строк с проверкой ✓, ошибка «IBAN missing» и «Fix», итог «Batch ready»; API: печатается запрос, приходит тот же батч; Schedule: каждое 1-е число, следующий запуск |
| `mass-payouts__routing` | как платим, сбои, отчёт | Everyone is paid their way. | Доска из трёх полос; получатели сами садятся по стране, их можно перетащить; «Pay»: статусы, один сбой повторяется сам; итог «Paid 10 · Retried 1» и «Download report» |
| `industries` | для кого | общий («Industry-first scenarios») | данные ниже |
| `faq` | детали | общий | данные ниже |
| `cta` | следующий шаг | Ready to send your first batch? | данные ниже |

## Заголовки: варианты и рекомендации

| Место | Вариант | Знаков | Рекомендация |
|---|---|---|---|
| Hero (две строки) | A. Pay everyone you owe, / wherever they are. | 21 + 18 | самый человеческий; но «Pay everyone» совпадает с кнопкой сцены, а «wherever they are» обещает географию `[CONFIRM: страны]`; картинку (баланс, ползунок) не объясняет |
| | B. Pay your team and partners / in one workflow. | 26 + 16 | безопасно, почти пересказ карточки главной («to teams and partners in a single workflow»), слабый ритм |
| | **C.** One balance, / any number of recipients. | 12 + 25 | **рекомендую**: описывает картинку (баланс слева, получатели справа, ползунок), читается за три секунды без легенды (прошлый hero дизайнер не понял именно из-за этого); не повторяет ритм трёх готовых страниц; слабость: звучит как спецификация, «any number» обещает безлимитность `[CONFIRM: лимит батча]`, идея близка к hero Mosta (формулировка своя) |
| Блок `batch` | A. Add everyone at once. | 21 | рабочее имя дизайнера; хорошо, но «everyone» уже в блоке 2 и в кнопке |
| | **B.** Bring your list. We check it. | 29 | **рекомендую**: действие и доверие (проверка до оплаты, как ✓ и «IBAN missing» на экране), два коротких предложения, как «Get paid. Reconciled.»; слабость: «We check it» обещает проверку `[CONFIRM: какие проверки]` |
| | C. A file, a request, or a schedule. | 33 | называет три источника переключателя; нет выгоды |
| Блок `routing` | **A.** Everyone is paid their way. | 27 | **рекомендую**: рабочее имя; выгода получателя, согласуется с «Chosen by you / automatically»; слабость: «their way» читается как «получатель выбирает сам», а сцена выбирает по стране или вы `[CONFIRM: кто выбирает]`; «everyone» повторяется с кнопкой «Pay everyone» (так и задумано, эхо) |
| | B. Bank, crypto, or card. | 22 | называет полосы, ритм как у «Pick your route.»; без выгоды |
| | C. Same batch, three ways to get paid. | 35 | точно описывает иллюстрацию карточки главной (один источник, три способа); длиннее |
| Cta | A. Ready to pay your whole list? | 29 | рифмуется с блоком `batch` |
| | B. Ready to automate your payouts? | 31 | повторяет «Automate global payouts» карточки главной |
| | **C.** Ready to send your first batch? | 31 | **рекомендую**: называет следующий шаг; «batch» — слово блока 1 |

Сочетание на странице: hero C + «Bring your list. We check it.» + «Everyone is paid their way.» + Cta C. Повтор «everyone» только в блоке 2 и кнопке сцены; три разных ритма (две фразы, два предложения, утверждение). Если дизайнер возьмёт hero A, блок 2 лучше заменить на C, иначе «everyone» звучит дважды в заголовках.

## Hero

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `mass-payouts__hero-title` | One balance, / any number of recipients. (две строки) | 12 + 25 | черновик (вариант C) |
| `mass-payouts__hero-subtitle` | Pay teams and partners from one balance. Each recipient gets their money by bank transfer, in crypto, or on a card. | 115 | черновик `[CONFIRM: источник платежа — баланс в Velant; «on a card»: что значит Card]` |
| `mass-payouts__hero-cta-primary` | Book a demo | 11 | макет |
| `mass-payouts__hero-cta-secondary` (якорь на `mass-payouts__batch`) | See how it works | 16 | черновик (как на трёх готовых страницах) |

### Hero-сцена «баланс и получатели» (тексты внутри картинки, по словам не появляются)

Значения даны для умолчания 1,000 получателей; для других положений — по таблице «Hero-сцена: числа».

**Подписи сцены**

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `mass-payouts__hero-scene-balance-label` (слева, под облаком) | Your balance | 12 | черновик |
| `mass-payouts__hero-scene-balance-value` (до оплаты) | 1,000,000.00 USDT | 17 | demo `[CONFIRM: монета]` |
| `mass-payouts__hero-scene-balance-value` (после оплаты 1,000) | 950,000.00 USDT | 15 | demo (для 10 / 250 / 10,000: 999,500.00 / 987,500.00 / 500,000.00 USDT) |
| `mass-payouts__hero-scene-recipients-label` (справа, под облаком) | Your recipients | 15 | черновик |
| `mass-payouts__hero-scene-recipients-caption` | 9 countries | 11 | demo `[CONFIRM]` (по таблице: 4 / 7 / 9 / 9) |
| `mass-payouts__hero-scene-paid-flash` (на получателе при выплате) | Paid | 4 | черновик (видна на малых числах; на 1,000 и 10,000 только вспышка точки) |

**Управление под картинкой**

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `mass-payouts__hero-scene-slider-label` | Recipients | 10 | черновик |
| `mass-payouts__hero-scene-slider-value` (рядом с меткой) | 1,000 | 5 | demo |
| `mass-payouts__hero-scene-slider-ticks` | 10 · 250 · 1,000 · 10,000 | 2 · 3 · 5 · 6 | черновик (решение дизайнера) |
| `mass-payouts__hero-scene-slider-aria` | Number of recipients | 20 | черновик |
| `mass-payouts__hero-scene-pay` | Pay everyone | 12 | черновик (рабочее имя дизайнера; запасной с числом: «Pay 1,000 recipients», 20 / «Pay 10 recipients», 17 / «Pay 10,000 recipients», 21 — точнее, но ширина кнопки меняется) |
| `mass-payouts__hero-scene-pay-busy` (пока идёт выплата) | Paying… | 7 | черновик |
| `mass-payouts__hero-scene-pay-again` (после окончания) | Pay again | 9 | черновик (возвращает баланс и счётчик к началу и запускает выплату снова) |

**Счётчик и итог**

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `mass-payouts__hero-scene-counter` (до) | Paid 0 of 1,000 | 15 | черновик (при 10 / 250 / 10,000: «Paid 0 of 10» 11 / «of 250» 13 / «of 10,000» 17) |
| `mass-payouts__hero-scene-counter` (во время) | Paid 412 of 1,000 | 17 | черновик (число растёт до N) |
| `mass-payouts__hero-scene-counter` (после) | Paid 1,000 of 1,000 | 19 | черновик (самый длинный: «Paid 10,000 of 10,000», 21) |
| `mass-payouts__hero-scene-total` | Total 50,000.00 USDT · 1,000 recipients · 9 countries | 53 | demo, по таблице: 47 / 51 / 53 / 55 знаков |
| `mass-payouts__hero-scene-total` (все положения) | Total 500.00 USDT · 10 recipients · 4 countries · Total 12,500.00 USDT · 250 recipients · 7 countries · Total 500,000.00 USDT · 10,000 recipients · 9 countries | — | demo |

**Подсказки, состояния**

| Состояние | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| до оплаты (подсказка) | `mass-payouts__hero-scene-hint` | Choose how many recipients, then pay them all. | 46 | черновик (запасной: «Move the slider, then press Pay everyone.», 41) |
| узкий экран | `mass-payouts__hero-scene-hint-narrow` | то же | 46 | текст без «click»/«tap», отдельный вариант не нужен |
| идёт выплата (заменяет подсказку) | `mass-payouts__hero-scene-status-running` | Sending to 1,000 recipients… | 28 | черновик (при 10 / 10,000: 24 / 29) |
| выплата окончена (заменяет подсказку) | `mass-payouts__hero-scene-status-done` | One click paid 1,000 recipients. | 32 | черновик (при 10 / 10,000: 27 / 33) |
| ползунок во время выплаты | — | заблокирован, текста нет | — | решение дизайнера |
| после окончания, ползунок сдвинули | — | сцена возвращается к «до оплаты» для нового числа | — | решение дизайнера |
| reduced motion, вне экрана | — | стоит готовая картинка: «Paid 1,000 of 1,000», итог, баланс после | — | как на других страницах |
| пометка под сценой | `mass-payouts__hero-scene-footnote` | Example amounts and recipients. | 31 | черновик `[CONFIRM: нужна ли пометка про примерные суммы]` (на Ramp «Example amounts and rates.») |

Пустых состояний у ползунка нет (всегда одно из четырёх значений). Ошибок в сцене нет: баланс покрывает любую сумму.

## Блок `mass-payouts__batch`

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `mass-payouts__batch-title` | Bring your list. We check it. | 29 | черновик (вариант B) |
| `mass-payouts__batch-intro` | Upload a CSV file, send the list through the API, or run it on a schedule. Pick a source and see the batch appear. | 114 | черновик `[CONFIRM: три способа добавить список]` (запасной: «Pick a source and watch the list turn into a batch.», 51) |

### Переключатель источника (внутри сцены)

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `mass-payouts__batch-source-aria` | Batch source | 12 | черновик |
| `mass-payouts__batch-source-csv` · подпись | CSV · Upload a file | 3 · 13 | черновик |
| `mass-payouts__batch-source-api` · подпись | API · Send a request | 3 · 14 | черновик |
| `mass-payouts__batch-source-schedule` · подпись | Schedule · Run on repeat | 8 · 13 | черновик |

### CSV

Сырой файл (моноширинный, 11 строк; страны кодами, в таблице раскрываются в названия; суммы без кода, валюта указана подписью):

```
name,country,amount
Anna Keller,DE,1200.00
Lucas Almeida,BR,900.00
Priya Nair,IN,800.00
Ethan Walker,US,1500.00
Sofia Reyes,CL,700.00
Giorgi Beridze,GE,1500.00
Mateo Fernandez,AR,900.00
Chloe Martin,FR,1100.00
Oliver Smith,CA,800.00
Jonas Weber,DE,600.00
```

Самая длинная строка: `Mateo Fernandez,AR,900.00` (25 знаков). Реквизиты (IBAN, кошелёк, карта) в файле не передаются: где они берутся, неизвестно, `[CONFIRM]` вопрос 3. Суммы 1200.00 + 900.00 + 800.00 + 1500.00 + 700.00 + 1500.00 + 900.00 + 1100.00 + 800.00 + 600.00 = 10,000.00.

| Место | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| drop-зона | `mass-payouts__batch-drop-title` | Drop a CSV file here | 20 | черновик |
| | `mass-payouts__batch-drop-or` | or | 2 | черновик |
| кнопка | `mass-payouts__batch-sample` | Use sample CSV | 14 | черновик (решение дизайнера) |
| формат файла | `mass-payouts__batch-drop-format` | One row per recipient: name, country, amount. | 45 | черновик `[CONFIRM: колонки файла]` |
| валюта сумм | `mass-payouts__batch-drop-currency` | Amounts are in USDT. | 20 | черновик `[CONFIRM: валюта выплат]` |
| файл над drop-зоной | `mass-payouts__batch-drag-over` | Release to add the file | 23 | черновик |
| не CSV | `mass-payouts__batch-drop-wrong` | Only CSV files work here. Try the sample. | 41 | черновик |
| чип загруженного файла | `mass-payouts__batch-file` | payouts.csv · 10 rows | 21 | demo |
| сброшен свой файл (по желанию) | `mass-payouts__batch-file-note` | We show an example batch, not your file. | 40 | черновик (честная пометка, если сцена не разбирает настоящий файл; решение дизайнера) |
| заголовок таблицы | `mass-payouts__batch-table-title` | Recipients | 10 | черновик |
| колонки | `mass-payouts__batch-column-*` | Recipient · Country · Amount · Check | 9 · 7 · 6 · 5 | черновик |
| строки | см. «Пример батча» (имя, страна названием, сумма) | — | — | demo |
| проверка идёт | `mass-payouts__batch-row-checking` | Checking… | 9 | черновик (потом ✓, aria-label «Details valid», 13) |
| ошибка | `mass-payouts__batch-row-error` | IBAN missing | 12 | черновик (строка Anna Keller `[CONFIRM: какие проверки есть]`) |
| кнопка | `mass-payouts__batch-row-fix` | Fix | 3 | черновик (aria-label «Add the missing IBAN», 20) |
| после «Fix» | `mass-payouts__batch-row-fixed` | IBAN added | 10 | черновик |
| итог, пока есть ошибка | `mass-payouts__batch-summary` | 9 of 10 ready · 1 needs a fix | 29 | черновик |
| итог, строка 1 | `mass-payouts__batch-summary` | Batch ready: 10 recipients · 9 countries | 40 | черновик (шаблон: `Batch ready: {N} recipients · {M} countries`) |
| итог, строка 2 | `mass-payouts__batch-summary-total` | Total 10,000.00 USDT | 20 | demo |
| подсказка | `mass-payouts__batch-hint-csv` | Use the sample file, then fix the one that fails. | 49 | черновик |
| сброс | `mass-payouts__batch-reset` | Start over | 10 | черновик |

Ход: файл добавлен → 10 строк раскрываются по одной (`Checking…`) → 9 получают ✓, строка Anna Keller — `IBAN missing` и `Fix` → итог `9 of 10 ready · 1 needs a fix` → «Fix» → `IBAN added` ✓ → `Batch ready: 10 recipients · 9 countries` и `Total 10,000.00 USDT`.

### API

Запрос печатается через `TypedLog` (имена пути и полей выдуманы для картинки `[CONFIRM]`, как `POST /v1/payments` на Crypto Processing). Строки по порядку, в скобках знаки:

| # | Строка | Знаков |
|---|---|---|
| 1 | `POST /v1/payout-batches` | 23 |
| 2 | `{` | 1 |
| 3 | `  "currency": "USDT",` | 21 |
| 4 | `  "recipients": [` | 17 |
| 5 | `    { "name": "Anna Keller", "country": "DE", "amount": 1200.00 },` | 66 |
| 6 | `    { "name": "Lucas Almeida", "country": "BR", "amount": 900.00 },` | 67 |
| 7 | `    … 8 more` | 12 |
| 8 | `  ]` | 3 |
| 9 | `}` | 1 |
| ответ 1 | `< 201 "status": "validated"` | 27 |
| ответ 2 | `10 recipients · 9 countries · 10,000.00 USDT` | 44 |

После ответа появляется та же таблица, что в CSV, но у всех 10 строк ✓ (в запросе реквизиты Anna Keller есть, `IBAN missing` нет) и итог «Batch ready: 10 recipients · 9 countries» / «Total 10,000.00 USDT».

| Место | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| кнопка | `mass-payouts__batch-send` | Send request | 12 | черновик |
| пока печатается | `mass-payouts__batch-sending` | Sending… | 8 | черновик |
| после | `mass-payouts__batch-send-again` | Send again | 10 | черновик |
| подсказка | `mass-payouts__batch-hint-api` | Send the request and the batch comes back checked. | 50 | черновик |

### Schedule

| Место | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| метка и значение | `mass-payouts__batch-schedule-repeat` | Repeat · Every month on the 1st | 6 · 22 | черновик (решение дизайнера: 1-е число) |
| метка и значение | `mass-payouts__batch-schedule-next` | Next run · Nov 1, 09:00 | 8 · 12 | demo: дата — ближайшее 1-е число от сегодня, считает код (на 2026-10-26 это Nov 1); часовой пояс не пишем `[CONFIRM: время и часовой пояс]` |
| метка и значение | `mass-payouts__batch-schedule-batch` | Batch · 10 recipients · 10,000.00 USDT | 5 · 30 | demo |
| пояснение | `mass-payouts__batch-schedule-note` | Details are checked before every run. | 37 | черновик `[CONFIRM: повторная проверка перед запуском]` |
| кнопка | `mass-payouts__batch-schedule-save` | Save schedule | 13 | черновик |
| после нажатия | `mass-payouts__batch-schedule-saved` | Schedule saved | 14 | черновик (метка-галочка «Scheduled», 9, по желанию) |
| подсказка | `mass-payouts__batch-hint-schedule` | Save the schedule to see the next run. | 38 | черновик |
| по желанию (три будущих запуска) | `mass-payouts__batch-schedule-upcoming` | Next runs · Nov 1 · Dec 1 · Jan 1 | 9 · 21 | черновик (расширение; даты считает код) |

Что остаётся без ответа в Schedule: можно ли менять список между запусками, что при нехватке баланса, нужно ли подтверждение перед каждым запуском (вопрос 8 к продукту); в сцене этих состояний нет.

## Блок `mass-payouts__routing`

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `mass-payouts__routing-title` | Everyone is paid their way. | 27 | черновик (вариант A, рабочее имя) |
| `mass-payouts__routing-intro` | Recipients are sorted by country into bank, crypto and card payouts. Drag anyone to another lane, then pay. | 107 | черновик `[CONFIRM: сортировка по стране]` (запасной: «Pick the lane for each recipient, then pay.», 41) |

### Полосы

| Полоса (`data-el`) | Название | Подпись (что получает человек) | Знаков (назв. / подп.) | Статус |
|---|---|---|---|---|
| `mass-payouts__routing-lane-bank` | Bank transfer | They get local currency in their bank account. | 13 / 46 | черновик `[CONFIRM: валюта получателя и рельс]`; название — с иллюстрации главной |
| `mass-payouts__routing-lane-crypto` | Crypto | They get USDT in their own wallet. | 6 / 34 | черновик `[CONFIRM: монета, сети, кошелёк получателя]` |
| `mass-payouts__routing-lane-card` | Card | They get the money on a card. | 4 / 29 | черновик `[CONFIRM: что значит Card]` |

Названия полос взяты с иллюстрации карточки главной (`Bank transfer`, `Crypto`, `Card`); дизайнер писал «Bank / Crypto / Card» — короткая форма годится для чипа.

| Место | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| счётчик полосы (до оплаты) | `mass-payouts__routing-lane-count` | 6 recipients · 5,700.00 USDT | 28 | demo; шаблон `{n} recipients · {sum}`; при одном «1 recipient · 600.00 USDT» (25), при нуле «0 recipients» |
| счётчик полосы, Crypto / Card | | 2 recipients · 2,400.00 USDT / 2 recipients · 1,900.00 USDT | 28 | demo |
| пустая полоса (после перетаскивания) | `mass-payouts__routing-lane-empty` | Drop a recipient here | 21 | черновик |
| счётчик полосы (во время и после оплаты) | `mass-payouts__routing-lane-progress` | Paid 3 of 6 | 11 | черновик |

### Получатель на доске

Чип: имя · сумма · метка рельса (`SEPA`, `Pix`, `UPI`, `ACH`, `TEF` для Bank; `Tron` для Crypto; у Card метки нет). Источник — «Пример батча».

| Место | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| имя | `mass-payouts__routing-recipient-name` | Anna Keller (самое длинное: Mateo Fernandez, 15) | 11 | demo |
| сумма | `mass-payouts__routing-recipient-amount` | 1,200.00 USDT | 13 | demo |
| метка: выбрано автоматически | `mass-payouts__routing-recipient-auto` | Auto | 4 | черновик (полный текст для подсказки: «Chosen automatically», 20) |
| метка: выбрано вами | `mass-payouts__routing-recipient-manual` | By you | 6 | черновик (полный текст для подсказки: «Chosen by you», 13) |
| меню «переместить» (без мыши, на телефоне; шаблон) | `mass-payouts__routing-recipient-move` | Move to Bank transfer / Move to Crypto / Move to Card | 21 / 14 / 12 | черновик (a11y и клавиатура, `aria-label`) |
| легенда над доской | `mass-payouts__routing-legend` | Methods are chosen by country. | 30 | черновик `[CONFIRM: правило выбора]` |
| подсказка до оплаты | `mass-payouts__routing-hint` | Drag a recipient to another lane. | 33 | черновик (запасной: «Drag a recipient to another lane to choose how they are paid.», 61) |
| после первого перетаскивания | `mass-payouts__routing-hint-moved` | Moved. Drag more, or pay. | 25 | черновик |
| кнопка возврата к автовыбору | `mass-payouts__routing-reset-choices` | Reset choices | 13 | черновик (видна, если есть хотя бы один ручной выбор) |
| метод недоступен (по желанию, выключено по умолчанию) | `mass-payouts__routing-drop-refused` | Card is not available for Chile. | 32 | черновик `[CONFIRM: ограничения по странам]`; по умолчанию разрешено всё |
| сортировка идёт (первые секунды) | `mass-payouts__routing-sorting` | Sorting by country… | 19 | черновик (по желанию) |

### Оплата и статусы

Набор статусов: **Ready → Sending → Paid**, сбой **Failed → Retrying → Paid**. «Pending» не берём: рядом с «Ready» и «Sending» он читается как третье ожидание. «Sent» не берём: он обещает различие «ушло» и «дошло» между рельсами, которого мы не знаем `[CONFIRM]`; если продукт подтвердит два состояния, «Sent» встаёт между Sending и Paid.

| Место | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| кнопка | `mass-payouts__routing-pay` | Pay 10 recipients | 17 | черновик (рабочее имя дизайнера: «Pay», 3; рекомендую с числом, но «Pay» короче) |
| пока идёт | `mass-payouts__routing-pay-busy` | Paying… | 7 | черновик |
| статус до оплаты | `mass-payouts__routing-status-ready` | Ready | 5 | черновик |
| статус в пути | `mass-payouts__routing-status-sending` | Sending | 7 | черновик |
| статус | `mass-payouts__routing-status-paid` | Paid | 4 | черновик |
| статус сбоя | `mass-payouts__routing-status-failed` | Failed | 6 | черновик (одна секунда, у Priya Nair, затем Retrying) |
| статус повтора | `mass-payouts__routing-status-retrying` | Retrying | 8 | черновик |
| подсказка к Retrying | `mass-payouts__routing-status-retrying-note` | Retrying automatically | 22 | черновик `[CONFIRM: автоповтор]` |
| подсказка к Paid после повтора | `mass-payouts__routing-status-paid-retried` | Paid after a retry | 18 | черновик |
| общий счётчик | `mass-payouts__routing-progress` | Paid 7 of 10 | 12 | черновик (в конце «Paid 10 of 10», 13, заменяется результатом) |

Ход: полосы платят параллельно; на Priya Nair (Bank · UPI) один сбой: `Failed` (1 с) → `Retrying` → `Paid`; остальные `Ready` → `Sending` → `Paid`. Перетаскивание во время оплаты и после неё отключено.

### Результат и отчёт

| Место | data-el | Текст | Знаков | Статус |
|---|---|---|---|---|
| итог | `mass-payouts__routing-result-title` | Paid 10 · Retried 1 | 19 | черновик (формат дизайнера; «Paid 10» включает повторённый) |
| сумма | `mass-payouts__routing-result-text` | 10,000.00 USDT paid out in 9 countries. | 39 | demo (сходится с батчем блока 1) |
| про повтор | `mass-payouts__routing-result-retry` | 1 payment failed once and was retried automatically. | 52 | черновик `[CONFIRM: автоповтор]` |
| кнопка | `mass-payouts__routing-report` | Download report | 15 | черновик |
| подпись под кнопкой | `mass-payouts__routing-report-caption` | One file with every payout, for your accounting. | 48 | черновик `[CONFIRM: формат и поля отчёта]` |
| после нажатия | `mass-payouts__routing-report-done` | Downloaded | 10 | черновик |
| имя файла | `mass-payouts__routing-report-file` | payout-report.csv | 17 | черновик `[CONFIRM: формат]` |
| сброс | `mass-payouts__routing-reset` | Start over | 10 | черновик |

Содержимое файла отчёта (если дизайнер захочет настоящее скачивание; предложение, строки собирает код из таблицы «Пример батча»): шапка `recipient,country,method,rail,amount,currency,status,attempts`, строка примера `Priya Nair,India,Bank transfer,UPI,800.00,USDT,Paid,2`. Остальные 9 строк с `attempts` = 1. Итог по `amount` = 10,000.00.

## Industries (данные страницы; формат `Industries/items.ts`, кнопка у всех «Book a demo»)

Порядок и свечение: `industry-first` и `agencies` светлые (без `glow`), остальные 2–6 по кругу `violet`, `pink`, `orange`, `blue`, `green`. Открыт при загрузке: `payroll`. Каждая строка до 54 знаков (самая длинная 48). Отобраны сценарии «платишь многим и часто»; «импорт-экспорт и поставщики» не вошли: сценарий уже есть на Ramp («Pay suppliers abroad in USDT») и на главной («Export/Import»).

| # (id) | Заголовок | Строка 1 (с точкой) | Строка 2 (без точки) | Знаков (заг. / 1 / 2) | Статус |
|---|---|---|---|---|---|
| 1 (`industry-first`) | Industry-first scenarios | Mass payouts built around the people you pay. | Find the group that looks like yours | 24 / 45 / 36 | черновик (заголовок общий) |
| 2 (`payroll`, violet) | Payroll and contractors | Pay your team and contractors in many countries. | Run the same list every month | 23 / 48 / 29 | черновик `[CONFIRM: слово «payroll» и что оно значит юридически (мы не работодатель и не EOR?); на главной в Industries уже есть «Operations and payroll» с близким смыслом]` |
| 3 (`marketplaces`, pink) | Marketplaces and platforms | Pay out every seller in one run. | One report to reconcile every payout | 26 / 31 / 36 | черновик `[CONFIRM: отчёт для сверки]`; граница с Ramp (там «Pay users out to their local banks») |
| 4 (`partners`, orange) | Partner and referral programs | Pay affiliates and partners every month. | Send commissions by bank, crypto, or card | 29 / 40 / 41 | черновик |
| 5 (`gig`, blue) | Gig platforms and creators | Pay many workers and creators at once. | Add them from one file or one API call | 26 / 38 / 38 | черновик `[CONFIRM: API]` |
| 6 (`refunds`, green) | Refunds and rebates | Return money to many customers in one batch. | Keep a record of each payout | 19 / 44 / 28 | черновик `[CONFIRM: возвраты на карты и счета клиентов]` |
| 7 (`agencies`) | Agencies and studios | Pay freelancers when a project closes. | Send one list, not one transfer per person | 20 / 38 / 42 | черновик |

## Faq (формат `Faq/items.ts`: `question`, `lead`, `answer`)

Открыт при загрузке: `methods`. Порядок по важности для посетителя. Где факта нет, ответ «подтвердим на демо» (как на других страницах).

**Из девяти кандидатов выбраны восемь.** В набор не вошёл вопрос «What happens if a payment fails?»: на него отвечает сам блок `routing` (Failed → Retrying → Paid и итог «Retried 1»), а ответ в Faq всё равно был бы «подтвердим». Он готов как запасной (ниже) и заменяет `report` или `batch-size`, если дизайнер хочет. Вопрос про safety с главной не взят (лицензия есть).

| # (id) | Вопрос | Lead | Ответ | Знаков (в / l / о) | Статус |
|---|---|---|---|---|---|
| 1 (`methods`) | How do recipients get paid, and in which countries? | By bank transfer, in crypto, or on a card. | Bank payouts use direct local rails. Tell us your countries and we will confirm the methods for each. | 51 / 42 / 101 | черновик (lead — три способа с иллюстрации главной) `[CONFIRM: список стран и способов по странам; «15+ direct local rails» не вынесено: относится ли к выплатам]` |
| 2 (`details`) | How do recipients give their payment details? | Details are checked before you pay. | We will confirm during the demo how recipients share their details and which checks run. | 45 / 35 / 87 | черновик `[CONFIRM: как собираются реквизиты (колонка в файле, форма получателя, профиль) и какие проверки есть]` |
| 3 (`batch-size`) | How many recipients can I pay in one batch? | Tell us your volume. | We will confirm batch size limits for your setup during the demo. | 43 / 20 / 65 | черновик `[CONFIRM: лимит получателей и суммы в батче; отдельно для CSV и API]` |
| 4 (`timing`) | How fast do recipients get paid? | It depends on the method and the country. | We will confirm typical times for each method and country during the demo. | 32 / 41 / 73 | черновик `[CONFIRM: сроки по способам и странам; слова «instant» нет]` |
| 5 (`report`) | Can I get a report for my accountants? | Every batch has a report you can download. | We will confirm the report format and fields for your reconciliation during the demo. | 38 / 42 / 85 | черновик `[CONFIRM: отчёт есть; формат и поля]` |
| 6 (`cost`) | How much does it cost? | It depends on your flow. | Book a demo and we will walk you through the fees. | 22 / 24 / 50 | черновик `[CONFIRM: модель комиссий; число называть нельзя без продукта]` |
| 7 (`start`) | How do I connect, and how long does it take? | From 1 week. | Use a CSV file or the API. Book a demo, pass KYB, and send your first live transaction. | 44 / 12 / 86 | черновик (lead и вторая фраза с главной / Crypto Processing) `[CONFIRM: «from 1 week» для выплат; CSV и API]` |
| 8 (`licence`) | What licence do you have? | — | Velant Pay operates under a Canadian MSB licence and works with licensed third-party financial providers. | 25 / — / 105 | макет (слово в слово, «licence» как на главной) |

Запасной (в набор не входит):

| id | Вопрос | Lead | Ответ | Знаков (в / l / о) | Статус |
|---|---|---|---|---|---|
| `errors` | What happens if a payment fails? | You see a status for every payment. | We will confirm during the demo when a failed payment is retried and how you are notified. | 32 / 35 / 89 | черновик `[CONFIRM: статусы, правила повтора, уведомления, webhooks]` |

## Cta

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `cta__title` | Ready to send your first batch? | 31 | черновик (вариант C, рекомендую; запасные: «Ready to pay your whole list?», 29 / «Ready to automate your payouts?», 31) |
| `cta__subtitle` | We'll build a sample batch with your countries and payout methods. | 66 | черновик `[CONFIRM: что делаем на встрече]` (запасной: «We'll show how a list becomes paid recipients, country by country.», 66) |
| `cta__button` | Book a demo | 11 | макет |

Бейджи баннера (по желанию, иначе остаются главные «Pay-in / Pay-out», «Multi-currency», «Instant KYB»; «Instant KYB» и «Pay-in / Pay-out» не повторяем): «CSV or API» (10), «Bank, crypto, card» (18), «Payout report» (13). Статус: предложение `[CONFIRM: отчёт, CSV и API]`. Второй бейдж длиннее главных (16): если не влезет, «Many methods» (12).

## Meta

| Поле | Текст | Знаков | Статус |
|---|---|---|---|
| `meta.title` | Mass Payouts — Velant Pay | 25 | черновик (как у Crypto Processing: название продукта с карточки главной) |
| `meta.description` | Automate global payouts to teams and partners from one balance. Upload a list or use the API, and each recipient gets paid by bank, crypto, or card. | 148 | черновик `[CONFIRM: баланс, CSV и API]` |

## Вопросы к продукту `[CONFIRM]`

1. **Откуда платим и в какой монете.** Баланс в Velant в USDT (как в сцене) или платёж из банка / с кошелька клиента; почему на иллюстрации карточки главной значок USDC, слой назван renBTC; Wallet на главной «Coming soon»: нужен ли он для баланса.
2. **Лимиты.** Максимум получателей и сумма в батче (CSV и API отдельно); «any number» в hero допустимо? Размеры 10 / 250 / 1,000 / 10,000 в ползунке реальны?
3. **Реквизиты получателей.** Колонка в файле, форма получателя (ссылка), профиль в кабинете; какие проверки до оплаты (формат IBAN, совпадение имени, санкции, KYC получателя); что именно значит «IBAN missing» для не-банковских получателей (кошелёк, карта).
4. **Выбор способа.** Правило автоматического выбора (по стране? по предпочтению получателя? по настройке компании); может ли получатель выбрать сам; может ли компания переопределить вручную (как в сцене); ограничения по странам.
5. **Способы.** Bank transfer: валюта получателя (местная), кто конвертирует, какие рельсы (на странице названы SEPA, Pix, UPI, ACH, TEF из `pins.ts`); Crypto: монеты и сети (в сцене USDT / Tron); Card: что это (карта получателя, виртуальная карта, предоплаченная); относится ли «15+ direct local rails» к выплатам.
6. **Статусы и повторы.** Реальный набор статусов (Pending / Sent / Paid / Failed / Retrying); есть ли автоповтор, сколько попыток и через какое время; что после последней неудачи; уведомления и события (webhooks); имена событий и полей API (`POST /v1/payout-batches` и поля выдуманы).
7. **Отчёт.** Есть ли «Download report», формат (CSV, PDF), поля, интеграции с бухгалтерией.
8. **Schedule.** Какие расписания (дата месяца, неделя), часовой пояс, выходные, что при нехватке баланса, меняется ли список между запусками, нужно ли подтверждение перед запуском, роли (кто запускает и кто утверждает).
9. **Комиссии.** Модель (за выплату, процент, по способам, по странам), можно ли называть число на странице (в демо-суммах комиссий нет).
10. **Сроки выплат** по способам и странам (на странице без цифр и без «instant»).
11. **Слово «payroll».** Можно ли использовать (подразумевает ли это зарплатные обязательства: налоги, трудовые отношения); мы платим подрядчикам и партнёрам или также штатным сотрудникам.
12. **Compliance.** Относится ли лицензия MSB к выплатам; AML / санкции получателей; правила путешествия средств; что можно сказать публично.
13. **Для кого сценарии.** Возвраты и ребейты на карты и счета клиентов (Industries 6): поддерживаются ли.
14. **Что не покрыто.** Подтверждение платежей двумя людьми, рекуррентные выплаты со сменой суммы, отмена после отправки (честный ответ на «что не покрыто»).
15. **Срок запуска.** «From 1 week» для выплат, CSV и API.

## Допущения и что на решение дизайнера

- Выбор заголовков: hero C, блок `batch` B, блок `routing` A, Cta C (таблица выше). Если hero A, блок `routing` лучше C.
- Все суммы в USDT. Источник — USDT (решение дизайнера); значок USDC на карточке главной не трогаю. Курс 0.92 на странице не используется, EUR-эквивалент не показан.
- Hero: по 50.00 USDT на получателя, баланс 1,000,000.00 USDT, страны 4 / 7 / 9 / 9; число стран и суммы — только для картинки.
- Правило «способ по стране» (DE, BR, IN, US, CL → Bank; GE, AR → Crypto; FR, CA → Card) выдумано для картинки; пары страна → способ не факт о продукте.
- Рельсы названы только из `pins.ts` (SEPA, Pix, UPI, ACH, TEF), сеть Tron — демо; список поддерживаемого на странице не заявлен.
- Блок `batch`: реквизиты (IBAN) в файле не передаются; «IBAN missing» — предположение, что их хранит продукт; в API-запросе реквизитов нет.
- Статусы: Ready / Sending / Paid / Failed / Retrying (без «Pending» и «Sent»); один сбой у Priya Nair; «Paid 10» включает повторённый платёж.
- Hero: кнопка «Pay everyone» оставлена как у дизайнера; вариант с числом точнее, но ширина кнопки меняется. В блоке 2 — «Pay 10 recipients».
- Дата ближайшего запуска в Schedule считается кодом (на 2026-10-26: Nov 1); если нужна статика, подставить любое 1-е число.
- Пометка «Example amounts and recipients.» — предложение (как на Ramp); если лишняя, убрать.
- Английский US; слово «licence» в Faq — как на главной (слово в слово).
- «Payroll» оставлено в Industries 2 с пометкой: пересечение со словами главной («Operations and payroll») и юридическая нагрузка слова.

## Самое спорное (на решение дизайнера и продукта)

1. **Hero C близок по идее к Mosta** («Pay 1. Pay 10,000. Same effort.»): формулировка своя, но идея «число любое, усилие одно» заложена решением дизайнера. Hero A (`Pay everyone you owe, wherever they are.`) от идеи Mosta дальше, но не объясняет картинку.
2. **«Everyone is paid their way»** читается как выбор самого получателя; сцена выбирает по стране или вы. Если выбирает только компания, честнее вариант C («Same batch, three ways to get paid.»).
3. **«We check it» и «IBAN missing»** обещают проверку реквизитов; какие проверки реально есть, неизвестно.
4. **«Retried automatically» и «Download report»**: автоповтор и отчёт не подтверждены продуктом; в Faq на них «подтвердим на демо».
5. **USDT в сцене и USDC в карточке главной**: на главной значок USDC, на странице USDT; если продукт подтвердит одну монету, одну из картинок нужно выровнять.
6. **«Payroll»** в Industries: вопрос юридического смысла (вопрос 11).

## Вёрстке и коду (для вызывающего, ничего не менялось)

- Самые длинные строки: подзаголовок hero 115, подводка блока `batch` 114, подводка блока `routing` 107, ответ Faq «licence» 105 (с главной), ответ «methods» 101, строки API-запроса 66 и 67 (моноширинные, на телефоне нужен перенос или горизонтальная прокрутка внутри окна, не страницы), итог hero до 55, подпись полосы «Bank transfer» 46.
- Hero-заголовок в две строки: 12 + 25 (вторая длиннее; перенос закладывать явно, одно слово не должно висеть).
- Кнопка «Pay everyone» фиксированной ширины; если брать вариант с числом, «Pay 10,000 recipients» (21) шире «Pay 10 recipients» (17): держать `min-width` по самому длинному.
- Счётчик hero «Paid 10,000 of 10,000» (21 знак) меняется каждый кадр: цифры табличные (моноширинные), иначе текст дёргается.
- Баланс слева и подпись «9 countries» меняются по положению ползунка: резервировать ширину по самому длинному значению (`1,000,000.00 USDT`, 17).
- Таблица получателей (блок `batch`): 10 строк, колонки Recipient · Country · Amount · Check; на телефоне колонку Country можно скрыть. Самое длинное имя Mateo Fernandez (15), страна «United States» (13).
- Строка `IBAN missing` (12) и кнопка `Fix` (3) помещаются в колонку Check только если она шире остальных; на телефоне ошибка переносится под имя.
- Доска `routing`: чип получателя (имя · сумма · метка) до ~40 знаков, три полосы рядом на десктопе, друг под другом на телефоне; рядом с перетаскиванием нужно меню «Move to …» (клавиатура и телефон).
- Перетаскивание должно быть доступно с клавиатуры (`aria-label` «Move to Card» и т. п.).
- Тексты внутри сцен (`*-illustration`) по словам не появляются; заголовки и подводки блоков, hero, Industries, Faq, Cta — по словам. Страницу добавить в `tests/reveal.spec.ts`.
- Ссылка с карточки Mass Payouts на главной (`Features/cards.ts`, сейчас `#mass-payouts`) — после утверждения; пункт в подвале — по решению дизайнера.
- Общие элементы сцен: `TypedLog` (API-запрос блока `batch`), `Chip` / `Choice` (переключатель источника, чипы) из `src/components/ui/`; статусы получателей и таблицу — в папке страницы, `Status` из Invoicing можно переиспользовать, если он вынесен.

# Страница Invoicing: предложение по блокам (2026-10-23)

**Устарело (2026-10-23): структуру заменили (hero «кабинет», один блок из трёх шагов), страница собрана — см. [../blocks/invoicing.md](../blocks/invoicing.md); актуальные тексты — раздел «Тексты (версия 2)» ниже.** Всё между этим абзацем и ним — первое предложение, оставлено для истории.

Статус первого предложения: **заменено**. Адрес `/invoicing`. Как делать страницы продуктов — [../pages.md](../pages.md); образец — [crypto-processing.md](crypto-processing.md); разбор референса — [../research/mosta-invoicing.md](../research/mosta-invoicing.md).
Дизайнер написал «логику» страницы, но в чат она не попала: **прислать её первым сообщением нового чата** (текст или файл), предложение ниже подгоняем под неё.

## Исходное
- Карточка на главной: «Invoicing. Issue invoices in local currency and accept payments in crypto.» (`Features/cards.ts`, ссылка `#invoicing` пока заглушка).
- Идея страницы: **счёт в местной валюте, оплата в крипте**; весь путь счёта от создания до сверки.
- Каркас фиксирован: Header → hero (текст + большая карточка со сценой) → Logos → **два блока про продукт, в каждом интерактив** → Industries → Faq → Cta → Footer.

## Hero: сцена в большой карточке (три варианта, рекомендую A)
- **A. «Счёт и страница плательщика» (рекомендую).** Слева лист счёта (сумма в местной валюте, строки, срок), справа экран оплаты плательщика: та же сумма в USDT / USDC по курсу. Чипы валюты (EUR, GBP, BRL, INR, AED) меняют сумму на листе и на экране оплаты. Кнопка «Send invoice»: пунктирная линия, по ней бежит точка от листа к экрану; статусы Sent → Viewed → Paid, на листе печать «Paid». Идёт сама по кругу, посетитель меняет валюту и сумму. Показывает ядро идеи «в одной валюте, в другой». На карту из Crypto Processing не похоже.
- B. Колонки-статусы (Draft / Sent / Paid) с карточками счетов, которые переезжают по точечным дорожкам. Наглядно про состояние, но слабее про валюты, и похоже на блок 2.
- C. Стопка счетов из точек, которые «заполняются» по мере оплаты. Красиво, но без интерактива «что произошло».

## Блок 1: «Build an invoice» (`invoicing__builder`)
Сборка счёта руками, итог — готовая ссылка на оплату.
- **Что трогает посетитель:** валюта счёта (чипы), позиции (включить/выключить 3 готовые строки), срок (7 / 14 / 30 дней), налог (вкл/выкл).
- **Что видно сразу:** живой лист счёта (итог пересчитывается) и полоса «Payer pays»: сколько это в каждой монете (USDT, USDC) по одному demo-курсу, как в Crypto Processing.
- **Результат:** кнопка «Create payment link» печатает в консоли (`TypedLog`) `POST /v1/invoices` с выбранными значениями и ответ со ссылкой на оплату; под ней точечный QR или кнопка копирования. Заканчивается «ссылка готова, письмо ушло».
- Выбор (валюта, сумма) идёт дальше в блок 2, как монета и сеть в Crypto Processing.

## Блок 2: «From sent to reconciled» (`invoicing__tracking`)
Путь счёта после отправки: кто открыл, кто оплатил, как деньги нашли свой счёт.
- **Раскладка:** четыре колонки Sent → Viewed → Paid → Reconciled; в них карточки трёх счетов (клиенты, суммы в разных валютах). Счёт посетителя из блока 1 тоже здесь.
- **Что трогает посетитель:** кнопка «Pay as the client» на открытом счёте: выбор монеты → карточка едет в Paid по точечной дорожке; рядом строка события (`invoice.viewed`, `invoice.paid`, `invoice.reconciled` `[CONFIRM]`) и подпись «Your accounting system: matched to INV-1042».
- **Результат:** карточка в колонке Reconciled, счёт закрыт без ручной сверки. Автоплей: один из счетов оплачивается сам, пока блок на экране; reduced motion — итоговое состояние.
- Отличие от «Run a test payment»: там три колонки и один платёж, здесь несколько счетов и их состояние.

## Общие блоки со своими текстами
- **Industries** (до 7 карточек): Agencies and media buyers, SaaS and subscriptions, B2B trade and wholesale, Consulting and freelancers, Marketplaces and platforms, Logistics and freight (первая и последняя «светлые», остальные со свечением). Список уточнить у продукта.
- **Faq:** кто может заплатить и нужен ли ему аккаунт; в каких валютах выставлять; что с недоплатой и переплатой; фиксируется ли курс и сколько живёт ссылка; напоминания и регулярные счета; брендинг и PDF; как счёт связывается с платежом (вебхуки, API); комиссии; срок подключения; лицензия и безопасность (из Crypto Processing).
- **Cta:** вариант заголовка в духе «Ready to get paid in crypto?»; тексты пишет `copywriter`.

## Что делаем, когда дизайнер согласует
1. Прислать «логику» и выбрать вариант hero (A / B / C), поправить блоки 1–2.
2. `copywriter`: карта вопросов посетителя, структура, тексты, вопросы к продукту → этот файл (раздел «Тексты»), метки `[CONFIRM]`, вариантов заголовка несколько.
3. Код: `src/pages/invoicing/` (`content.ts`, `InvoicingPage.tsx`, сцена hero, два блока), адрес в `App.tsx`, `tests/invoicing.spec.ts` по образцу crypto-processing, страница в проверку «весь текст по словам» в `tests/reveal.spec.ts`; замер ×4 CPU для canvas-сцен.
4. **Общие элементы в UI Kit:** `TypedLog` (консоль), `Chip` / `Choice` (чипы выбора), `Status` во втором блоке встречаются снова: по правилу проекта вынести из `src/pages/crypto-processing/` в `src/components/ui/`, добавить в `/ui-kit` и `docs/ui-kit.md`.
5. Ссылка с карточки Invoicing на главной (`Features/cards.ts`: `href('invoicing')`) включается после утверждения.

## Вопросы к продукту `[CONFIRM]` (для copywriter)
Валюты счетов и валюта получения; монеты и сети для оплаты; недоплата, переплата, частичная оплата; фиксация курса и срок жизни ссылки; нужен ли плательщику аккаунт; напоминания и регулярные счета; PDF и брендинг; налоги и НДС в счёте; API и кабинет (что из этого есть); события вебхуков; комиссии; сроки подключения.

---

## Тексты (версия 2, 2026-10-23)

Статус: **черновик**. Написан по навыку `project-copywriting` (разд. 4а) под новую структуру дизайнера: hero с «кабинетом», один блок из трёх шагов (у каждого свой экран), затем Industries, Faq, Cta. В `src/` ничего не менялось, `content.ts` не создан. Финальным текст делает пользователь.
Знаки считаются с пробелами и знаками препинания. `[CONFIRM]` = нужен факт продукта (в `content.ts` текст пойдёт без факта, метка останется комментарием). Слов «Demo» на странице нет (кроме кнопки «Book a demo» и фразы «during the demo» в ответах Faq, как на странице Crypto Processing).
Приёмы из разбора Mosta (`../research/mosta-invoicing.md`): ядро «в одной валюте выставил, в другой оплатили», шаги как глаголы, два свойства доверия (видно, когда открыли; платёж сам находит счёт), экран продукта вместо абстракции. Их тексты не использованы; заголовок «Build the invoice.» совпадает с заголовком шага у Mosta, поэтому в рекомендации его нет (см. ниже).
**Устарело в старом предложении выше:** вариант hero A/B/C (hero теперь «кабинет»), «Блок 1 Build an invoice» и «Блок 2 From sent to reconciled» (заменены одним блоком из трёх шагов), заголовок Cta «в духе…». Состав Industries и Faq из старого предложения сохранён и доработан.

### Формат демо-данных (единый на все сцены)

- Валюта счёта пишется кодом **перед** суммой, крипта кодом **после**: `EUR 2,400.00`, `2,608.70 USDT`. Разделитель тысяч запятая, два знака. Это отличается от Crypto Processing (там `920.00 EUR`): решение дизайнера для этой страницы.
- Демо-курсы, **только для картинки** `[CONFIRM: валюты и источник курса]`: `1 USDT = EUR 0.92`, `GBP 0.79`, `BRL 5.50`, `INR 83.00`, `AED 3.67`. EUR-курс 0.92 тот же, что в Crypto Processing. Сумма в USDT = сумма счёта ÷ курс, два знака. Комиссий в суммах нет.
- Открытый счёт (hero и все три шага): **INV-1042**, клиент **Northwind Media**, срок **Due in 14 days** (как «Due in 7 days» на иллюстрации главной).

| Позиция счёта (EUR) | Сумма |
|---|---|
| Media planning | EUR 1,200.00 |
| Creative production | EUR 600.00 |
| Reporting dashboard | EUR 200.00 |
| Subtotal | EUR 2,000.00 |
| Tax 20% (ставка для картинки `[CONFIRM: налоги в счёте]`) | EUR 400.00 |
| **Total** | **EUR 2,400.00** = **2,608.70 USDT** |

Проверки для кода шага 1: все позиции без налога = `EUR 2,000.00` = `2,173.91 USDT`; без «Reporting dashboard», с налогом = `EUR 2,160.00` = `2,347.83 USDT`. При смене валюты позиции пересчитываются по демо-курсам (сумма EUR ÷ 0.92 × курс валюты, два знака), поэтому итог в USDT остаётся тем же (`2,608.70 USDT`): та же работа, другая валюта счёта, та же оплата. Если дизайнеру нужны «круглые» суммы в каждой валюте, это решение по картинке, не по тексту.

Список счетов в hero (клиенты вымышленные, нейтральные: **проверить на совпадения с реальными компаниями**; Northwind взят из задания):

| № | Клиент | Сумма | USDT (курс) | Статус | Кому подходит (сценарий) |
|---|---|---|---|---|---|
| INV-1042 | Northwind Media | EUR 2,400.00 | 2,608.70 USDT (0.92) | Pending, в ходе сцены становится Paid | агентство |
| INV-1041 | Bluepeak Studio | GBP 2,000.00 | 2,531.65 USDT (0.79) | Pending | агентство |
| INV-1040 | Harbor Labs | BRL 12,500.00 | 2,272.73 USDT (5.50) | Paid | SaaS |
| INV-1039 | Atlas Trading | INR 200,000.00 | 2,409.64 USDT (83.00) | Pending | опт |
| INV-1038 | Meridian Consulting | EUR 4,800.00 | 5,217.39 USDT (0.92) | Paid | консалтинг |
| INV-1037 | Cedarline Freight | AED 9,500.00 | 2,588.56 USDT (3.67) | Overdue | логистика |

### Карта вопросов посетителя

| Вопрос | Кто | Где отвечаем |
|---|---|---|
| Что это и для кого? | бизнес | Hero (заголовок, подзаголовок, «кабинет»), Industries |
| Что клиент увидит и в какой валюте платит? | бизнес | Hero (сумма в двух валютах), шаг 02 (страница плательщика), шаг 03 |
| Как выставить счёт, что настраивается? | бизнес, финансы | Шаг 01 Create |
| Как клиент получит счёт, я узнаю, что он его открыл? | бизнес | Шаг 02 Send |
| Как я узнаю, что оплатили, и как это попадёт в учёт? | финансы, разработчик | Шаг 03 Get paid (сверка, события), Faq «matched» |
| Кто может платить, нужен ли аккаунт? | бизнес | Faq 1 |
| Какие валюты, монеты, сети? | бизнес, финансы | Faq 2 (без списка, `[CONFIRM]`) |
| Недоплата, переплата, курс, срок ссылки? | финансы | Faq 3–4 |
| Напоминания, регулярные счета, PDF, брендинг? | бизнес | Faq 5–6 |
| API, события, подключение к учёту? | разработчик | Шаг 03 (события), Faq 7 |
| Сколько стоит и как быстро запуститься? | все | Faq 8, Cta |
| Безопасность и лицензия? | compliance | не в этом наборе из 8 вопросов; при необходимости взять «safety» и «licence» с главной (слово в слово) |
| Что не покрыто? | бизнес | нет ответа: вопросы к продукту |

### Структура страницы

Header → `invoicing__hero` → Logos → `invoicing__steps` → Industries → Faq → Cta → Footer. Тексты внутри сцен (`*-illustration`) — часть интерактива и по словам не появляются (по согласию дизайнера, как на Crypto Processing).

| Блок / `data-el` | Отвечает на | Заголовок | Что показывает |
|---|---|---|---|
| `invoicing__hero` | что это, что клиент платит | Invoice in local currency. / Let clients pay in crypto. | Большая карточка-«кабинет»: список счетов в разных валютах, справа открытый INV-1042 (сумма в валюте клиента и в USDT, цепочка статусов, ссылка на оплату) |
| `invoicing__steps` (шаги `invoicing__step-create`, `-send`, `-get-paid`) | как это работает по шагам | Issue an invoice, start to finish. | Три экрана-интерактива, по одному на шаг; результат шага 03: статус Reconciled и событие в вашу систему |
| `industries`, `faq`, `cta` | для кого, детали, следующий шаг | общие | данные страницы ниже |

### Заголовки: варианты и рекомендации

| Место | Вариант | Знаков | Рекомендация |
|---|---|---|---|
| Hero (две строки) | **A.** Invoice in local currency. / Let clients pay in crypto. | 26 + 26 | **рекомендую**: называет оба конца идеи, строки одной длины, не повторяет «Banking for today…» и «Accept crypto payments»; «Let clients pay» не обещает, в чём получает компания (`[CONFIRM]`) |
| | B. One invoice, two currencies. / The payment finds its invoice. | 28 + 30 | сильная идея про сверку, но две мысли и слабее про «крипту» |
| | C. Their currency on the invoice. / Crypto on the payment. | 30 + 22 | самая короткая, параллелизм; «their» без контекста читается хуже |
| Блок шагов | A. One invoice, three steps. | 25 | считает шаги, нет действия; «One payment, three steps» на Crypto Processing не взяли |
| | **B.** Issue an invoice, start to finish. | 34 | **рекомендую**: действие и обещание целого пути, длина как у «From first payment to final payout.» (35) |
| | C. Try an invoice, start to finish. | 32 | зовёт трогать, но «try an invoice» звучит неловко |
| Шаг 01 Create | **A.** Build it in their currency. | 27 | **рекомендую**: несёт ядро идеи; «it» опирается на метку «01 Create» |
| | B. Fill in the invoice. | 20 | нейтрально, не про валюту |
| | C. Start with the client's currency. | 33 | точнее, длиннее |
| Шаг 02 Send | **B.** Send it. See when it's opened. | 30 | **рекомендую**: два коротких предложения, как «Get paid. Reconciled.», называет первое свойство доверия |
| | A. Send it. | 8 | слишком пусто |
| | C. Send it and know when it's read. | 32 | «read» точнее про письмо, чем про ссылку |
| Шаг 03 Get paid | **A.** Get paid. Reconciled. | 21 | **рекомендую**: короткий результат; «Reconciled» совпадает со статусом на экране |
| | B. They pay. The invoice closes itself. | 36 | живее, длиннее |
| | C. Paid in crypto. Reconciled. | 27 | повторяет крипту из hero |

Ритм шагов: «Build it in their currency.» / «Send it. See when it's opened.» / «Get paid. Reconciled.»: у каждого одна мысль, не повторяют ритм главной. В Crypto Processing блоки названы повелительно; здесь заголовок блока (B) тоже глагол, шаги короче. Если дизайнеру покажется много повелительного, замена блока: A.

### Hero

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `invoicing__hero-title` | Invoice in local currency. / Let clients pay in crypto. (две строки) | 26 + 26 | черновик (вариант A) |
| `invoicing__hero-subtitle` | Bill your client in their own currency. They pay in crypto, the payment finds its invoice, and you see every status on the way. | 127 | черновик `[CONFIRM: что получает компания (валюта, куда); где видны статусы: кабинет, API]` |
| `invoicing__hero-cta-primary` | Book a demo | 11 | макет |
| `invoicing__hero-cta-secondary` (якорь на `invoicing__steps`) | See how it works | 16 | черновик (как на Crypto Processing) |

### Hero-сцена «кабинет» (тексты внутри картинки, по словам не появляются)

| Место | Текст | Знаков | Статус |
|---|---|---|---|
| заголовок списка | Invoices | 8 | черновик |
| колонки | Invoice · Client · Amount · Status | 7 · 6 · 6 · 6 | черновик |
| статусы в списке | Paid · Pending · Overdue | 4 · 7 · 7 | черновик |
| строки списка | см. таблицу «Список счетов в hero» выше | — | demo |
| открытый счёт, заголовок | INV-1042 | 8 | demo |
| клиент | Northwind Media | 15 | demo |
| срок | Due in 14 days | 14 | demo |
| подпись суммы | Amount | 6 | черновик |
| сумма | EUR 2,400.00 | 12 | demo |
| подпись второй суммы | Client pays | 11 | черновик |
| вторая сумма | 2,608.70 USDT | 13 | demo |
| курс | 1 USDT = EUR 0.92 | 17 | demo `[CONFIRM]` |
| цепочка статусов | Created · Sent · Viewed · Paid · Reconciled | 7 · 4 · 6 · 4 · 10 | черновик |
| подпись ссылки | Payment link | 12 | черновик |
| ссылка | pay.velantpay.com/inv-1042 | 26 | demo `[CONFIRM: домен ссылки, это заглушка для картинки]` |
| кнопка копирования | Copy link / Copied | 9 / 6 | черновик |
| кнопка PDF | Download PDF | 12 | черновик `[CONFIRM: PDF]` |
| подсказка | Pick an invoice to see it in two currencies. | 44 | черновик (только если строки кликабельны) |
| подсказка, узкий экран | Tap an invoice to see it in two currencies. | 43 | черновик |

### Блок шагов `invoicing__steps`

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `invoicing__steps-title` | Issue an invoice, start to finish. | 34 | черновик (вариант B) |
| `invoicing__steps-intro` | Build an invoice, send it, and watch the payment find it. Every step is a screen you can click. | 95 | черновик |

Допущение: счёт INV-1042 из шага 01 (если посетитель меняет валюту и позиции) переходит в шаги 02 и 03. Если дизайнер делает шаги независимыми, тексты не меняются: в шагах 02–03 всегда INV-1042 по таблице выше.

Для каждого шага: метка (`…-number`), название (`…-name`), заголовок (`…-title`), текст (`…-text`).

| Шаг | Метка · название | Заголовок | Текст | Знаков (метка / назв. / заг. / текст) | Статус |
|---|---|---|---|---|---|
| `invoicing__step-create` | 01 · Create | Build it in their currency. | Choose the client's currency, add the lines, set a due date and tax. The total shows in two currencies. | 2 / 6 / 27 / 103 | черновик `[CONFIRM: налоги в счёте]` |
| `invoicing__step-send` | 02 · Send | Send it. See when it's opened. | Send a payment link, an email, or a PDF. You see the moment the client opens the invoice. | 2 / 4 / 30 / 89 | черновик `[CONFIRM: ссылка, e-mail, PDF; отслеживание «открыт»]` |
| `invoicing__step-get-paid` | 03 · Get paid | Get paid. Reconciled. | The client pays in crypto. The payment finds its invoice, the status becomes Reconciled, and your system gets an event. | 2 / 8 / 21 / 119 | черновик `[CONFIRM: события, сверка, как система узнаёт о платеже]` |

#### Шаг 01 Create: экран «New invoice»

| Место | Текст | Знаков |
|---|---|---|
| заголовок экрана | New invoice | 11 |
| поле клиента | Client: Northwind Media | 6 · 15 |
| поле номера | Invoice no.: INV-1042 | 11 · 8 |
| поле валюты (чипы) | Currency: EUR · GBP · BRL · INR · AED | 8 · 3 |
| позиции | Items: Media planning (14) · Creative production (19) · Reporting dashboard (19); суммы по таблице выше | 5 |
| срок (чипы) | Due in: 7 days · 14 days · 30 days | 6 · 6/7/7 |
| налог (переключатель) | Tax 20% | 7 |
| строки итога | Subtotal · Tax 20% · Total | 8 · 7 · 5 |
| вторая валюта | Client pays: 2,608.70 USDT | 11 · 13 |
| курс | Rate: 1 USDT = EUR 0.92 | 4 · 17 |
| срок на листе | Due in 14 days | 14 |
| кнопка | Create invoice | 14 |
| после нажатия (статус) | Invoice created · Created | 15 · 7 |
| ссылка | Payment link: pay.velantpay.com/inv-1042 | 12 · 26 |
| копирование | Copy link → Copied | 9 → 6 |
| подсказка «что попробовать» | Change the currency or the items and watch both totals update. | 62 |

#### Шаг 02 Send: экран «Send invoice» и страница плательщика

| Место | Текст | Знаков |
|---|---|---|
| заголовок экрана | Send invoice | 12 |
| способ (чипы) | Send as: Payment link · Email · PDF | 7 · 12 / 5 / 3 |
| получатель | To: Northwind Media | 2 · 15 |
| кнопка | Send invoice → Sending… → Sent | 12 → 8 → 4 |
| статус до открытия | Not opened yet | 14 |
| время отправки | Sent 10:02 | 10 |
| кнопка «открыть как клиент» | Open as client | 14 |
| время открытия | Viewed 10:14 | 12 |
| уведомление отправителю | Northwind Media opened INV-1042 | 31 |
| подпись превью | What your client sees | 21 |
| превью, заголовок | Invoice INV-1042 | 16 |
| превью, поля | Amount due: EUR 2,400.00 · Pay with: USDT · USDC · You pay: 2,608.70 USDT | 10 · 8 · 7 |
| превью, кнопка | Pay 2,608.70 USDT | 17 |
| подсказка | Send the invoice, then open it as the client. | 45 |

Превью плательщика встречается в шагах 02 и 03: это один компонент.

#### Шаг 03 Get paid: платёж, события, ваша система

| Место | Текст | Знаков |
|---|---|---|
| колонка клиента | Client pays | 11 |
| кнопка клиента | Pay 2,608.70 USDT → Paying… → Payment sent | 17 → 7 → 12 |
| цепочка статусов | Created · Sent · Viewed · Paid · Reconciled | 7 · 4 · 6 · 4 · 10 |
| колонка событий | Events | 6 |
| пусто | No events yet | 13 |
| ваша система | Your system | 11 |
| результат | Matched to INV-1042. No manual reconciliation. | 46 |
| повтор | Replay | 6 |
| подсказка | Pay as the client and watch the invoice close. | 46 |

События (имена не подтверждены продуктом `[CONFIRM]`):

| Событие | Знаков | Пояснение | Знаков |
|---|---|---|---|
| invoice.created | 15 | Invoice created | 15 |
| invoice.sent | 12 | Invoice sent to the client | 26 |
| invoice.viewed | 14 | Client opened the invoice | 25 |
| invoice.paid | 12 | Payment received | 16 |
| invoice.reconciled | 18 | Payment matched to INV-1042 | 27 |

Журнал «Your system»: после `invoice.paid` — «INV-1042: payment received» (26); после `invoice.reconciled` — «INV-1042 marked as paid» (23). Статус в списке и в цепочке на последнем событии: Reconciled.

### Industries (данные страницы; формат `Industries/items.ts`, кнопка у всех «Book a demo»)

Порядок и свечение: `industry-first` и `logistics` светлые (без `glow`), остальные 2–6 по кругу `violet`, `pink`, `orange`, `blue`, `green`. Открытый при загрузке: `agencies`. Каждый сценарий называет одну роль и результат; без цифр.

| # (id) | Заголовок | Строка 1 (с точкой) | Строка 2 (без точки) | Знаков (заг. / 1 / 2) | Статус |
|---|---|---|---|---|---|
| 1 (`industry-first`) | Industry-first scenarios | Invoicing shaped around how your industry bills. | Pick the scenario closest to yours | 24 / 48 / 34 | черновик (заголовок общий) |
| 2 (`agencies`, violet) | Agencies and media buyers | Invoice every client in their own currency. | See who opened it and who paid | 25 / 43 / 30 | черновик |
| 3 (`saas`, pink) | SaaS and subscriptions | Bill customers abroad in their local currency. | Every payment is matched to its invoice | 22 / 46 / 39 | черновик `[CONFIRM: регулярные счета и подписки]` |
| 4 (`wholesale`, orange) | B2B trade and wholesale | Send large invoices to buyers in other countries. | Share one link instead of bank details | 23 / 49 / 38 | черновик `[CONFIRM: лимиты на сумму счёта]` |
| 5 (`consulting`, blue) | Consulting and freelancers | Send a clean invoice to a client in any country. | Follow it from sent to paid | 26 / 48 / 27 | черновик |
| 6 (`marketplaces`, green) | Marketplaces and platforms | Issue invoices to users in every market. | Get an event when each one is paid | 26 / 40 / 34 | черновик `[CONFIRM: события и API]` |
| 7 (`logistics`) | Logistics and freight | Invoice shippers and carriers in local currency. | One payment link for every shipment | 21 / 48 / 35 | черновик |

Самая длинная строка 49 знаков (в Crypto Processing 54, на главной 61): вёрстка не страдает.

### Faq (формат `Faq/items.ts`: `question`, `lead`, `answer`)

Открыт при загрузке: `payer`. Где факта нет, ответ «подтвердим на демо». Вопросы про safety и licence с главной в набор не входят (8 вопросов по заданию).

| # (id) | Вопрос | Lead | Ответ | Знаков (в / l / о) | Статус |
|---|---|---|---|---|---|
| 1 (`payer`) | Who can pay an invoice, and do they need an account? | Your client pays from their own wallet. | We will confirm during the demo whether they need to sign up first. | 51 / 39 / 68 | черновик `[CONFIRM: аккаунт и проверка плательщика]` |
| 2 (`currencies`) | Which currencies can I invoice in? | Your client's local currency. | We will confirm the list of supported currencies during the demo. | 34 / 29 / 64 | черновик `[CONFIRM: список валют и что получает компания]` |
| 3 (`mismatch`) | What if a client pays too little or too much? | — | We will walk you through how underpayments and overpayments are handled for your flow. | 45 / — / 86 | черновик `[CONFIRM: недоплата, переплата, частичная оплата, возвраты]` |
| 4 (`rate`) | How long are the rate and the payment link valid? | — | On the demo we will confirm how the rate is set and how long a link stays active. | 49 / — / 81 | черновик `[CONFIRM: фиксация курса, срок ссылки]` |
| 5 (`reminders`) | Can I send reminders or recurring invoices? | Tell us how you bill. | We will confirm which reminders and billing schedules fit your setup. | 43 / 21 / 69 | черновик `[CONFIRM: напоминания, регулярные счета]` |
| 6 (`branding`) | Can I add my logo and send a PDF? | — | We will confirm PDF export and branding options during the demo. | 34 / — / 64 | черновик `[CONFIRM: PDF, логотип, шаблоны]` |
| 7 (`matching`) | How is an invoice matched to a payment? | The payment finds its own invoice. | Your system gets an event when an invoice is paid and reconciled. We will confirm the events and API for your setup during the demo. | 39 / 34 / 132 | черновик `[CONFIRM: механизм сверки, события, API, интеграции с учётом]` |
| 8 (`cost-timeline`) | How much does it cost, and how fast can I start? | It depends on your flow. | Book a demo and we will walk you through the fees. Integration takes from 1 week, and KYB is included in onboarding. | 48 / 24 / 116 | черновик `[CONFIRM: комиссии; относится ли «from 1 week» к счетам]` («From 1 week» и KYB взяты из главной) |

### Cta

| data-el | Текст | Знаков | Статус |
|---|---|---|---|
| `cta__title` | Ready to get paid in crypto? | 28 | черновик (рекомендую; запасной: «Ready to invoice across borders?», 31, не обещает ничего про получение) |
| `cta__subtitle` | We'll show how an invoice goes from created to reconciled. | 58 | черновик (запасной: «We'll build an invoice in your client's currency together.», 58) |
| `cta__button` | Book a demo | 11 | макет |

Бейджи баннера (по желанию, иначе остаются главные): «Local currency» (14), «Pay in crypto» (13), «Reconciled» (10). Статус: предложение.

### Meta

| Поле | Текст | Знаков | Статус |
|---|---|---|---|
| `meta.title` | Invoicing — Velant Pay | 22 | черновик (как у Crypto Processing) |
| `meta.description` | Issue invoices in your client's currency and accept payments in crypto. Every payment is matched to its invoice. | 112 | черновик `[CONFIRM: сверка]` |

### Вопросы к продукту `[CONFIRM]`

1. Что получает компания: фиат (в какой валюте, на какой счёт), крипто, баланс в Velant? От этого зависят hero, шаг 03 и Cta («get paid in crypto»).
2. Список валют счетов (EUR, GBP, BRL, INR, AED лишь примеры для картинки) и источник курса.
3. Монеты и сети для оплаты (USDT / USDC взяты как значения картинки); можно ли называть их на странице.
4. Нужен ли плательщику аккаунт, проверка, любой ли кошелёк подходит.
5. Недоплата, переплата, частичная оплата, возвраты.
6. Курс: когда фиксируется (при создании, при открытии, при оплате), срок жизни ссылки, что после истечения.
7. Напоминания, регулярные счета, условия оплаты; статус Overdue ставится сам по сроку?
8. PDF, логотип, шаблоны, языки счёта.
9. Налоги в счёте (строка налога, ставки, налоговые номера); является ли счёт в местной валюте документом для местного учёта.
10. Каналы отправки (ссылка, e-mail, PDF) и отслеживание «клиент открыл»: что есть на самом деле.
11. Кабинет, API или оба; названия и список событий (`invoice.created / sent / viewed / paid / reconciled`), подписи, повторные отправки, интеграции с бухгалтерскими системами.
12. Как именно платёж находит счёт (уникальный адрес, референс, сумма) и что значит «Reconciled»: деньги уже у компании?
13. Комиссии (модель, можно ли называть на странице), срок запуска «from 1 week» для счетов, лимиты на сумму счёта и страны.
14. Домен ссылки на оплату (в картинке заглушка `pay.velantpay.com`).
15. Нужны ли на странице ответы про безопасность и лицензию (взять с главной слово в слово).

### Допущения и что на решение дизайнера

- Выбор заголовков: hero A, блок B, шаги A / B / A (см. таблицу).
- Демо-курсы, суммы, ставка налога 20 %, клиенты, домен ссылки, время «10:02 / 10:14» выдуманы только для картинки; в Faq и в подзаголовках фактов из них нет.
- Нужен ли переход данных между шагами (валюта и позиции шага 01 → шаги 02–03): тексты работают в обоих вариантах.
- Превью страницы плательщика повторяется в шагах 02 и 03; кнопка «Pay 2,608.70 USDT» в шаге 02 может быть неактивной.
- На иллюстрации Features на главной счёт называется «Invoice #2144» и сумма записана «$12,263.00»; на странице «INV-1042» и коды валют. Это разные сцены, но при желании номер можно выровнять.
- Вёрстке: подзаголовок hero (127) и текст шага 03 (119) — самые длинные строки; названия клиентов до 18 знаков (Meridian Consulting) в колонке списка на узких экранах могут обрезаться.

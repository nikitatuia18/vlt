# Аудит имён слоёв Figma, этап 1

- Файл: `tF23PDdcgeTKK5hsmDZIKg` (Design), страница `Design` (1:4954)
- Стартовый узел: `1110:8484` «desctop / home page», FRAME 2560x9722 (кадр страницы, десктоп). Это не страница и не секция.
- Скилл: `.claude/skills/figma-layer-naming/SKILL.md`. В Figma ничего не менялось.
- Предложенные имена — только предложения; `?` означает сомнение, решает пользователь.

## Как собраны данные (и ограничения)

- `get_metadata(1110:8484)` вернул кадр без детей (особенность инструмента для верхних кадров). Дерево собрано обходом по id: `1110:8485` (внутренняя обёртка, весь контент) и `1110:9195` (Nav Bar). Прочие прямые дети `1110:8484`, если они есть, по метаданным не видны. Размеры сходятся: 76 (Nav Bar) + 9645 (обёртка) + 1 = 9722.
- Подсчёт слоёв и нарушений выполнен вручную по XML метаданных. Числа точные для слоёв и типов 1–2, для типов 3–6 — по ручному подсчёту (возможна погрешность в единицы).
- Не входят в счёт: содержимое листовых icon-фреймов и инстансов (метаданные детей не показывают), второй десктоп-кадр `1195:644`, мобильный кадр `1143:3916`, страница `Icon` (841:3094).

## Сводка

Всего слоёв в `1110:8484`: **682** (включая корневой кадр). Кириллицы в именах нет, все имена английские.

| Блок | nodeId | Слоёв |
|---|---|---|
| Корень + обёртка + 8 угловых эллипсов | 1110:8484, 1110:8485, 1266:683–690 | 10 |
| Nav Bar | 1110:9195 | 40 |
| Hero Section | 1110:8486 | 195 |
| Main Container (лента логотипов) | 1110:8691 | 53 |
| Features Section | 1110:8798 | 124 |
| Industry Scenarios Section | 1110:8922 | 20 |
| Global Payments Hero | 1110:8942 | 81 |
| Next Steps Section | 1110:9039 | 24 |
| FAQ Section | 1110:9062 | 44 |
| Payment Flow Hero | 1110:9106 | 27 |
| Navigation Bar (футер, основной) | 1110:9133 | 54 |
| Navigation Bar (футер, нижняя полоса) | 1110:9185 | 10 |
| Итого | | 682 |

Типы слоёв: инстансы 58, текст около 190, остальное фреймы, векторы, rounded-rectangle, ellipse, line, boolean-operation. Скрытых слоёв 18.

### Нарушения по пунктам чек-листа (категории пересекаются)

| # | Тип | Слоёв | Комментарий |
|---|---|---|---|
| 1 | Авто-имена по регулярке скилла | **56** | Frame NNN 4, Group 83 1, Rectangle 2 1, Ellipse NNN 14, Vector NN 35 (из них 10 «Vector» без номера), Line 1 1 |
| 1+ | Авто/импортные/копийные имена вне регулярки | **38** | `[Copy] Frame …` 21, `Mask group` 2, `Union` 1, `Intersect` 2, `Ellipse 203 (Stroke)` 1, `Flag_of_Europe 1` 1, имена файлов-изображений 10 (`tesseract-black 1`, `01-book-a-demo_black-2x 1`, `remove-bg_-0 (1) 2`, `All_Trust_Logo_Big` x2, `Utila_Icon_-_Dark_0 1` x3, `…Google_Pay_Logo 1` x2) |
| 2 | Регистр/пробелы (Title Case с пробелами) | **около 640** | Соответствуют kebab-case лишь около 39 слоёв, и все это имена иконок библиотеки (`sun`, `wallet`, `arrow-3`), но у них нет префикса `icon-`. 7 скрытых `arrow_forward` с подчёркиванием |
| 2 | Спецсимволы вне допустимых (`/ — [] () ! % .`) | **около 62** | `vuesax/linear/export` x8 и `vuesax/linear/clock` x4, `Flags/…` x9, `Flow / …` x6, `Coin Logo/renBTC (RENBTC)` x2, `Motion / Sending loader`, `Counter — Motion 0.0% to 0.5%`, `Prefix 0.`, `Suffix %`, `[Copy]` x21 и др. |
| 3 | Дубли имён внутри одного родителя | **около 155** | `Heading` x2 в каждом `Feature Content`; 6 `Heading` в `Industry Scenarios`; 13+8 `[Copy] Frame…` в `Linked Path Group`; 4 `Step Card`; 5 `FAQ Item`; 9 `Right Button Container` в карте; 33 `About Link`; 5 `Left Button Container` в меню и т.д. |
| 4 | Дети блока без префикса `{блок}__` | **около 660** | Не соблюдается нигде: ни один из 11 блоков не использует схему |
| 5 | Лишние вложенные обёртки (кандидаты на упрощение) | **около 60** | см. раздел «Обёртки» |
| 6 | Кадры анимации с разным набором слоёв | **0 (неприменимо)** | в узле нет кадров вида `@01…@end` |
| — | Роль не соответствует имени (не из чек-листа) | **около 190** | `Heading` x59 (это заголовки, цифры, описания, вопросы FAQ), `Subheading` x8, `About Link` x33 (это и заголовки колонок футера, и копирайт), `Right Button Container/Text` x16+25 используются не для кнопок, `Left Button Container/Left Button/Left Button Text` как пункты меню, переключатели FAQ |

Дополнительно:
- `Flags/Canada` (1110:8969) — детач-фрейм, внутри флаг Европы (`Flag_of_Europe 1`): имя вводит в заблуждение (в макете это EUR). Предложено `icon-flag-eu` ?.
- Имена блоков не соответствуют роли: «Navigation Bar» x2 — это футер; «Main Container» — лента логотипов; «Payment Flow Hero» — CTA-баннер; «Global Payments Hero» — карта; «Hero Section» — первый экран.
- Прямые вложенные дубли родитель-ребёнок: `Feature Content`→`Feature Content` (8904→8905), `Asset Value` фрейм→текст (8546→8547), `Invoice Line` фрейм→`Invoice Line` rect (x3), `Payment Method`→`Payment Method Details`.
- Одинаковая геометрия: `Vector 32–37` (1110:8885–8890) и `Flow / …` (1110:8897–8902) совпадают по x/y/w/h попарно — дубликаты слоёв (статика и анимационные пути?). Пометка `?`.

## Блоки верхнего уровня и предложенные имена

| Порядок (y) | nodeId | Текущее имя | Предложенное имя | Комментарий |
|---|---|---|---|---|
| корень | 1110:8484 | desctop / home page | `page-home` ? | опечатка desctop; на странице три кадра «… / home page» (два десктопа и мобильный), см. вопрос (а) |
| обёртка | 1110:8485 | Frame 2087330976 | `page-home__body` ? | |
| 0 | 1110:9195 | Nav Bar | `header` | хедер: логотип, меню, переключатель темы, 2 кнопки |
| 76 | 1110:8486 | Hero Section | `hero` | |
| 1684 | 1110:8691 | Main Container | `logos` ? | бегущая лента логотипов платёжных методов; `partners`/`payment-logos` как вариант |
| 2114 | 1110:8798 | Features Section | `features` | «Everything you need to move money» |
| 3775 | 1110:8922 | Industry Scenarios Section | `industries` ? | `scenarios` как вариант |
| 4945 | 1110:8942 | Global Payments Hero | `global` ? | карта + 3 метрики; `global-payments` как вариант |
| 6225 | 1110:9039 | Next Steps Section | `next-steps` ? | в скилле пример `how-it-works`; здесь заголовок «What are our next steps?» |
| 7378 | 1110:9062 | FAQ Section | `faq` | |
| 8423 | 1110:9106 | Payment Flow Hero | `cta` | баннер «Tell us what you're building» |
| 9200 | 1110:9133 | Navigation Bar | `footer` | основной футер: лого, 5 колонок ссылок |
| 9665 | 1110:9185 | Navigation Bar | `footer-bottom` ? | нижняя полоса (юр. лицо, Terms, Privacy, копирайт); возможно `footer__bottom` |

(Координаты y — в системе корня: y обёртки 76 плюс y блока внутри обёртки.)

## Таблица: корень и обёртка

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:8484 | desctop / home page | опечатка, пробелы, `/` | `page-home` ? |
| 1110:8485 | Frame 2087330976 | авто-имя | `page-home__body` ? |
| 1266:683, 1266:684 | Ellipse 207, Ellipse 208 (5x5, y=7301) | авто-имя, дубли имён с 1266:681/682 в другом родителе | `faq__deco-corner-tl`, `faq__deco-corner-tr` ? (угловые маркеры на границе секций, принадлежность блоку неясна) |
| 1266:685, 1266:686 | Ellipse 209, Ellipse 210 (y=8346) | авто-имя | `faq__deco-corner-bl`, `faq__deco-corner-br` ? (или `cta__deco-corner-tl/tr`) |
| 1266:687, 1266:688 | Ellipse 211, Ellipse 212 (y=9121) | авто-имя | `cta__deco-corner-bl`, `cta__deco-corner-br` ? (или `footer__deco-corner-tl/tr`) |
| 1266:689, 1266:690 | Ellipse 213, Ellipse 214 (y=9586) | авто-имя | `footer__deco-corner-bl`, `footer__deco-corner-br` ? (или `footer-bottom__deco-corner-tl/tr`) |

## Блок: header (Nav Bar, 1110:9195), 40 слоёв

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:9195 | Nav Bar | регистр, пробел | `header` |
| 1110:9196 | Nav Container | регистр, нет префикса | `header__container` |
| 1110:9197 | Frame 2087330932 | авто-имя | `header__left` ? (логотип + меню) |
| 1289:4147 | Frame 2087331031 | авто-имя, лого (пустой фрейм) | `header__logo` (внутри при необходимости `img-logo`) |
| 1110:9209 | Menu | регистр | `header__menu` |
| 1110:9210, 9214, 9218, 9222, 9226 | Left Button Container x5 | дубли, роль (пункт меню, не кнопка) | `header__menu-item-1` … `-5` |
| 1110:9211, 9215, 9219, 9223, 9227 | Left Button x5 | дубли, лишняя обёртка вокруг текста | `header__menu-item-1-inner` … `-5-inner` ? (кандидат на упрощение) |
| 1110:9212, 9216, 9220, 9224, 9228 | Left Button Text x5 | дубли, роль | `header__menu-label-1` … `-5` |
| 1110:9213, 9217, 9221, 9225, 9229 | arrow_forward x5 (hidden) | подчёркивание, нет `icon-`, скрыты | `icon-arrow-forward` (x5, hidden; удалить? решает пользователь) |
| 1110:9230 | Button Container | регистр | `header__actions` |
| 1110:9231 | Left Button Container (44x44) | роль (кнопка темы) | `header__theme-toggle` |
| 1110:9232 | Left Button (hidden) | скрытая обёртка | `header__theme-toggle-inner` ? |
| 1110:9233 | Left Button Text (в скрытом) | дубль/роль | `header__theme-toggle-label` ? |
| 1114:874 | sun (instance) | нет `icon-`; стейт темы | `icon-sun` ? (instance иконки; конфликт правил, см. (а)) |
| 1110:9240 | Frame 2087330940 | авто-имя | `header__buttons` |
| 1110:9241 | Left Button Container | дубль, роль | `header__cta-secondary` ? (кнопка с иконкой export, «Explore…»; проверить по скриншоту) |
| 1110:9242 / 9243 | Left Button / Left Button Text | роль | `header__cta-secondary-inner` / `header__cta-secondary-label` |
| 1114:1061 | vuesax/linear/export | `/`, детач-иконка | `icon-export` |
| 1110:9245 | arrow_forward (hidden) | `_`, hidden | `icon-arrow-forward` |
| 1110:9246 | Left Button Container | дубль, роль | `header__cta-primary` (кнопка «Book a demo») |
| 1110:9247 / 9248 / 9249 | Left Button / Left Button Text / arrow_forward | роль | `header__cta-primary-inner` / `header__cta-primary-label` / `icon-arrow-forward` |

## Блок: hero (Hero Section, 1110:8486), 195 слоёв

Верхняя часть (первый экран) — по слоям.

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:8486 | Hero Section | регистр | `hero` |
| 1110:8487 | Hero Image Container | регистр, лишняя обёртка | `hero__bg-wrap` |
| 1110:8488 | Hero Illustration | регистр (фон-изображение) | `img-hero-bg` ? (или `hero__bg`) |
| 1110:8490 | Hero Content | регистр | `hero__content` |
| 1110:8491 | Text Content Container | регистр | `hero__intro` ? |
| 1110:8492 | Text Block Container | регистр | `hero__text-wrap` |
| 1110:8493 | Heading | роль (H1) | `hero__title` |
| 1110:8494 | Subheading | роль | `hero__subtitle` |
| 1110:8495 | Button Container | регистр | `hero__actions` |
| 1110:8496 | Left Button Container | роль (кнопка «Book a demo») | `hero__cta-primary` |
| 1110:8497 | Left Button | лишняя обёртка вокруг текста | `hero__cta-primary-inner` ? |
| 1110:8498 | Left Button Text | роль | `hero__cta-primary-label` |
| 1114:1003 | vuesax/linear/export | `/`, детач-иконка | `icon-export` |
| 1110:8506 | Right Button Container | роль (кнопка «Explore products») | `hero__cta-secondary` |
| 1110:8507 | Right Button | лишняя обёртка | `hero__cta-secondary-inner` ? |
| 1110:8508 | Right Button Text | роль | `hero__cta-secondary-label` |
| 1110:8509 | Media Container | регистр | `hero__media` |
| 1110:8510 | Desktop Medium | регистр (мокап дашборда, 170+ слоёв) | `hero__dashboard` ? (см. вопрос про вложенность мокапов в (а)) |

Мокап дашборда `hero__dashboard` (1110:8510, 177 слоёв внутри). Для групп применён префикс `hero__dash-`; для однотипных строк использованы диапазоны.

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:8511 | Rectangle 2 (hidden) | авто-имя, скрыт | `hero__dash-header-bg` ? (скрыт: удалить?) |
| 1110:8512 | Dashboard Header | регистр | `hero__dash-header` |
| 1110:8513, 8514, 8515 | Page Navigation, sidebar-left, Page Name | регистр / нет `icon-` | `hero__dash-breadcrumb`, `icon-sidebar-left`, `hero__dash-page-name` |
| 1110:8516–8520 | Header Actions, monitor, Language Selector, language-square, Language Code | регистр / нет `icon-` | `hero__dash-header-actions`, `icon-monitor`, `hero__dash-lang`, `icon-language-square`, `hero__dash-lang-code` |
| 1110:8521 | Balance Content | регистр | `hero__dash-content` |
| 1110:8522–8524 | Page Header, Page Title, Page Description | регистр | `hero__dash-page-header`, `hero__dash-page-title`, `hero__dash-page-desc` |
| 1110:8525, 8526 | Balance Overview, Balance Overview Section | регистр, обёртка в обёртке | `hero__dash-balance`, `hero__dash-balance-section` ? (кандидат на упрощение) |
| 1110:8527, 8528 | Overview Header, Overview Title | регистр | `hero__dash-balance-head`, `hero__dash-balance-title` |
| 1110:8529, 8530 | Balance Cards, Balance Card Group | регистр, обёртка с одним ребёнком | `hero__dash-cards`, `hero__dash-cards-wrap` ? |
| 1110:8531 | Available Balance Card | регистр | `hero__dash-card-1` |
| 1110:8532 | Ellipse 125 | авто-имя (декор-свечение, выходит за карточку) | `hero__deco-card-glow` |
| 1110:8533 | Balance Card | регистр, совпадает по смыслу с родителем | `hero__dash-card-1-bg` |
| 1110:8534, 8535, 8536, 8537 | Label, Available Amount, Amount, Currency | регистр, нет префикса | `hero__dash-card-1-label`, `-value`, `-amount`, `-currency` |
| 1110:8538–8542 | Pending Balance Card, Label, Pending Amount, Amount, Currency | то же | `hero__dash-card-2`, `-label`, `-value`, `-amount`, `-currency` |
| 1110:8543–8545 | Primary Asset Card, Label, Asset | то же | `hero__dash-card-3`, `-label`, `-asset` |
| 1110:8546–8548 | Asset Value (фрейм), Asset Value (текст), Currency | дубль родитель-ребёнок | `hero__dash-card-4`, `-label`, `-currency` ? (текст «…» — роль уточнить по скриншоту) |
| 1110:8549, 8550 | Balance Table Section, Table Toolbar | регистр | `hero__dash-table-section`, `hero__dash-toolbar` |
| 1110:8551–8561 | Filters, Search Filter, Search Label, Search Input, search-normal, Search Currency, Asset Filter, Asset Label, Asset Select, Asset Selection, arrow-down | регистр / нет `icon-` | `hero__dash-filters`, `-filter-search`, `-filter-search-label`, `-filter-search-input`, `icon-search`, `-filter-search-value`, `-filter-asset`, `-filter-asset-label`, `-filter-asset-select`, `-filter-asset-value`, `icon-arrow-down` (все с префиксом `hero__dash`) |
| 1110:8562–8568 | Table Status, Status Content, Results Count, Results, Columns Control, row-horizontal, Columns | регистр, лишняя обёртка Status Content | `hero__dash-status`, `-status-inner` ?, `-results`, `-results-text`, `-columns`, `icon-row-horizontal`, `-columns-label` |
| 1110:8569, 8570 | Balance Table, Table Content | регистр, обёртка | `hero__dash-table`, `hero__dash-table-wrap` ? |
| 1110:8571 | Table Header | регистр | `hero__dash-table-head` |
| 1110:8572, 8575, 8578, 8581, 8584 | Currency/Available/Pending Payout/Pending Refund/Total Header | регистр | `hero__dash-th-currency`, `-th-available`, `-th-payout`, `-th-refund`, `-th-total` |
| 1110:8573, 8576, 8579, 8582, 8585 | тексты заголовков колонок (Currency, Available, …) | дубли имён с ячейками | `hero__dash-th-currency-label` и т.д. |
| 1110:8574, 8577, 8580, 8583, 8586 | arrow-3 x5 | нет `icon-`, одинаковое имя | `icon-sort` ? (arrow-3 в Vuesax — стрелка сортировки) |
| 1110:8587 | Balance Row | регистр | `hero__dash-row-1` |
| 1110:8588–8598 | Currency Cell, Currency Icon, Currency, Available Cell…Total Cell + тексты | регистр, дубли имён с th | `hero__dash-td-currency`, `icon-currency` / `img-currency` ?, `-td-currency-text`, `-td-available`, `-td-payout`, `-td-refund`, `-td-total` и их `-text` |
| 1110:8599, 8600, 8601 | Sidebar Container, Sidebar Navigation, Navigation Content | регистр, две обёртки подряд | `hero__dash-sidebar`, `hero__dash-sidebar-inner` ?, `hero__dash-nav` |
| 1110:8602 | Logo | регистр | `hero__dash-logo` (внутри `img-logo`) |
| 1110:8604 | Settings Navigation | неверная роль (это весь список меню), дубль с 8631 | `hero__dash-menu` |
| 1110:8605–8607 | Dashboard, grid-3, Dashboard Item | регистр | `hero__dash-item-dashboard`, `icon-grid`, `-item-dashboard-label` |
| 1110:8608/8609, 8625/8626 | divide / Vector 8 x2 | дубли, авто-имя | `hero__dash-divider-1`, `-2` и `hero__dash-divider-1-line`, `-2-line` ? (обёртка с одним вектором) |
| 1110:8610–8624 | Finance Section, Finance, Finance Section Label, Transactions/Balances/Payouts/Refunds Item + иконки arrow-2/wallet/receipt-2/undo + тексты | регистр / нет `icon-` | `hero__dash-group-finance`, `-group-finance-head`, `-group-finance-label`, `-item-transactions`, `-item-balances`, `-item-payouts`, `-item-refunds`, `icon-arrow-2` ?, `icon-wallet`, `icon-receipt`, `icon-undo`, `-item-…-label` |
| 1110:8627–8629 | System Section, System, System Section Label | регистр | `hero__dash-group-system`, `-group-system-head`, `-group-system-label` |
| 1110:8630–8634 | Settings Item, Settings Navigation, setting, Settings, arrow-up | регистр, дубль имени 8604 | `hero__dash-item-settings`, `-item-settings-main`, `icon-setting`, `-item-settings-label`, `icon-arrow-up` |
| 1110:8635–8674 | 8 пунктов (Integration, Profile, Webhook, API Keys, Widget, Security, Users, Roles) x 5 слоёв: Item, Indicator, Vector 9, иконка, текст | регистр, авто-имя `Vector 9` x8, дубль `Vector 9`, `Indicator` с одним вектором | `hero__dash-item-integration` / `-item-integration-indicator` / `-item-integration-indicator-line` / `icon-format-circle` ? / `-item-integration-label` и так далее для profile, webhook, api-keys, widget, security, users, roles |
| 1110:8675–8683 | Additional Navigation, Dashboard (повтор имени 8605), Dashboard Tour Item, discover, FAQ Item, book (frame), FAQ | дубль имени `Dashboard`, `book` — детач-иконка | `hero__dash-group-extra`, `-item-tour`, `-item-tour-label`, `icon-discover`, `-item-faq`, `icon-book`, `-item-faq-label` |
| 1110:8684–8690 | Theme Switcher, Light/Dark Theme Option, sun, moon, Light, Dark | регистр | `hero__dash-theme`, `-theme-light`, `-theme-dark`, `icon-sun`, `icon-moon`, `-theme-light-label`, `-theme-dark-label` |

## Блок: logos (Main Container, 1110:8691), 53 слоя

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:8691 | Main Container | роль не отражена | `logos` ? |
| 1110:8692 | Content Container | регистр, цепочка из 3 обёрток с одним ребёнком (8692→8693→8694) | `logos__container` ? (кандидат на упрощение) |
| 1110:8693 | Payment Method | неверная роль (имя дублируется в Features, 1110:8876…) | `logos__track-wrap` ? |
| 1110:8694 | Linked Path Group | регистр; бегущая лента, внутри 21 карточка | `logos__track` |
| 1110:8695, 8752 | [Copy] Frame 2087330886 x2 | `Copy`, авто-имя, дубль | `logos__item-1`, … (нумерация в порядке чтения, см. ниже) |
| 1110:8699, 8708, 8713, 8716, 8719, 8725, 8745, 8749, 8755, 8761, 8779, 8789, 8795 | [Copy] Frame 2087330883 x13 | `Copy`, авто-имя, 13 дублей в одном родителе | `logos__item-N` |
| 1110:8722, 8735, 8758, 8770, 8784, 8792 | [Copy] Frame 208733088(4/5/7/8/9/90) | `Copy`, авто-имя | `logos__item-N` |
| (21 слой «Payment Icon») | 1110:8696, 8700, 8709, 8714, 8717, 8720, 8723, 8726, 8736, 8746, 8750, 8753, 8756, 8759, 8762, 8771, 8780, 8785, 8790, 8793, 8796 | регистр; нет префикса | `logos__item-N-icon` ? (или `img-logo-…`) |
| 1110:8697, 8747 | All_Trust_Logo_Big | имя файла, `_` | `img-logo-alltrust` |
| 1110:8710, 8781, 8786 | Utila_Icon_-_Dark_0 1 | имя файла | `img-logo-utila` |
| 1110:8727, 8737 | 20260710020116!Google_Pay_Logo 1 | имя файла, `!` | `img-logo-google-pay` |

Нумерация `logos__item-1…21` — слева направо по x (от -551 до 1910). Лента повторяет один набор логотипов 2-3 раза (All_Trust x2, Google Pay x2, Utila x3): для зацикленной ленты нужно правило (см. (а)); возможно, дубликаты стоит пометить `-a`/`-b` ?. Остальные 14 логотипов-контейнеров пустые (изображение, вероятно, в fill), реальные подписи брендов по скриншоту: Bybit, Apple Pay, Google Pay и т.д. — для имён нужен список от пользователя ?.

## Блок: features (Features Section, 1110:8798), 124 слоя

Слаги карточек (предложение, `?`): `crypto` (Crypto Processing), `invoicing`, `ramp` (Crypto On- and Off-Ramp), `payouts` (Mass Payouts), `banking`, `wallet`. Вариант с числами `features__card-1…6` — решает пользователь, см. (а).

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:8798 | Features Section | регистр | `features` |
| 1110:8799 | Features Grid | регистр | `features__container` |
| 1110:8800 | Text Block Container | регистр, дубль имени в других блоках | `features__header` |
| 1110:8801, 8802 | Subheading, Heading | роль | `features__eyebrow`, `features__title` |
| 1110:8803 | Product Feature Cards | регистр | `features__grid` |
| 1266:681, 1266:682 | Ellipse 207, Ellipse 208 | авто-имя, дубли с 1266:683/684 | `features__deco-corner-bl`, `features__deco-corner-br` |
| 1110:8804 | Crypto Processing Card | регистр | `features__card-crypto` |
| 1110:8805 | Processing Illustration | регистр, фон 1796x1050 вылезает за карточку | `img-features-crypto-bg` ? |
| 1213:723 | tesseract-black 1 | имя файла | `img-tesseract` |
| 1110:8807, 8808, 8809 | Feature Content, Heading, Heading | регистр, дубль `Heading` | `features__card-crypto-text`, `-title`, `-desc` |
| 1110:8810, 8811, 8812 | Right Button Container, Right Button, Right Button Text | роль (круглая кнопка-иконка), `Right Button` с шириной 2 | `features__card-crypto-cta`, `-cta-inner` ?, `-cta-label` ? |
| 1114:1019 | vuesax/linear/export | `/`, детач-иконка | `icon-export` |
| 1110:8814 | Invoicing Card | регистр | `features__card-invoicing` |
| 1110:8815, 8816 | Invoice Illustration, Invoice Details | регистр | `features__invoicing-illustration`, `features__invoicing-doc` |
| 1110:8817 | Heading | роль («Invoice #2144»), дубль | `features__invoicing-doc-title` |
| 1110:8818 | Line 1 | авто-имя | `features__invoicing-doc-divider` |
| 1110:8819 | Heading | роль (сумма), дубль | `features__invoicing-doc-amount` |
| 1110:8820, 8821 | Due Date, Heading | регистр, роль | `features__invoicing-doc-due`, `-due-label` |
| 1110:8822 | Invoice Lines | регистр | `features__invoicing-doc-lines` |
| 1110:8823, 8826, 8829 | Invoice Line x3 (фреймы) | дубли, совпадают с детьми | `features__invoicing-line-1`, `-2`, `-3` |
| 1110:8824, 8825, 8827, 8828, 8830, 8831 | Invoice Line x6 (rect) | дубли, совпадают с родителем | `features__invoicing-line-1-left`, `-1-right`, `-2-left`, `-2-right`, `-3-left`, `-3-right` |
| 1110:8832, 8833 | Invoice Action, Heading | регистр, роль | `features__invoicing-doc-btn`, `-btn-label` |
| 1110:8834 | Motion / Sending loader (30x30, на скриншоте пустой) | `/`, пробелы; анимационный слой без видимого содержимого | `features__invoicing-loader` ? (имя нужно согласовать с анимацией) |
| 1110:8837 | tick-circle (instance) | нет `icon-`; накладывается на лоадер (состояние) | `icon-tick-circle` |
| 1110:8838, 8839, 8840 | Feature Content, Heading, Heading | дубль | `features__card-invoicing-text`, `-title`, `-desc` |
| 1110:8841, 8842, 8843, 1114:1012 | Right Button Container, Right Button, Right Button Text, vuesax/linear/export | роль | `features__card-invoicing-cta`, `-cta-inner` ?, `-cta-label` ?, `icon-export` |
| 1110:8845 | Crypto On- and Off-Ramp Card | регистр, `-` | `features__card-ramp` |
| 1110:8846, 8847, 8848 | Feature Content, Heading, Heading | дубль | `features__card-ramp-text`, `-title`, `-desc` |
| 1110:8849, 8850, 8851, 1114:1026 | Right Button… | роль | `features__card-ramp-cta`, `-cta-inner` ?, `-cta-label` ?, `icon-export` |
| 1110:8853 | Counter — Motion 0.0% to 0.5% | em dash, `%`, `.`; состав анимации | `features__ramp-counter` ? |
| 1110:8854, 8855 | Prefix 0., Digit-Scroll | `.`, регистр | `features__ramp-counter-prefix`, `features__ramp-counter-scroll` |
| 1110:8856–8861 | Digit 0 … Digit 5 | регистр, нет префикса | `features__ramp-digit-0` … `-5` |
| 1110:8862 | Suffix % | `%`, регистр | `features__ramp-counter-suffix` |
| 1110:8863 | Mass Payouts Card | регистр | `features__card-payouts` |
| 1110:8864, 8865, 8866 | Feature Content, Heading, Heading | дубль | `features__card-payouts-text`, `-title`, `-desc` |
| 1110:8867, 8868, 8869, 1114:1033 | Right Button… | роль | `features__card-payouts-cta`, `-cta-inner` ?, `-cta-label` ?, `icon-export` |
| 1110:8871 | Payout Flow Illustration | регистр | `features__payouts-illustration` |
| 1110:8872, 8873 | Coin Logo/renBTC (RENBTC), renBTC (RENBTC) | `/`, `()`, регистр | `features__payouts-source`, `img-coin-renbtc` ? |
| 1110:8876, 8879, 8882 | Payment Method x3 | дубли, совпадают с 8693 | `features__payouts-method-bank`, `-method-crypto`, `-method-card` |
| 1110:8877, 8880, 8883 | bank, Cryptocurrency Payment, card (instance) | нет `icon-`; `Cryptocurrency Payment` — длинное название иконки | `icon-bank`, `icon-crypto`, `icon-card` |
| 1110:8878, 8881, 8884 | Heading x3 | дубли, роль | `features__payouts-method-bank-label`, `-method-crypto-label`, `-method-card-label` |
| 1110:8885–8890 | Vector 32 … Vector 37 | авто-имя; дублируют `Flow /…` | `features__payouts-line-dollar-bank`, `-dollar-crypto`, `-dollar-card`, `-bank-person`, `-crypto-person`, `-card-person`; решить, нужны ли дубли ? |
| 1110:8891, 8893, 8895 | Payout Recipient x3 | дубли | `features__payouts-recipient-bank`, `-crypto`, `-card` |
| 1110:8892, 8894, 8896 | Ellipse 139 / 141 / 140 | авто-имя | `img-recipient-bank` ?, `-crypto`, `-card` (аватары); порядок id не совпадает с порядком чтения |
| 1110:8897–8902 | Flow / Dollar to Bank, … to Crypto, … to Card, Bank to Person, Crypto to Person, Card to Person | `/`, пробелы, дубль геометрии с Vector 32-37 | `features__payouts-flow-dollar-bank`, `-flow-dollar-crypto`, `-flow-dollar-card`, `-flow-bank-person`, `-flow-crypto-person`, `-flow-card-person` ? |
| 1110:8903 | Banking Card | неверная роль: это колонка из двух карточек (Banking и Wallet) | `features__col-coming-soon` ? |
| 1110:8904 | Feature Content (родитель) | дубль с ребёнком 8905 | `features__card-banking` |
| 1110:8905, 8906, 8907 | Feature Content, Heading, Heading | дубль | `features__card-banking-text`, `-title`, `-desc` |
| 1110:8908, 8909, 8910 | Coming Soon Badge, Badge Label, Heading | регистр, лишняя обёртка Badge Label | `features__card-banking-badge`, `-badge-inner` ?, `-badge-label` |
| 1110:8911, 1114:986, 1114:987 | Status Icon, vuesax/linear/clock x2 | `/`, три вложенных обёртки подряд, дубль имён | `features__card-banking-badge-icon`, `icon-clock` (внутренние слои — упростить ?) |
| 1110:8913 | Wallet Card | регистр | `features__card-wallet` |
| 1110:8914, 8915, 8916 | Feature Content, Heading, Heading | дубль | `features__card-wallet-text`, `-title`, `-desc` |
| 1110:8917, 8918, 8919 | Coming Soon Badge, Badge Label, Heading | то же | `features__card-wallet-badge`, `-badge-inner` ?, `-badge-label` |
| 1110:8920, 1114:980, 1114:981 | Status Icon, vuesax/linear/clock x2 | то же | `features__card-wallet-badge-icon`, `icon-clock` |

## Блок: industries (Industry Scenarios Section, 1110:8922), 20 слоёв

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:8922 | Industry Scenarios Section | регистр | `industries` ? |
| 1110:8923 | Content Layout | регистр | `industries__container` |
| 1110:8924, 8925 | Text Block Container, Heading | регистр, роль | `industries__header`, `industries__title` |
| 1110:8926 | Industry Scenarios | регистр, повторяет имя блока | `industries__list` |
| 1110:8927, 8928 | Heading x2 (Industry-first scenarios, E-commerce) | дубли, роль | `industries__item-1`, `industries__item-2` ? (серые варианты пунктов; текст — название индустрии) |
| 1110:8929, 8930 | Scenario Card, Scenario Card Content | регистр, обёртка с одним ребёнком (активный пункт Startups) | `industries__card`, `industries__card-inner` ? (упростить) |
| 1110:8931, 8932, 8933 | Scenario Details, Heading, Heading | регистр, дубль | `industries__card-text`, `industries__card-title`, `industries__card-desc` |
| 1114:1052, 1114:1053, 1114:1054 | Left Button Container, Left Button, Left Button Text | роль (CTA «Book a demo») | `industries__card-cta`, `-cta-inner` ?, `-cta-label` |
| 1114:1055 | vuesax/linear/export | `/` | `icon-export` |
| 1110:8938–8941 | Heading x4 (Luxury goods…, Real estate, Export/Import, Operations…) | дубли, роль | `industries__item-3` … `industries__item-6` ? |

Пункт-список (шесть названий индустрий, один из них развёрнут в карточку Startups): состояния «активный/неактивный» в слоях не различаются (разные размер и цвет у обычных `Heading`). См. (а).

## Блок: global (Global Payments Hero, 1110:8942), 81 слой

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:8942 | Global Payments Hero | регистр | `global` ? |
| 1110:8943 | Map Background | регистр | `global__bg` |
| 1110:8944 | Map Illustration | регистр (фон-картинка) | `img-global-map` ? |
| 1110:8945 | Map Surface | регистр (плашка поверх карты) | `global__bg-surface` ? |
| 1110:8946 | Payment Methods Map | регистр | `global__map` |
| 1110:8947, 8948 | Mask group, Vector | авто-имя, обёртка с одним вектором | `global__map-mask` (по правилу масок), `global__map-shape` ? |
| 1110:8949–8957 | Vector 38, 42, 39, 43, 41, 45, 46, 44, 40 | авто-имя x9 (линии маршрутов) | `global__route-1` … `global__route-9` (порядок по смыслу уточнить) ? |
| 1110:8958, 8963, 8968, 8994, 8999, 9004, 9009, 9014, 9019 | Right Button Container x9 | дубли, неверная роль (пины карты: CAD, USD, EUR, GEL, INR, BRL, CLP, KGS, ARS) | `global__pin-ca`, `-us`, `-eu`, `-ge`, `-in`, `-br`, `-cl`, `-kg`, `-ar` ? (по валюте/стране) |
| 1110:8959, 8964, 8995, 9000, 9005, 9010, 9015, 9020 | Flags/… (instance) x8 | `/`, нет `icon-` | `icon-flag-ca`, `-us`, `-ge`, `-in`, `-br`, `-cl`, `-kg`, `-ar` ? |
| 1110:8969 | Flags/Canada (frame, внутри Европа) | неверное содержимое имени, детач | `icon-flag-eu` ? |
| 1110:8970–8973, 8990 | Canada, Intersect x2, Flag_of_Europe 1, Ellipse 203 (Stroke) | неверное имя, авто-имя | внутренности флага — не переименовывать, а заменить на инстанс флага ? |
| 1110:8960, 8965, 8991, 8996, 9001, 9006, 9011, 9016, 9021 | Payment Method Details x9 | регистр, дубли имён | `global__pin-ca-text` и т.д. |
| 18 текстов `Right Button Text` (8961/8962, 8966/8967, 8992/8993, 8997/8998, 9002/9003, 9007/9008, 9012/9013, 9017/9018, 9022/9023) | Right Button Text x2 в каждом | дубли, неверная роль | `global__pin-ca-code`, `global__pin-ca-desc` (по паре на пин) |
| 1110:9024 | Hero Content | регистр | `global__content` |
| 1110:9025 | Text Block Container | регистр | `global__text-wrap` |
| 1110:9026 | Key Metrics | регистр | `global__metrics` |
| 1110:9027, 9030, 9033 | Platform Uptime, Countries Supported, Currencies Supported | регистр | `global__metric-1`, `-2`, `-3` ? (или семантика `-uptime`, `-countries`, `-currencies`) |
| 1110:9028, 9029 / 9031, 9032 / 9034, 9035 | Heading x2 в каждом | дубли, роль (значение + подпись) | `global__metric-1-value`, `-1-label` (и для 2, 3) |
| 1110:9036 | Hero Message | регистр | `global__message` |
| 1110:9037, 9038 | Heading x2 | дубли | `global__title`, `global__desc` |

## Блок: next-steps (Next Steps Section, 1110:9039), 24 слоя

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:9039 | Next Steps Section | регистр | `next-steps` ? |
| 1110:9040 | Steps Content | регистр | `next-steps__container` |
| 1110:9041, 9042, 9043 | Text Block Container, Heading, Heading | дубль | `next-steps__header`, `next-steps__title`, `next-steps__desc` |
| 1110:9044 | Steps Cards | регистр | `next-steps__cards` |
| 1110:9045, 9053, 9056, 9059 | Step Card x4 | дубли | `next-steps__card-1` … `-4` |
| 1110:9046, 9054, 9057, 9060 | Heading (номер 01…04) | роль | `next-steps__card-1-number` … |
| 1110:9055, 9058, 9061 | Heading (название шага) | роль | `next-steps__card-2-title`, `-3-title`, `-4-title` |
| 1110:9047, 9048, 9049, 9050 | Step Details, Step Text, Heading, Heading (карточка 1) | регистр, дубль | `next-steps__card-1-details`, `-1-text`, `-1-title`, `-1-desc` |
| 1110:9051, 9052 | Progress Indicator, Progress Bar | регистр, обёртка | `next-steps__card-1-progress`, `-1-progress-bar` |
| 1237:653 | 01-book-a-demo_black-2x 1 | имя файла | `img-step-book-demo` |

Карточки 2-4 свёрнутые (без Step Details): отличаются от карточки 1 набором слоёв — это состояния (active / collapsed), см. (а).

## Блок: faq (FAQ Section, 1110:9062), 44 слоя

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:9062 | FAQ Section | регистр | `faq` |
| 1110:9063 | FAQ Content | регистр | `faq__container` |
| 1110:9064 | Heading | роль | `faq__title` |
| 1110:9065 | FAQ List | регистр | `faq__list` |
| 1110:9066, 9074, 9082, 9090, 9098 | FAQ Item x5 | дубли | `faq__item-1` … `-5` |
| 1110:9067, 9075, 9083, 9091, 9099 | FAQ Header | дубли в разных родителях, регистр | `faq__item-1-head` … `-5-head` |
| 1110:9068, 9076, 9084, 9092, 9100 | Heading (вопрос) | роль | `faq__item-1-question` … |
| 1110:9069, 9077, 9085, 9093, 9101 | Left Button Container | роль (переключатель) | `faq__item-1-toggle` … |
| 1110:9070, 9078, 9086, 9094, 9102 | Left Button (hidden) + 9071, 9079, 9087, 9095, 9103 Left Button Text | скрыты, лишние | `faq__item-N-toggle-inner`, `-toggle-label` ? (кандидаты на удаление) |
| 1110:9072 | Collapse Button (instance) | состояние зашито в имя | `Button` ? (состояние через variant, см. (а)); пока `faq__item-1-icon` ? |
| 1110:9080, 9088, 9096, 9104 | Expand Button (instance) x4 | то же | `faq__item-2-icon` … `-5-icon` ? |
| 1110:9073, 9081, 9089, 9097, 9105 | Subheading (ответ; в 2–5 hidden) | роль, состояние через hidden | `faq__item-N-answer` |

## Блок: cta (Payment Flow Hero, 1110:9106), 27 слоёв

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:9106 | Payment Flow Hero | регистр, не отражает роль | `cta` |
| 1110:9107 | Hero Content | дубль имён с hero и global | `cta__container` |
| 1110:9108 | Hero Banner | регистр | `cta__banner` |
| 1110:9109 | Mask group | авто-имя | `cta__bg-mask` |
| 1110:9110, 9111 | Background Shape, Background Image | регистр | `cta__bg-shape`, `img-cta-bg` |
| 1110:9112 | Content Area | регистр | `cta__content` |
| 1110:9113, 9114, 9115 | Text Content, Heading, Subheading | регистр, роль | `cta__text-wrap`, `cta__title`, `cta__subtitle` |
| 1110:9116, 9117, 9118, 1114:1073 | Left Button Container, Left Button, Left Button Text, vuesax/linear/export | роль | `cta__btn`, `cta__btn-inner` ?, `cta__btn-label`, `icon-export` |
| 1110:9124 | remove-bg_-0 (1) 2 | имя файла (фото человека) | `img-cta-person` |
| 1110:9120, 9125, 9129 | Right Button Container x3 | дубли, роль (плавающие бейджи: Pay in / Payroll, Multi-currency, Instant KYB) | `cta__badge-1`, `-2`, `-3` ? (порядок по смыслу: уточнить) |
| 1110:9121, 9126, 9130 | card, global, security (instance) | нет `icon-` | `icon-card`, `icon-global`, `icon-security` |
| 1110:9122, 9127, 9131 | Feature Label | дубли имён в разных родителях | `cta__badge-1-text`, `-2-text`, `-3-text` |
| 1110:9123, 9128, 9132 | Right Button Text | роль | `cta__badge-1-label`, `-2-label`, `-3-label` |

## Блок: footer (Navigation Bar, 1110:9133), 54 слоя

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:9133 | Navigation Bar | неверная роль (это футер) | `footer` |
| 1110:9134 | Links Container | регистр | `footer__container` |
| 1110:9135 | Section | роль (колонка бренда) | `footer__brand` |
| 1289:4183 | Group 83 | авто-имя (логотип) | `footer__logo` ? |
| 1289:4184 | Heading (frame с 9 векторами) | неверная роль, имя Heading у лого | `footer__logo-text` ? (или `img-logo-wordmark`) |
| 1289:4185–4193 | Vector x9 | авто-имя, дубли в одном родителе | буквы wordmark: `footer__logo-letter-1` … `-9` ? (лучше заменить логотип на инстанс/один вектор) |
| 1289:4194 | Heading (vector) | неверная роль | `footer__logo-mark` ? |
| 1289:4195 | Union | авто-имя | `footer__logo-mark-shape` ? |
| 1110:9147 | About Link (в brand) | роль (описание бренда) | `footer__brand-desc` |
| 1110:9148 | Section | роль (колонки ссылок) | `footer__links` |
| 1110:9149, 9158, 9165, 9172, 9179 | Section Title x5 | дубли | `footer__col-1` … `-5` (Platform, Solutions, Company, Developers, Partners) |
| 1110:9150, 9159, 9166, 9173, 9180 | About Link (заголовок колонки) | дубль/роль | `footer__col-1-title` … `-5-title` |
| 1110:9151, 9160, 9167, 9174, 9181 | Section | дубль | `footer__col-1-list` … `-5-list` |
| 1110:9152–9157, 9161–9164, 9168–9171, 9175–9178, 9182–9184 | About Link x21 | дубли, роль | `footer__col-1-link-1` … `-6`; `footer__col-2-link-1` … `-4`; `col-3`…`-4`; `col-4`…`-4`; `col-5`…`-3` |

## Блок: footer-bottom (Navigation Bar, 1110:9185), 10 слоёв

| nodeId | Текущее имя | Проблема | Предложенное имя |
|---|---|---|---|
| 1110:9185 | Navigation Bar | неверная роль | `footer-bottom` ? |
| 1110:9186 | Links Container | регистр | `footer-bottom__container` |
| 1110:9187 | About Links Group | роль | `footer-bottom__company` |
| 1110:9188, 9189 | About Link x2 | дубли | `footer-bottom__company-name`, `footer-bottom__company-license` ? |
| 1110:9190 | Policy Links Group | роль | `footer-bottom__legal` |
| 1110:9191, 9192, 9193 | About Link x3 | дубли | `footer-bottom__legal-link-1` … `-3` (Terms, Privacy, AML Policy) |
| 1110:9194 | About Link | роль (копирайт) | `footer-bottom__copyright` |

## Обёртки (пункт 5 чек-листа): кандидаты на упрощение, без удаления

Примерно 60 слоёв. Основные случаи:
- Кнопки: `Container > Button > Text` — 21 случай, где фрейм `Left/Right Button` оборачивает один текст (`1110:8497`, `8507`, `1114:1053`, `9117`, 5 в меню хедера, 3 в хедере (кнопки), 5 скрытых в FAQ, 4 круглые кнопки карточек 8811/8842/8850/8868).
- `Content Container > Payment Method > Linked Path Group` (8692→8693→8694): три обёртки с одним ребёнком.
- `Balance Cards > Balance Card Group`, `Balance Table > Table Content`, `Table Status > Status Content`, `Sidebar Container > Sidebar Navigation`, `Scenario Card > Scenario Card Content`, `Feature Content > Feature Content` (8904/8905).
- `Status Icon > vuesax/linear/clock > vuesax/linear/clock` (x2 бейджа, по три слоя).
- `divide > Vector 8` x2; `… Indicator > Vector 9` x8; `Mask group > Vector` x2; `Progress Indicator > Progress Bar`; `Badge Label > Heading` x2.

## (а) Что в конвенции не подходит к макету или не хватает

1. Нет правил для блоков, которые не являются секциями: `header`, `footer`, нижняя полоса футера (`footer-bottom`). Предложено добавить фиксированные имена `header`, `footer`.
2. Корневой кадр: правило даёт `page-home`, но на странице три кадра с одинаковым смыслом (десктоп 1110:8484, второй десктоп 1195:644 с другим составом секций, мобильный 1143:3916). `@` зарезервирован под анимацию, поэтому для вьюпортов нужен суффикс, например `page-home--desktop`, `page-home--mobile` ?. Решать пользователю.
3. Внутренняя обёртка `Frame 2087330976` и угловые маркеры (14 эллипсов 5x5) не принадлежат ни одному блоку. Нужно правило имён для элементов уровня страницы (`page-home__body`, `page-home__deco-…`) и для декора на границе блоков.
4. Правило «вложенность в имени — один уровень» плохо сочетается с повторяющимися карточками: `features__card-1__title` запрещено, а `features__card-title` неоднозначно. Предложено: контейнер `{блок}__card-{n}`, дети `{блок}__card-{n}-{роль}` (или семантические слаги `features__card-crypto-title`). Выбор «число или слаг» за пользователем. Правило 18 из скилла «числовой суффикс» оговорено только для одинаковых элементов, а карточки Features разные по содержимому.
5. Крупные мокапы и иллюстрации внутри блока (дашборд в hero — 177 слоёв, схема выплат, карта с пинами, инвойс) не покрыты правилами. Нужно решение: либо префикс подкомпонента `hero__dash-…`, как предложено в отчёте, либо отдельная конвенция для иллюстраций (`illus-…`) или оставлять внутренности без переименования (заменить на инстансы или «заморозить»).
6. Текстовые слои: нет таксономии ролей. Нужен закрытый список: `title`, `subtitle`, `eyebrow`, `desc`, `label`, `value`, `number`, `link`, `question`, `answer`, `copyright`.
7. Кнопки: в макете это детач-фреймы `Container > Button > Text (+ icon)`, а не инстансы. Правило «инстансы — PascalCase (`Button`)» к ним неприменимо; нужны имена `{блок}__cta`, `__cta-label`, и решение, переводить ли кнопки в компонент.
8. Иконки и инстансы: правило `icon-{что}` конфликтует с правилом «инстансы — PascalCase имени компонента». Все 58 инстансов — иконки Vuesax/Material (`sun`, `arrow-3`, `arrow_forward`) и флаги (`Flags/…`); ещё 12 иконок — детач-фреймы `vuesax/linear/…`. Нужно решить: инстанс иконки называем `icon-{что}` (как в отчёте) или оставляем имя компонента. Флаги и логотипы: нет префикса (`icon-flag-…`, `img-logo-…`)?
9. Состояния без variant-свойств: FAQ (открыт/закрыт) решён скрытыми слоями (`hidden`) и именами инстансов `Collapse Button` и `Expand Button`; карточки Next Steps (активная/свёрнутая) отличаются набором слоёв; пункты Industries (активный/обычный); бейджи «Coming Soon». Правило «состояния — через variant» требует предварительного создания компонентов, чего пока нет. Нужен промежуточный порядок: как называть скрытые и «состоянческие» слои.
10. Зацикленные повторы: бегущая лента логотипов (21 элемент, набор повторён 2–3 раза), 9 пинов карты, 5 колонок футера, ряды таблицы. Не описано, нумеруем ли дубликаты ленты (`-a`/`-b`) и можно ли нумеровать «по x».
11. Имена блоков должны быть уникальны на странице, а в Figma сейчас повторяются «Hero» (3 разных блока), «Navigation Bar» (хедер и два футера), «Features Section» (в кадре 1195:644 четыре раза). Нужен реестр имён блоков (`docs/figma-map.json` пока пуст: `"blocks": []`).
12. Слои-изображения (rounded-rectangle с image fill), фоны, дубли геометрии (`Flow /…`, `Vector 32–37`): роль «фон/подложка» и «картинка» в правилах есть (`img-`), но не различаются `{блок}__bg` и `img-{что}` для фонов блока.
13. Анимационные слои вне схемы `@`: `Motion / Sending loader`, `Counter — Motion 0.0% to 0.5%`, `Digit-Scroll`, `Flow / …`. Их нужно либо привести к схеме `{блок}__{элемент}`, либо описать правило для «motion-слоёв» (префикс `motion`?).
14. Скрытые слои (18 шт.: `Rectangle 2`, 7 `arrow_forward`, 6 `Left Button` в тоглерах, 4 ответа FAQ): нет правила — переименовывать или предлагать к удалению.

## (б) Компоненты, инстансы и существующая схема имён

- Узлов типа COMPONENT/COMPONENT_SET в узле 1110:8484 не обнаружено. Инстансов 58, мастер-компоненты в метаданных не показываются; их отдельное исследование не выполнялось.
- Инстансы: иконки Vuesax (`sidebar-left`, `monitor`, `language-square`, `search-normal`, `arrow-down`, `row-horizontal`, `arrow-3` x5, `grid-3`, `arrow-2`, `wallet`, `receipt-2`, `undo`, `setting`, `arrow-up`, `format-circle`, `profile-circle`, `link-2`, `key`, `element-3`, `shield-tick`, `profile-2user`, `security` x2, `discover`, `sun` x2, `moon`, `tick-circle`, `bank`, `card` x2, `global`, `Cryptocurrency Payment`), Material `arrow_forward` x7 (hidden), `Currency Icon` (1110:8589), флаги `Flags/Canada|United States of America|Georgia|India|Brazil|Chile|Kyrgyzstan|Argentina`, `Collapse Button` x1 и `Expand Button` x4 (FAQ).
- Детач-иконки: `vuesax/linear/export` x8, `vuesax/linear/clock` x4 (вложенные пары), `book`, `Logo` (внутри мокапа).
- Существующая схема: английские имена в Title Case с пробелами и семантическими суффиксами (`Hero Section`, `Text Block Container`, `Feature Content`, `Right Button Container`). Роли копируются между блоками (`Left/Right Button Container`, `Heading`, `Subheading`, `About Link`, `Text Block Container`, `Hero Content` повторяются в 3–6 блоках), то есть имена не уникальны и не несут смысла блока. Слои мокапа дашборда названы последовательно (`Balance Card`, `Table Header`, `… Item`), это единственная часть с осмысленной иерархией. Пространства имён через `/`: `vuesax/linear/…`, `Flags/…`, `Coin Logo/…`, `Motion / …`, `Flow / …`. Авто-имена Figma/импорта: `Frame 20873…`, `Vector NN`, `Ellipse NNN`, `[Copy] Frame …`. Имена файлов-изображений как имена слоёв.
- `docs/figma-map.json` пуст (`fileKey: null`, `blocks: []`), существующего реестра нет.
- На странице `Design` вне кадров лежат 8 текстовых слоёв `Heading` (1173:5567–5574, x от 9846): возможно черновые копии заголовков; в аудит не входили.

## (в) Покадровая анимация

- В узле `1110:8484` кадров вида `{блок}@01-start`, `@02-…`, `@end` нет. Похожих на покадровую анимацию наборов одинаковых фреймов с вариациями тоже нет.
- Анимационные признаки внутри одного кадра: `Counter — Motion 0.0% to 0.5%` (1110:8853) с лентой `Digit-Scroll` (шесть цифр `Digit 0…5` в столбец, 72x768, прокрутка внутри маски, не покадрово); `Motion / Sending loader` (1110:8834, 30x30, на скриншоте пусто); `Flow / …` x6 (1110:8897–8902) дублируют `Vector 32–37` по геометрии (вероятно, анимируемые пути); бегущая лента логотипов (`Linked Path Group`, 2543 px шире блока) и скролл-эффекты (Next Steps: развёрнутая карточка + свёрнутые; FAQ: открытый/закрытые).
- Второй десктоп-кадр `1195:644` (2560x10166) — другая версия страницы (секции в другом порядке: Hero 1520, Features x4, Next Steps, Payment Flow Hero, Navigation Bar x2), не анимация, но «ревизия». Мобильный кадр `1143:3916` (393x7877) не обходился, его дерево не перечислено.

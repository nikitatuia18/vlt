# Страница «Book a demo» (`/book-a-demo`)

Не из Figma, собрана в коде на дизайн-системе. Готово и выложено 2026-10-27; подключение Calendly (аккаунт, ссылка) отдано разработке.

## Тексты
Список и шаги — из ТЗ дизайнера дословно (в «Choose a convenient time slot below» исправлено «bellow»). Тексты карточки — **черновик** (ТЗ даёт смысл, не слова): «Your meeting is booked. / Check your email for the calendar invitation. See you on the call.», «Opening the calendar…», «We could not open the calendar. / Open the calendar in a new tab». Всё в `src/pages/book-a-demo/content.ts`.

## Как работает
Карточка (`BookingCard.tsx`) — одно место на всю запись, состояния `data-state`:
`idle` (кнопка) → `loading` (скрипт Calendly грузится **только по клику**) → `calendar` (встроенный календарь `initInlineWidget`) → `booked` (наше сообщение, `aria-live`, фокус на нём) · `error` (скрипт не загрузился: ссылка на календарь в новой вкладке).
- Конец записи: сообщение `calendly.event_scheduled` от `https://calendly.com`; чужие источники и другие события игнорируются.
- Цвета календаря (`background_color`, `text_color`, `primary_color`) берутся из токенов в момент открытия (Light/Dark), Calendly принимает только hex — `tokenHex` в `calendly.ts` переводит через canvas. Если тема сменится при открытом календаре, он остаётся в старой.
- Раскладка: от 1280 px текст слева, карточка справа; ниже — в столбик, по клику страница доезжает до карточки.

## Ссылка Calendly
`VITE_CALENDLY_URL` (`.env.local` локально, переменная сборки в `deploy.yml` для публикации). Пока не задана — заглушка `https://calendly.com/velant-pay/demo` в `calendly.ts`.

## Подключение
Все «Book a demo» ведут на `href('book-a-demo')`: шапка (`demoCta`), hero и баннер Cta главной, четыре страницы продуктов. Подчёркивание в меню у страницы не стоит.

## Тесты
`tests/book-a-demo.spec.ts` (виджет подменяется заглушкой через `page.route`, сообщение — `MessageEvent` с нужным `origin`); страница в списке «текст по словам» `tests/reveal.spec.ts`. Реальную запись автотестом не проверить.

## Для разработки: что осталось подключить
Дизайнер не знает Calendly, подключение отдано разработчикам. Сделано: интерфейс, загрузка виджета, обработка конца записи. Осталось:
1. Завести аккаунт и тип события Calendly («Demo»), взять ссылку `https://calendly.com/<аккаунт>/<событие>`.
2. Записать её в переменную репозитория `CALENDLY_URL` (GitHub: Settings → Secrets and variables → Actions → Variables); `deploy.yml` передаёт её сборке как `VITE_CALENDLY_URL`. Пока пусто — стоит заглушка из `calendly.ts`, и календарь покажет ошибку Calendly.
3. В Calendly: приглашение на почту и ссылка на звонок (конференц-связь) настраиваются в самом событии; на сайте это не требуется.
4. Проверить живую запись один раз руками (тестом не проверить): календарь, выбор времени, сообщение «Your meeting is booked».
5. По желанию: передавать имя и email из своей формы (`prefill` в `initInlineWidget`), метки `utm`, письмо/CRM по событию — на стороне разработки.

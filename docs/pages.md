# Страницы продуктов: как делать

Первая страница — [Crypto Processing](pages/crypto-processing.md) (`/crypto-processing`). По ней делаются остальные (Invoicing, Crypto on- and off-ramp, Mass Payouts).
Страницы продуктов нет в Figma (область Figma по CLAUDE.md — только кадры главной): строим в коде на дизайн-системе, дизайнер оценивает в браузере.

## Из чего страница
`ProductPage` ([src/pages/ProductPage.tsx](../src/pages/ProductPage.tsx)) собирает: Header → `ProductHero` → Logos → **два блока про продукт** (`sections`) → Industries → Faq → Cta → Footer. Оболочка (skip-link, шапка, `main`, подвал) — `PageShell`.
Общие блоки главной принимают тексты пропсами; без пропсов показывают тексты главной: `Industries` (`items`, `activeId`), `Faq` (`items`, `title`, `openId`), `Cta` (`title`, `subtitle`). Logos одинаков на всех страницах.

## Как добавить страницу продукта
1. **Тексты.** Звать `copywriter` (раздел «Страница продукта» навыка `project-copywriting`): карта вопросов посетителя → структура → тексты → вопросы к продукту. Результат: `docs/pages/<product>.md`. Структуру и тексты утверждает пользователь. Факты не придумываем: пробелы помечены `[CONFIRM]`.
2. **Данные.** `src/pages/<product>/content.ts` с объектом `ProductContent` (meta, hero, industries, faq, cta) и данными двух блоков про продукт.
3. **Два блока про продукт** в `src/pages/<product>/` (инфографика или микро-интерфейс в стиле глобуса: точки, линии, живая сцена; код). Сначала простая версия, потом креатив; новые авторские эффекты сначала вариантами на тестовой странице.
4. **Страница:** `src/pages/<product>/<Product>Page.tsx` (`<ProductPage content sections />`), адрес в `pages` в [src/App.tsx](../src/App.tsx) (ленивая загрузка).
5. **Тесты** `tests/<product>.spec.ts` по образцу [crypto-processing.spec.ts](../tests/crypto-processing.spec.ts): порядок блоков, один h1, скриншоты 393 / 768 / 1024 / 1280 / 1440 / 2560, нет горизонтального скролла; страницу добавить в проверку «весь текст по словам» (`tests/reveal.spec.ts`, список путей).
6. **Документы:** `docs/pages/<product>.md`, строка в `docs/status.md`.

## Правила
- `data-el` блоков: `{product}__hero`, `{product}__flow` и т. п.; у общих блоков имена прежние (`logos`, `industries`, `faq`, `cta`).
- Весь текст страницы появляется по словам; исключения как на главной: цифры (`CountUp`), окна с кодом (`*-api-code`), тексты внутри иллюстраций, у которых свой таймлайн (только по согласию дизайнера).
- Ссылку на страницу с карточки продукта на главной (`Features/cards.ts`) включаем после утверждения страницы.
- Заголовок вкладки и description страницы задаются через `meta` (`usePageMeta`).
- Адрес на GitHub Pages: `/vlt/<product>` (прямой заход работает: `404.html` — копия `index.html`).

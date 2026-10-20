# Статус проекта (начни с этого файла)

Обновляется после каждого блока одной строкой. Подробности по блокам — в [blocks/](blocks/); правила — в [../CLAUDE.md](../CLAUDE.md); ловушки — в [lessons.md](lessons.md).
Обновлено: 2026-10-20. `npx playwright test` — 232 теста, `npm run build` и `npm run lint` чистые.

## Сделано
- **Окружение и нейминг:** React + Vite + TS, Tailwind v4, motion, Playwright; имена слоёв Figma = `data-el` ([naming-spec.md](naming-spec.md)); десктопный кадр переименован.
- **Токены** Light/Dark ([tokens-map.md](tokens-map.md)) и **UI Kit** (`/ui-kit`, [ui-kit.md](ui-kit.md)): кнопки, иконки, бейдж, `Container`, `InteractiveDots`, `CornerDots`, `ColumnFade`, **`Header`** и **`Footer`** (переиспользуемые, настраиваются пропсами).
- **Глобус в global (2026-10-20, принят дизайнером):** 3D из точек, мышь, драг, закреплённая сцена — [global.md](blocks/global.md).
- **Появление сайта (2026-10-20, принято дизайнером; ветка `feature/reveal-animations`):** хедер, hero, все блоки и футер появляются с анимацией (строки заголовков из-под маски, подъём, карточки, рябь точек, счёт цифр, шторка баннера) — [reveal.motion.md](reveal.motion.md). Аварийный выключатель: `REVEAL_ENABLED` в `src/motion/tokens.ts`.
- **Блоки десктопного кадра (все):** [header](blocks/header.md) · [hero](blocks/hero.md) · [logos](blocks/logos.md) · [features](blocks/features.md) · [industries](blocks/industries.md) · [global](blocks/global.md) · [next-steps](blocks/next-steps.md) · [faq](blocks/faq.md) · [cta](blocks/cta.md) · [footer + footer-bottom](blocks/footer.md).
- **Сквозное:** плавная прокрутка Lenis ([smooth-scroll.md](smooth-scroll.md)); хедер закреплён и прячется при прокрутке вниз; колонка с линиями, точками и затуханием у блоков; агент `copywriter` + навык `project-copywriting`.
- Планшет и мобильный размеры **выведены** по [responsive.md](responsive.md) (мобильный кадр не разбирали).

## Не сделано / открыто
1. **Мобильный кадр** `1143:3916` (главный следующий этап): переименовать слои по карте, сверить с выведенными размерами, поправить расхождения. Лимит Figma MCP: 200 вызовов в сутки, по одному `get_metadata` на секцию.
2. **Иллюстрации и анимации в карточках:** Features (Tesseract, Invoicing и др.), Hero Media (пустая карточка) — пользователь пришлёт готовым кодом. Гифка шага 01 «Book a demo» не нужна.
3. **Заглушки:** все ссылки (`#…`); у логотипа MultiMoney нет ссылки.
4. **Черновые тексты** (согласовать с продуктом; можно прогнать через `copywriter`): 6 отраслей в industries, шаги 02–04 в next-steps.
5. **Шрифт Urbanist** (бейджи cta, коды валют на карточках global, заголовки колонок футера) не подключён: заменён ближайшими стилями.
6. **Токены:** радиус 60 — исключение (завести переменную в Figma); `theme/surface/dots` создана нами в Figma.
7. **Навигация:** подключить пункты меню хедера к блокам и страницам, выбранный пункт по скроллу (`currentId` у `Header` уже есть).
8. **Полировка и выпуск:** вес картинок и шрифтов, доступность, `<title>`/meta/favicon/SEO, сверка с Figma (`visual-qa`), сборка и хостинг.

## Как продолжать в новом чате
Первое сообщение: «Продолжаем Velant Pay. Прочитай `docs/status.md` и `CLAUDE.md`, начинаем с мобильного кадра». Dev-сервер: `npm run dev` (http://localhost:5173). Правило работы: блок → отчёт → «переходим дальше»; после блока обновить этот файл, `docs/blocks/<block>.md`, тесты, закоммитить и запушить.
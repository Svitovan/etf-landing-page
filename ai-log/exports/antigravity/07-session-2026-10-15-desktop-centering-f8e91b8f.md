# Сессия 7: Верстка: центрирование контента Hero-секции на десктопе

> Session: f8e91b8f-c55c-47a2-aebf-daf910149e3d | Date: 2026-10-15
> Exported messages: 2; source-truncated messages: 0.
> Editorial heading; original message bodies below. Missing source text is not reconstructed.

---

### 1. User — *2026-10-15T08:59:28Z*

сделай вырвнивание контента первой секции по центру для десктоп версии сайта

---

### 2. Assistant (Antigravity) — *2026-10-15T09:05:39Z*

Выравнивание контента первой секции (Hero) по центру для десктопной версии успешно реализовано и протестировано.

### Что было сделано

1. **Стили и медиа-запросы в `src/styles/globals.css`**:
   - Добавлены семантические CSS-классы для первой секции: `.hero-section`, `.hero-content`, `.hero-badge-wrap`, `.hero-title`, `.hero-subtitle`, `.hero-preview-cards`, `.hero-ctas`, `.hero-cta-btn`, `.hero-trust-text`.
   - В правиле `@media (min-width: 768px)` настроено центрирование:
     - Контейнер контента: `margin-left: auto; margin-right: auto; text-align: center;`
     - Бейдж: `display: flex; justify-content: center;`
     - Заголовок `h1` и подзаголовок: `text-align: center; margin: 0 auto;` (с оптимальной шириной строки для комфортного чтения).
     - Блок превью-карточек ETF (VOO, IVV, SPY): отцентрирован с `max-width: 580px; margin: 0 auto 1.75rem auto;`.
     - Кнопки целевого действия (CTA): на десктопе выровнены по центру в одну линию (`flex-direction: row; justify-content: center;`), а на мобильных устройствах остаются полноразмерными вертикальными блоками.
     - Микрокопия со списком преимуществ: отцентрирована.

2. **Компонент `src/components/Hero.tsx`**:
   - Заменены инлайн-стили на чистые CSS-классы с сохранением всех идентификаторов и аналитических событий (`trackEvent`).

### Проверка

- **Тесты и сборка:** `npm run typecheck`, `npm test`, `npm run lint` и `npm run build` завершились успешно (код 0).
- **Визуальная верификация в браузере:**
  - На десктопе (1280×800) первая секция гармонично выровнена по центру страницы.
  - На мобильных устройствах (320px–390px) сохранено удобное вертикальное расположение элементов без горизонтального скролла.

---


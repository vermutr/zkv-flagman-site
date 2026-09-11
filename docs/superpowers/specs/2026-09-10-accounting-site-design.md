# Сайт бухгалтерской компании — дизайн

Дата: 2026-09-10
Статус: одобрено

## Цель

Современный SPA-сайт бухгалтерской компании для белорусской аудитории: услуги и пакеты
с ценами, команда с фото, новости, форма заявки на услугу с отправкой письма владельцу.
Хостинг: hoster.by (виртуальный unix-хостинг с Node.js через cPanel или VPS).

## Решения, принятые с заказчиком

- Контент редактируется в файлах репозитория (без админки и CMS).
- Хостинг hoster.by. Vercel/Netlify отклонены: Hobby-тариф запрещает коммерческое
  использование, оплата из РБ проблемна.
- «Заказать услугу» = заявка без оплаты. Владелец получает письмо и связывается сам.
- Язык сайта: только русский. Валюта: BYN.
- Название, палитра, услуги, сотрудники, новости — заглушки, заказчик заменит позже.

## Стек

- `client/`: Vite, React 19, TypeScript, Tailwind CSS v4, react-router, react-hook-form + zod,
  lucide-react, Markdown-рендер для новостей.
- `server/`: Node 20+, Express, nodemailer, zod, express-rate-limit, dotenv.
- Корень: npm workspaces (`client`, `server`), скрипты `dev` (оба параллельно), `build`,
  `start`, `test`.
- Тесты: Vitest + Testing Library (client), Vitest + supertest (server).

## Структура репозитория

```
accounting-site/
  package.json                 workspaces, корневые скрипты
  README.md                    запуск, контент, деплой на hoster.by
  .env.example                 SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
                               MAIL_FROM, ORDER_TO, PORT
  client/
    src/
      content/
        company.ts             название, телефон, email, адрес, часы, соцсети
        packages.ts            пакеты услуг
        services.ts            отдельные услуги
        team.ts                сотрудники
        news/*.md              новости (frontmatter: title, date, excerpt, cover)
      components/              Header, Footer, Container, Button, Card, Modal, ...
      features/order/          OrderModal, OrderForm, useOrder (POST /api/order)
      pages/                   Home, Services, Team, News, NewsArticle, Contacts, NotFound
      lib/                     news loader (import.meta.glob), форматирование цен
      App.tsx, main.tsx, index.css
    public/team/*.jpg          фото сотрудников (плейсхолдеры)
  server/
    src/
      index.ts                 создание app, listen
      app.ts                   express app: json, rate-limit, /api/order, /health, static SPA
      order/schema.ts          zod-схема заявки
      order/mailer.ts          nodemailer transport; в dev без SMTP — вывод письма в консоль
      order/templates.ts       текст письма владельцу и подтверждения клиенту
    test/order.test.ts         supertest, mailer замокан
```

## Модель контента

```ts
type Package = {
  slug: string; name: string; audience: string;     // «Для ИП без сотрудников»
  pricePerMonth: number; features: string[]; popular?: boolean;
};
type Service = {
  slug: string; name: string; description: string;
  priceFrom: number; unit?: string;                  // «за документ», «в месяц»
  category: string;                                  // «Учёт», «Отчётность», «Кадры», «Консультации»
};
type TeamMember = {
  slug: string; name: string; role: string; experienceYears: number;
  specialties: string[]; bio: string; photo: string;
};
// Новость: markdown c frontmatter { title, date (ISO), excerpt, cover? }, slug = имя файла
```

## Страницы и маршруты

| Маршрут         | Содержимое |
|-----------------|-----------|
| `/`             | Hero + CTA, преимущества (4 карточки), пакеты с `popular`, команда кратко (3–4), последние 3 новости, блок заявки |
| `/services`     | Вкладки «Пакеты» / «Отдельные услуги». Пакеты: карточки с ценой в месяц и списком. Услуги: сгруппированы по категории, цена «от N BYN», кнопка «Заказать» |
| `/team`         | Сетка карточек сотрудников |
| `/news`         | Список новостей, сортировка по дате убыв. |
| `/news/:slug`   | Статья: обложка, заголовок, дата, Markdown-текст; 404 если нет |
| `/contacts`     | Реквизиты компании, карта-заглушка, форма обращения (та же OrderForm без выбора услуги) |
| `*`             | 404 |

Кнопка «Заказать» открывает модальное окно OrderModal с предвыбранной услугой/пакетом.
Выбор можно сменить в выпадающем списке (пакеты и услуги вместе, сгруппированы).

## Форма заявки

Поля: имя (обяз.), телефон (обяз., формат +375…), email (обяз.), компания (необяз.),
комментарий (необяз.), выбранная позиция (обяз., `{ kind: 'package' | 'service', slug }`),
honeypot `website` (должен быть пустым). Валидация zod на клиенте и на сервере одной схемой
(схема лежит в `server/src/order/schema.ts`, клиент дублирует поля своей схемой — без
шаринга пакетов, чтобы не усложнять сборку).

Состояния: idle → submitting → success (сообщение «Заявка отправлена, мы свяжемся») | error
(текст ошибки, кнопка «Повторить»).

## Сервер

- `POST /api/order`: rate-limit 5 запросов / 10 мин с IP; honeypot заполнен → 200 без
  отправки; невалидно → 400 с полями; иначе письмо владельцу (`ORDER_TO`) и подтверждение
  клиенту; 200 `{ ok: true }`. Ошибка SMTP → 502 `{ ok: false, error }` и лог.
- `GET /api/health` → `{ ok: true }`.
- В проде: `express.static(client/dist)` + fallback на `index.html` для всех не-`/api` путей.
- Без `SMTP_HOST` в dev-режиме mailer печатает письмо в консоль (jsonTransport).

## Внешний вид

Светлая тема. Палитра: primary тёмно-синий (`#1e3a5f` диапазон), accent изумрудный,
нейтральные серые с тёплым оттенком. Шрифт Manrope (Google Fonts, fallback system-ui).
Скруглённые карточки, мягкие тени, hover-подъём, плавные переходы. Sticky header, мобильное
бургер-меню. Фото сотрудников: плейсхолдеры (SVG с инициалами) до замены.

Заглушки: компания «Баланс Про». Пакеты: «ИП» (от 150 BYN), «Малый бизнес» (от 450 BYN,
popular), «Средний бизнес» (от 900 BYN). 8–10 услуг по 4 категориям. 4 сотрудника.
3 новости.

## Тестирование

- client: OrderForm валидация и submit (fetch замокан); ServicesPage переключение вкладок;
  news loader сортировка.
- server: `/api/order` валидный → mailer вызван 2 раза; невалидный → 400; honeypot → 200
  без вызова mailer; SMTP-ошибка → 502.

## Деплой на hoster.by

README описывает: `npm run build` локально → загрузить `server/dist`, `client/dist`,
`package.json`, `node_modules` сервера (или `npm ci --omit=dev` на хостинге) → cPanel
«Setup Node.js App»: application root, startup file `server/dist/index.js`, переменные
окружения из `.env.example` → Restart. SMTP: почтовый ящик, созданный в cPanel, хост
`mail.<домен>`, порт 465, secure=true.

## Вне рамок

Онлайн-оплата, админка, мультиязычность, корзина из нескольких услуг, аналитика.

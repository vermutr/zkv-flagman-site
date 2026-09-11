# ЗКВ ФЛАГМАН — сайт бухгалтерской компании

SPA на React + маленький Node-сервер для отправки заявок на почту. Один репозиторий, npm workspaces:

- `client/` — Vite, React 19, TypeScript, Tailwind v4, react-router. Весь контент в `client/src/content/`.
- `server/` — Express 5, nodemailer. `POST /api/order` шлёт письмо владельцу и подтверждение клиенту; в проде на своём сервере отдаёт `client/dist`.
- `api/index.ts` — точка входа для Vercel: то же приложение как serverless-функция, статику отдаёт сам Vercel.

## Запуск локально

```bash
npm install
cp .env.example .env      # SMTP можно не заполнять: письма будут печататься в консоль
npm run dev               # клиент http://localhost:5173, сервер http://localhost:3001
npm test                  # тесты клиента и сервера
npm run build             # client/dist + server/dist
npm start                 # продакшен-режим: http://localhost:3001 отдаёт сайт и API
```

## Как менять контент

Всё лежит в `client/src/content/`. Услуги и тарифы — обычные JSON-файлы, новости — markdown. Файлы проверяются при сборке: если в JSON опечатка, сборка остановится и напишет, в каком поле ошибка, а сайт продолжит работать на прежней версии.

| Что | Где |
|-----|-----|
| Название, телефоны, адрес, часы | `company.ts` |
| Тарифы (пакеты) и их цены | `packages.json` |
| Услуги, описания, цены, категории | `services.json` |
| Сотрудники | `team.ts` (фото положить в `client/public/team/` и указать `photo: '/team/имя.jpg'`) |
| Тексты на главной: преимущества, цифры, подзаголовок, блок с призывом | `home.ts` |
| Новости | `news/ГГГГ-ММ-ДД-slug.md` с frontmatter `title`, `date`, `excerpt`, необязательно `cover` |

### Услуга в `services.json`

```json
{
  "slug": "reviziya-ucheta",
  "name": "Ревизия бухгалтерского учёта",
  "description": "Короткий текст для карточки, одно-два предложения.",
  "details": ["Первый абзац полного описания.", "Второй абзац."],
  "includes": ["Что входит, пункт 1", "Пункт 2"],
  "benefits": ["Преимущество 1", "Преимущество 2"],
  "priceFrom": 500,
  "unit": "за проверку",
  "category": "Консультации и проверки"
}
```

`slug` — латиница, цифры и дефис, должен быть уникальным. `includes`, `benefits` и `unit` можно не указывать. Категории берутся из самих услуг: какие `category` встречаются, такие разделы и появятся на странице, в порядке первого упоминания.

### Тариф в `packages.json`

```json
{
  "slug": "ip",
  "name": "ИП",
  "audience": "Для индивидуальных предпринимателей без сотрудников",
  "pricePerMonth": 320,
  "features": ["До 30 операций в месяц", "Учёт доходов и расходов"],
  "popular": true
}
```

`popular: true` должен быть ровно у одного тарифа. Цена показывается как «от 320 BYN / месяц».

### Новость

Файл `news/2026-09-11-nazvanie.md`:

```md
---
title: Заголовок новости
date: 2026-09-11
excerpt: Одно-два предложения для карточки в списке.
---

Текст новости в markdown: абзацы, **жирный**, списки, ссылки.
```

Имя файла становится адресом страницы: `/news/2026-09-11-nazvanie`.

## Деплой на Vercel (рекомендуется для начала)

Сайт живёт в репозитории на GitHub, Vercel собирает его после каждого коммита. Правки контента делаются прямо на сайте GitHub, без установки чего-либо на компьютер.

1. Создайте репозиторий на GitHub и загрузите в него проект.
2. На [vercel.com](https://vercel.com) нажмите **Add New → Project**, выберите репозиторий. Настройки сборки Vercel возьмёт из `vercel.json`, менять ничего не нужно.
3. В разделе **Environment Variables** добавьте переменные из `.env.example`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `ORDER_TO`. Без `SMTP_HOST` заявки только печатаются в лог функции.
4. Нажмите **Deploy**. Через одну-две минуты сайт доступен по адресу вида `имя-проекта.vercel.app`. Свой домен подключается в **Settings → Domains**.
5. Проверьте `https://ваш-адрес/api/health` → `{"ok":true}` и отправьте тестовую заявку с сайта. Если письмо не пришло, посмотрите **Logs** у функции `api/index`: SMTP-сервер хостинга может не принимать подключения с адресов Vercel.

### Как обновить контент на Vercel

1. Откройте нужный файл в репозитории на GitHub, например `client/src/content/services.json`.
2. Нажмите карандаш **Edit**, внесите правки, нажмите **Commit changes**.
3. Vercel сам пересоберёт сайт. Через одну-две минуты изменения видны, простоя нет.
4. Если сборка упала (придёт письмо от Vercel), откройте её лог: там будет указано поле с ошибкой. Сайт при этом продолжает работать на прежней версии.

## Деплой на hoster.by (виртуальный хостинг с Node.js, cPanel)

1. В cPanel создайте почтовый ящик для сайта (например `site@ваш-домен.by`). Запомните пароль. SMTP-хост обычно `mail.ваш-домен.by`, порт 465, SSL.
2. Локально выполните `npm run build`.
3. Загрузите в папку приложения на хостинге (через File Manager или FTP):
   - `package.json`, `package-lock.json`
   - `server/package.json`, `server/dist/`
   - `client/dist/`
4. В cPanel откройте **Setup Node.js App** → **Create Application**:
   - Node.js version: 20 или новее
   - Application mode: `production`
   - Application root: папка, куда загрузили файлы
   - Application URL: ваш домен
   - Application startup file: `server/dist/index.js`
5. В том же окне добавьте переменные окружения из `.env.example`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `ORDER_TO`. `PORT` задавать не нужно, его подставит хостинг.
6. Нажмите **Run NPM Install** (установит зависимости сервера), затем **Restart**.
7. Проверьте `https://ваш-домен.by/api/health` → `{"ok":true}` и отправьте тестовую заявку с сайта.

Для VPS: то же самое, но запуск `npm ci --omit=dev && npm start` под pm2 или systemd, а перед приложением nginx с `proxy_pass http://127.0.0.1:3001`.

Обновление на hoster.by: `npm run build` → заменить `client/dist` и `server/dist` на хостинге → **Restart** в Setup Node.js App.

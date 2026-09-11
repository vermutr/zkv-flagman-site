| Тексты на главной: преимущества, цифры, подзаголовок, блок с призывом | `client/src/content/home.ts` |
# Баланс Про — сайт бухгалтерской компании

SPA на React + маленький Node-сервер для отправки заявок на почту. Один репозиторий, npm workspaces:

- `client/` — Vite, React 19, TypeScript, Tailwind v4, react-router. Весь контент в `client/src/content/`.
- `server/` — Express 5, nodemailer. `POST /api/order` шлёт письмо владельцу и подтверждение клиенту; в проде отдаёт `client/dist`.

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

| Что | Где |
|-----|-----|
| Название, телефон, адрес, часы | `client/src/content/company.ts` |
| Пакеты услуг и цены | `client/src/content/packages.ts` |
| Отдельные услуги и категории | `client/src/content/services.ts` |
| Сотрудники | `client/src/content/team.ts` (фото положить в `client/public/team/` и указать `photo: '/team/имя.jpg'`) |
| Тексты на главной: преимущества, цифры, подзаголовок, блок с призывом | `client/src/content/home.ts` |
| Новости | `client/src/content/news/ГГГГ-ММ-ДД-slug.md` с frontmatter `title`, `date`, `excerpt`, необязательно `cover` |

После правок: `npm run build` и загрузить новую сборку на хостинг.

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

## Обновление сайта

`npm run build` → заменить `client/dist` и `server/dist` на хостинге → **Restart** в Setup Node.js App.

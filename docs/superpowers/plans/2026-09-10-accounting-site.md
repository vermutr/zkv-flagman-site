# Accounting Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Russian-language SPA for an accounting company («Баланс Про») with service packages, individual services, team cards, Markdown news, and an order form that emails the owner via SMTP, deployable as one Node app on hoster.by.

**Architecture:** npm-workspaces monorepo. `client/` is a Vite + React 19 SPA (Tailwind v4, react-router declarative mode, react-hook-form + zod) with all content in TypeScript/Markdown files. `server/` is a small Express 5 app (CommonJS) exposing `POST /api/order` (zod validation, rate limit, honeypot, nodemailer) and serving `client/dist` in production.

**Tech Stack:** Node 20+, npm workspaces, Vite 8, React 19, TypeScript, Tailwind CSS 4 (`@tailwindcss/vite`), react-router 8, react-hook-form 7, @hookform/resolvers, zod 4, lucide-react, react-markdown, Express 5, nodemailer, express-rate-limit 8, dotenv, tsx, Vitest, @testing-library/react, jest-dom, jsdom, supertest, concurrently.

**Spec:** `docs/superpowers/specs/2026-09-10-accounting-site-design.md`

## Global Constraints

- Language of all UI copy, content, and emails: Russian. Currency: BYN.
- No admin panel, no CMS, no online payment, no multi-language, no cart (out of scope per spec).
- Client is ESM (`"type": "module"`); server is CommonJS (no `"type"` field) so `__dirname` works on cPanel's Node.
- All content lives under `client/src/content/`; no content hard-coded in pages.
- Order schema is duplicated on client (`client/src/features/order/schema.ts`) and server (`server/src/order/schema.ts`) with identical field rules — do not share packages between workspaces.
- Every task ends with green tests (`npm test` at root) and a commit. Commit messages end with:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01DPSa86vEsb5iQUCgemxZFY
  ```
- Working directory for all commands: `D:\webstorm\projects\accounting-site` (Git Bash syntax is used below).
- Company placeholder name: «Баланс Про». Colors: brand navy `#1e3a5f`, accent emerald `#10b981`. Font: Manrope.

---

## File Structure

```
accounting-site/
  package.json                       workspaces + root scripts (dev/build/start/test)
  .gitignore
  .env.example
  README.md
  client/
    package.json, vite.config.ts, tsconfig*.json, index.html
    src/
      main.tsx                       BrowserRouter + OrderProvider + App
      App.tsx                        Routes
      index.css                      Tailwind import + @theme tokens
      test/setup.ts                  jest-dom matchers
      content/
        types.ts                     Package, Service, TeamMember, OrderItem
        company.ts                   name, phone, email, address, hours
        packages.ts                  3 packages
        services.ts                  10 services, 4 categories
        team.ts                      4 members
        orderItems.ts                allOrderItems(): OrderItem[]
        news/*.md                    3 posts with frontmatter
      lib/
        format.ts                    formatPrice()
        news.ts                      parseFrontmatter(), buildPosts(), loadNews(), getPost()
      components/
        Container.tsx, Button.tsx, SectionHeading.tsx, Modal.tsx, Avatar.tsx
        Header.tsx, Footer.tsx, Layout.tsx
        PackageCard.tsx, ServiceCard.tsx, TeamCard.tsx, NewsCard.tsx
      features/order/
        schema.ts                    orderSchema, OrderValues
        api.ts                       submitOrder()
        OrderForm.tsx
        OrderContext.tsx             OrderProvider, useOrder()
        OrderModal.tsx
      pages/
        HomePage.tsx, ServicesPage.tsx, TeamPage.tsx, NewsPage.tsx,
        NewsArticlePage.tsx, ContactsPage.tsx, NotFoundPage.tsx
  server/
    package.json, tsconfig.json, vitest.config.ts
    src/
      index.ts                       env, createMailer, createApp, listen
      app.ts                         createApp()
      order/schema.ts                orderSchema, Order
      order/mailer.ts                Mailer, createMailer()
      order/templates.ts             ownerMessage(), clientMessage()
    test/order.test.ts, schema.test.ts, templates.test.ts
```

---

### Task 1: Monorepo scaffold with client, server, and test runners

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`
- Create: `client/*` (via create-vite), `client/vite.config.ts`, `client/src/index.css`, `client/src/test/setup.ts`, `client/index.html`
- Create: `server/package.json`, `server/tsconfig.json`, `server/vitest.config.ts`, `server/src/index.ts`
- Test: `client/src/lib/smoke.test.ts`, `server/test/smoke.test.ts` (deleted in later tasks once real tests exist)

**Interfaces:**
- Produces: root scripts `npm run dev`, `npm run build`, `npm start`, `npm test`; client dev server on 5173 proxying `/api` to 3001; server on `PORT` (default 3001).

- [ ] **Step 1: Scaffold client with create-vite and remove template noise**

```bash
npm create vite@latest client -- --template react-ts
cd client
rm -f src/App.css src/assets/react.svg public/vite.svg src/App.tsx src/main.tsx eslint.config.js
npm pkg delete scripts.lint devDependencies.oxlint
cd ..
```

- [ ] **Step 2: Write root package.json, .gitignore, .env.example**

`package.json`:
```json
{
  "name": "accounting-site",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently -n client,server -c cyan,green \"npm run dev -w client\" \"npm run dev -w server\"",
    "build": "npm run build -w client && npm run build -w server",
    "start": "npm start -w server",
    "test": "npm test -w client && npm test -w server"
  },
  "devDependencies": {
    "concurrently": "^10.0.5"
  }
}
```

`.gitignore`:
```
node_modules
dist
.env
*.tsbuildinfo
.DS_Store
```

`.env.example`:
```
# Порт сервера (на hoster.by задаётся cPanel, локально 3001)
PORT=3001
# SMTP ящика, созданного в cPanel hoster.by. Если SMTP_HOST пуст — письма печатаются в консоль.
SMTP_HOST=mail.example.by
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=site@example.by
SMTP_PASS=change-me
# От кого приходят письма
MAIL_FROM="Баланс Про <site@example.by>"
# Куда отправлять заявки
ORDER_TO=owner@example.by
```

- [ ] **Step 3: Write server package.json, tsconfig, vitest config, and a placeholder index**

`server/package.json`:
```json
{
  "name": "server",
  "private": true,
  "version": "0.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.7.0",
    "nodemailer": "^10.0.3",
    "zod": "^4.6.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^24.13.3",
    "@types/supertest": "^7.2.1",
    "supertest": "^7.2.2",
    "tsx": "^4.23.13",
    "typescript": "~6.0.2",
    "vitest": "^5.0.0"
  }
}
```

If `npm install` reports that a pinned version above does not exist, use `npm view <pkg> version` and take the latest.

`server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

`server/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'node', include: ['test/**/*.test.ts'] },
})
```

`server/src/index.ts` (temporary, replaced in Task 5):
```ts
console.log('server placeholder')
```

- [ ] **Step 4: Configure client: vite config with Tailwind, proxy and Vitest; Tailwind theme; jest-dom setup; fonts in index.html**

`client/vite.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
```

`client/src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

`client/src/index.css`:
```css
@import "tailwindcss";

@theme {
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;

  --color-brand-50: #eff4fa;
  --color-brand-100: #d9e4f2;
  --color-brand-200: #b3c8e3;
  --color-brand-500: #2b5590;
  --color-brand-600: #1e3a5f;
  --color-brand-700: #172d4b;
  --color-brand-900: #0f1f33;

  --color-accent-100: #d1fae5;
  --color-accent-400: #34d399;
  --color-accent-500: #10b981;
  --color-accent-600: #059669;

  --shadow-card: 0 1px 2px rgb(15 31 51 / 0.04), 0 8px 24px -8px rgb(15 31 51 / 0.12);
  --shadow-card-hover: 0 2px 4px rgb(15 31 51 / 0.06), 0 16px 40px -12px rgb(15 31 51 / 0.2);
}

html { scroll-behavior: smooth; }
body { @apply bg-stone-50 text-stone-800 antialiased; }
```

`client/index.html` — replace the whole file:
```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Баланс Про — бухгалтерское обслуживание ИП и компаний в Беларуси. Пакеты услуг, отчётность, кадры, консультации." />
    <title>Баланс Про — бухгалтерские услуги</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Add to `client/tsconfig.app.json` `compilerOptions.types`: `["vite/client", "@testing-library/jest-dom"]`.

Minimal `client/src/main.tsx` so `tsc -b` passes (replaced in Task 6):
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>Баланс Про</div>
  </StrictMode>,
)
```

- [ ] **Step 5: Install dependencies**

```bash
npm install
npm install -w client react-router react-hook-form @hookform/resolvers zod lucide-react react-markdown
npm install -w client -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm pkg set -w client scripts.test="vitest run"
```

- [ ] **Step 6: Write smoke tests on both sides**

`client/src/lib/smoke.test.ts`:
```ts
import { expect, test } from 'vitest'

test('vitest runs in jsdom', () => {
  expect(typeof document).toBe('object')
})
```

`server/test/smoke.test.ts`:
```ts
import { expect, test } from 'vitest'

test('vitest runs in node', () => {
  expect(typeof process.version).toBe('string')
})
```

- [ ] **Step 7: Run everything**

Run: `npm test`
Expected: both workspaces report 1 passed.

Run: `npm run build`
Expected: `client/dist/index.html` and `server/dist/index.js` exist, no TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold client/server monorepo with vite, tailwind, express, vitest"
```

---

### Task 2: Content model, data files, and price formatting

**Files:**
- Create: `client/src/content/types.ts`, `company.ts`, `packages.ts`, `services.ts`, `team.ts`, `orderItems.ts`
- Create: `client/src/lib/format.ts`
- Test: `client/src/lib/format.test.ts`, `client/src/content/content.test.ts`
- Delete: `client/src/lib/smoke.test.ts`

**Interfaces:**
- Produces:
  - `type Package = { slug: string; name: string; audience: string; pricePerMonth: number; features: string[]; popular?: boolean }`
  - `type Service = { slug: string; name: string; description: string; priceFrom: number; unit?: string; category: string }`
  - `type TeamMember = { slug: string; name: string; role: string; experienceYears: number; specialties: string[]; bio: string; photo?: string }`
  - `type OrderItem = { kind: 'package' | 'service'; slug: string; name: string }`
  - `packages: Package[]`, `services: Service[]`, `serviceCategories: readonly string[]`, `team: TeamMember[]`, `company`
  - `allOrderItems(): OrderItem[]` (packages first, then services)
  - `formatPrice(amount: number): string` → `'1\u202f500\u00a0BYN'`

- [ ] **Step 1: Write failing tests**

`client/src/lib/format.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('appends BYN with a non-breaking space', () => {
    expect(formatPrice(150)).toBe('150\u00a0BYN')
  })
  it('groups thousands with a narrow no-break space', () => {
    expect(formatPrice(1500)).toBe('1\u202f500\u00a0BYN')
    expect(formatPrice(1234567)).toBe('1\u202f234\u202f567\u00a0BYN')
  })
})
```

`client/src/content/content.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { packages } from './packages'
import { services, serviceCategories } from './services'
import { team } from './team'
import { allOrderItems } from './orderItems'

const unique = (xs: string[]) => new Set(xs).size === xs.length

describe('content integrity', () => {
  it('has unique slugs', () => {
    expect(unique(packages.map((p) => p.slug))).toBe(true)
    expect(unique(services.map((s) => s.slug))).toBe(true)
    expect(unique(team.map((t) => t.slug))).toBe(true)
  })
  it('has exactly one popular package', () => {
    expect(packages.filter((p) => p.popular)).toHaveLength(1)
  })
  it('uses only known service categories', () => {
    for (const s of services) expect(serviceCategories).toContain(s.category)
  })
  it('builds order items from packages then services', () => {
    const items = allOrderItems()
    expect(items).toHaveLength(packages.length + services.length)
    expect(items[0]).toEqual({ kind: 'package', slug: packages[0].slug, name: packages[0].name })
    expect(items.at(-1)).toEqual({ kind: 'service', slug: services.at(-1)!.slug, name: services.at(-1)!.name })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -w client`
Expected: FAIL — cannot resolve `./format`, `./packages`, etc.

- [ ] **Step 3: Write types, content, and formatter**

`client/src/content/types.ts`:
```ts
export type Package = {
  slug: string
  name: string
  audience: string
  pricePerMonth: number
  features: string[]
  popular?: boolean
}

export type Service = {
  slug: string
  name: string
  description: string
  priceFrom: number
  unit?: string
  category: string
}

export type TeamMember = {
  slug: string
  name: string
  role: string
  experienceYears: number
  specialties: string[]
  bio: string
  photo?: string
}

export type OrderItem = {
  kind: 'package' | 'service'
  slug: string
  name: string
}
```

`client/src/content/company.ts`:
```ts
export const company = {
  name: 'Баланс Про',
  tagline: 'Бухгалтерия, которая не отвлекает от бизнеса',
  phone: '+375 29 123-45-67',
  phoneHref: 'tel:+375291234567',
  email: 'info@balancepro.by',
  address: 'г. Минск, ул. Немига, 5, офис 412',
  hours: 'Пн–Пт 9:00–18:00',
  legal: 'ООО «Баланс Про», УНП 190000000',
  foundedYear: 2014,
}
```

`client/src/content/packages.ts`:
```ts
import type { Package } from './types'

export const packages: Package[] = [
  {
    slug: 'ip',
    name: 'ИП',
    audience: 'Для индивидуальных предпринимателей без сотрудников',
    pricePerMonth: 150,
    features: [
      'Ведение книги учёта доходов и расходов',
      'Расчёт и уплата налогов (УСН или подоходный)',
      'Сдача деклараций в ИМНС',
      'Взносы в ФСЗН',
      'Консультации по телефону и в мессенджерах',
    ],
  },
  {
    slug: 'small',
    name: 'Малый бизнес',
    audience: 'Для ООО и ИП с командой до 10 человек',
    pricePerMonth: 450,
    popular: true,
    features: [
      'Полное ведение бухгалтерского учёта',
      'Зарплата, кадры и отчётность по сотрудникам',
      'Налоговая и статистическая отчётность',
      'Первичные документы и сверки с контрагентами',
      'Персональный бухгалтер на связи',
      'Электронный документооборот',
    ],
  },
  {
    slug: 'medium',
    name: 'Средний бизнес',
    audience: 'Для компаний до 50 сотрудников и ВЭД',
    pricePerMonth: 900,
    features: [
      'Всё из пакета «Малый бизнес»',
      'Валютные операции и внешнеэкономическая деятельность',
      'Управленческая отчётность ежемесячно',
      'Сопровождение проверок и запросов госорганов',
      'Налоговое планирование',
      'Главный бухгалтер + помощник',
    ],
  },
]
```

`client/src/content/services.ts`:
```ts
import type { Service } from './types'

export const serviceCategories: readonly string[] = ['Учёт', 'Отчётность', 'Кадры', 'Консультации']

export const services: Service[] = [
  {
    slug: 'primary-docs',
    name: 'Обработка первичных документов',
    description: 'Проверка, ввод и хранение накладных, актов и счетов.',
    priceFrom: 3,
    unit: 'за документ',
    category: 'Учёт',
  },
  {
    slug: 'restore-accounting',
    name: 'Восстановление учёта',
    description: 'Приводим в порядок запущенный учёт за любой период.',
    priceFrom: 600,
    unit: 'за период',
    category: 'Учёт',
  },
  {
    slug: 'bank-reconciliation',
    name: 'Сверка с банком и контрагентами',
    description: 'Акты сверки, контроль дебиторки и кредиторки.',
    priceFrom: 80,
    unit: 'в месяц',
    category: 'Учёт',
  },
  {
    slug: 'tax-declaration',
    name: 'Налоговая декларация',
    description: 'Подготовка и сдача декларации по УСН, НДС, налогу на прибыль.',
    priceFrom: 90,
    unit: 'за декларацию',
    category: 'Отчётность',
  },
  {
    slug: 'annual-report',
    name: 'Годовая отчётность',
    description: 'Баланс, отчёт о прибылях и убытках, пояснительная записка.',
    priceFrom: 350,
    category: 'Отчётность',
  },
  {
    slug: 'fszn-report',
    name: 'Отчётность в ФСЗН и Белгосстрах',
    description: 'ПУ-3, 4-фонд и отчёты по страховым взносам.',
    priceFrom: 60,
    unit: 'за отчёт',
    category: 'Отчётность',
  },
  {
    slug: 'payroll',
    name: 'Расчёт заработной платы',
    description: 'Начисления, удержания, больничные, отпускные, расчётные листки.',
    priceFrom: 15,
    unit: 'за сотрудника в месяц',
    category: 'Кадры',
  },
  {
    slug: 'hr-docs',
    name: 'Кадровое делопроизводство',
    description: 'Приём, увольнение, приказы, трудовые договоры, график отпусков.',
    priceFrom: 120,
    unit: 'в месяц',
    category: 'Кадры',
  },
  {
    slug: 'consultation',
    name: 'Консультация бухгалтера',
    description: 'Ответы на вопросы по налогам, учёту и выбору системы налогообложения.',
    priceFrom: 70,
    unit: 'за час',
    category: 'Консультации',
  },
  {
    slug: 'business-registration',
    name: 'Регистрация ИП или ООО',
    description: 'Подготовка документов, выбор налогового режима, постановка на учёт.',
    priceFrom: 250,
    category: 'Консультации',
  },
]
```

`client/src/content/team.ts`:
```ts
import type { TeamMember } from './types'

export const team: TeamMember[] = [
  {
    slug: 'elena-kovaleva',
    name: 'Елена Ковалёва',
    role: 'Главный бухгалтер, руководитель',
    experienceYears: 17,
    specialties: ['Налоговое планирование', 'ВЭД', 'Проверки'],
    bio: 'Основала «Баланс Про» в 2014 году. Аттестованный главный бухгалтер, сопровождала более 200 проверок.',
  },
  {
    slug: 'andrei-sidorenko',
    name: 'Андрей Сидоренко',
    role: 'Ведущий бухгалтер',
    experienceYears: 11,
    specialties: ['ООО на общей системе', 'НДС', 'Производство'],
    bio: 'Ведёт производственные и торговые компании. Любит, когда цифры сходятся с первого раза.',
  },
  {
    slug: 'olga-marchuk',
    name: 'Ольга Марчук',
    role: 'Бухгалтер по зарплате и кадрам',
    experienceYears: 8,
    specialties: ['Зарплата', 'Кадры', 'ФСЗН'],
    bio: 'Отвечает за то, чтобы сотрудники клиентов получали зарплату вовремя, а отчёты в фонды уходили без ошибок.',
  },
  {
    slug: 'dmitry-voronov',
    name: 'Дмитрий Воронов',
    role: 'Бухгалтер для ИП',
    experienceYears: 6,
    specialties: ['ИП на УСН', 'Самозанятые', 'Регистрация бизнеса'],
    bio: 'Помогает предпринимателям стартовать: выбрать режим, зарегистрироваться и не пропустить первый отчёт.',
  },
]
```

`client/src/content/orderItems.ts`:
```ts
import { packages } from './packages'
import { services } from './services'
import type { OrderItem } from './types'

export function allOrderItems(): OrderItem[] {
  return [
    ...packages.map((p) => ({ kind: 'package' as const, slug: p.slug, name: p.name })),
    ...services.map((s) => ({ kind: 'service' as const, slug: s.slug, name: s.name })),
  ]
}
```

`client/src/lib/format.ts`:
```ts
const NARROW_NBSP = '\u202f'
const NBSP = '\u00a0'

export function formatPrice(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP)
  return `${grouped}${NBSP}BYN`
}
```

Delete `client/src/lib/smoke.test.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -w client`
Expected: PASS (format 2 tests, content 4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): add content model, placeholder data, and price formatting"
```

---

### Task 3: News loader from Markdown files

**Files:**
- Create: `client/src/lib/news.ts`
- Create: `client/src/content/news/2026-08-20-elektronnye-nakladnye.md`, `2026-07-03-nalogovye-izmeneniya.md`, `2026-05-15-novyi-ofis.md`
- Test: `client/src/lib/news.test.ts`

**Interfaces:**
- Produces:
  - `type NewsPost = { slug: string; title: string; date: string; excerpt: string; cover?: string; body: string }`
  - `parseFrontmatter(raw: string): { data: Record<string, string>; body: string }`
  - `buildPosts(files: Record<string, string>): NewsPost[]` — keys are file paths, values raw markdown; sorted by date desc; slug = filename without extension
  - `loadNews(): NewsPost[]`, `getPost(slug: string): NewsPost | undefined`

- [ ] **Step 1: Write failing tests**

`client/src/lib/news.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { buildPosts, parseFrontmatter } from './news'

const raw = `---
title: Заголовок
date: 2026-08-20
excerpt: Кратко
cover: /news/a.jpg
---

# Текст

Абзац.`

describe('parseFrontmatter', () => {
  it('splits frontmatter keys from the body', () => {
    const { data, body } = parseFrontmatter(raw)
    expect(data).toEqual({ title: 'Заголовок', date: '2026-08-20', excerpt: 'Кратко', cover: '/news/a.jpg' })
    expect(body.trim()).toBe('# Текст\n\nАбзац.')
  })
  it('returns empty data when there is no frontmatter', () => {
    expect(parseFrontmatter('just text')).toEqual({ data: {}, body: 'just text' })
  })
})

describe('buildPosts', () => {
  it('derives slug from filename and sorts newest first', () => {
    const posts = buildPosts({
      '../content/news/2026-01-01-old.md': '---\ntitle: Old\ndate: 2026-01-01\nexcerpt: o\n---\nold',
      '../content/news/2026-03-01-new.md': '---\ntitle: New\ndate: 2026-03-01\nexcerpt: n\n---\nnew',
    })
    expect(posts.map((p) => p.slug)).toEqual(['2026-03-01-new', '2026-01-01-old'])
    expect(posts[0]).toMatchObject({ title: 'New', date: '2026-03-01', excerpt: 'n', body: 'new' })
    expect(posts[0].cover).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -w client -- news`
Expected: FAIL — cannot resolve `./news`.

- [ ] **Step 3: Implement news loader and three posts**

`client/src/lib/news.ts`:
```ts
export type NewsPost = {
  slug: string
  title: string
  date: string
  excerpt: string
  cover?: string
  body: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(FRONTMATTER)
  if (!match) return { data: {}, body: raw }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { data, body: raw.slice(match[0].length) }
}

export function buildPosts(files: Record<string, string>): NewsPost[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace(/\.md$/, '')
      const { data, body } = parseFrontmatter(raw)
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
        cover: data.cover || undefined,
        body,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

const files = import.meta.glob('../content/news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const posts = buildPosts(files)

export function loadNews(): NewsPost[] {
  return posts
}

export function getPost(slug: string): NewsPost | undefined {
  return posts.find((p) => p.slug === slug)
}
```

`client/src/content/news/2026-08-20-elektronnye-nakladnye.md`:
```md
---
title: Переходим на электронные накладные вместе с клиентами
date: 2026-08-20
excerpt: С сентября все наши клиенты на пакетах «Малый» и «Средний бизнес» получают ЭДО без доплаты.
---

С 1 сентября мы подключаем электронный документооборот всем клиентам на пакетах «Малый бизнес» и «Средний бизнес» без дополнительной оплаты.

## Что это даёт

- Накладные и акты подписываются за минуту, без курьера и печати.
- Документы не теряются: всё хранится в архиве с поиском.
- Мы видим документ сразу и проводим его в учёте в тот же день.

## Что нужно от вас

Электронная цифровая подпись (ЭЦП). Если её ещё нет, поможем оформить — напишите своему бухгалтеру.
```

`client/src/content/news/2026-07-03-nalogovye-izmeneniya.md`:
```md
---
title: Что изменилось в налогах с июля: коротко для ИП и ООО
date: 2026-07-03
excerpt: Собрали главные изменения второго полугодия и объяснили, кого они касаются.
---

Во втором полугодии вступает в силу несколько изменений, которые затрагивают большинство наших клиентов.

## Для ИП

Уточнены критерии применения упрощённой системы. Если ваш оборот близок к порогу, свяжитесь с бухгалтером: возможно, выгоднее заранее сменить режим.

## Для ООО

Обновлены формы статистической отчётности. Мы уже перенастроили шаблоны, от вас ничего не требуется.

## Для всех

Изменились сроки уплаты некоторых платежей. В личных напоминаниях, которые мы отправляем, даты уже обновлены.
```

`client/src/content/news/2026-05-15-novyi-ofis.md`:
```md
---
title: Мы переехали в новый офис на Немиге
date: 2026-05-15
excerpt: Теперь встречаемся с клиентами в центре Минска, в пяти минутах от метро.
---

С 15 мая наш офис находится по адресу: г. Минск, ул. Немига, 5, офис 412.

Рядом станция метро «Немига», есть парковка во дворе. Приходите знакомиться, кофе с нас.

Телефоны и почта не изменились.
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -w client -- news`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(news): load markdown posts with frontmatter"
```

---

### Task 4: Server order schema and email templates

**Files:**
- Create: `server/src/order/schema.ts`, `server/src/order/templates.ts`, `server/src/order/mailer.ts`
- Test: `server/test/schema.test.ts`, `server/test/templates.test.ts`
- Delete: `server/test/smoke.test.ts`

**Interfaces:**
- Produces:
  - `orderSchema`, `type Order = z.infer<typeof orderSchema>` with fields `name`, `phone`, `email`, `company?`, `message?`, `item?: { kind: 'package' | 'service'; slug: string; name: string }`, `website?` (honeypot)
  - `type MailMessage = { to: string; subject: string; text: string }`
  - `type Mailer = { send(msg: MailMessage): Promise<void> }`
  - `createMailer(env: NodeJS.ProcessEnv): Mailer`
  - `ownerMessage(order: Order, to: string): MailMessage`, `clientMessage(order: Order): MailMessage`

- [ ] **Step 1: Write failing tests**

`server/test/schema.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { orderSchema } from '../src/order/schema'

const valid = {
  name: 'Иван',
  phone: '+375 29 123-45-67',
  email: 'ivan@example.com',
  company: 'ООО Ромашка',
  message: 'Хочу пакет',
  item: { kind: 'package', slug: 'small', name: 'Малый бизнес' },
  website: '',
}

describe('orderSchema', () => {
  it('accepts a valid order', () => {
    expect(orderSchema.safeParse(valid).success).toBe(true)
  })
  it('accepts an order without item, company and message', () => {
    const { item: _i, company: _c, message: _m, ...rest } = valid
    expect(orderSchema.safeParse(rest).success).toBe(true)
  })
  it('rejects short name, bad phone and bad email', () => {
    const r = orderSchema.safeParse({ ...valid, name: 'И', phone: 'abc', email: 'nope' })
    expect(r.success).toBe(false)
    const paths = r.error!.issues.map((i) => i.path.join('.'))
    expect(paths).toEqual(expect.arrayContaining(['name', 'phone', 'email']))
  })
  it('rejects unknown item kind', () => {
    expect(orderSchema.safeParse({ ...valid, item: { ...valid.item, kind: 'x' } }).success).toBe(false)
  })
})
```

`server/test/templates.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { clientMessage, ownerMessage } from '../src/order/templates'
import type { Order } from '../src/order/schema'

const order: Order = {
  name: 'Иван',
  phone: '+375 29 123-45-67',
  email: 'ivan@example.com',
  company: 'ООО Ромашка',
  message: 'Хочу пакет',
  item: { kind: 'package', slug: 'small', name: 'Малый бизнес' },
}

describe('ownerMessage', () => {
  it('addresses the owner and lists every field', () => {
    const m = ownerMessage(order, 'owner@x.by')
    expect(m.to).toBe('owner@x.by')
    expect(m.subject).toBe('Заявка с сайта: Малый бизнес (пакет)')
    for (const s of ['Иван', '+375 29 123-45-67', 'ivan@example.com', 'ООО Ромашка', 'Хочу пакет']) {
      expect(m.text).toContain(s)
    }
  })
  it('uses a generic subject without an item', () => {
    const { item: _i, ...rest } = order
    expect(ownerMessage(rest, 'o@x.by').subject).toBe('Обращение с сайта')
  })
})

describe('clientMessage', () => {
  it('confirms to the client', () => {
    const m = clientMessage(order)
    expect(m.to).toBe('ivan@example.com')
    expect(m.subject).toBe('Мы получили вашу заявку — Баланс Про')
    expect(m.text).toContain('Малый бизнес')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -w server`
Expected: FAIL — cannot resolve `../src/order/schema` and `../src/order/templates`.

- [ ] **Step 3: Implement schema, templates, mailer**

`server/src/order/schema.ts`:
```ts
import { z } from 'zod'

export const orderItemSchema = z.object({
  kind: z.enum(['package', 'service']),
  slug: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
})

export const orderSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{9,20}$/, 'Введите корректный телефон'),
  email: z.email('Введите корректный email').max(200),
  company: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
  item: orderItemSchema.optional(),
  website: z.string().max(0).optional(),
})

export type Order = z.infer<typeof orderSchema>
```

`server/src/order/mailer.ts`:
```ts
import nodemailer from 'nodemailer'

export type MailMessage = { to: string; subject: string; text: string }

export type Mailer = { send(msg: MailMessage): Promise<void> }

export function createMailer(env: NodeJS.ProcessEnv): Mailer {
  const from = env.MAIL_FROM || 'site@localhost'

  if (!env.SMTP_HOST) {
    console.warn('[mailer] SMTP_HOST не задан — письма печатаются в консоль')
    return {
      async send(msg) {
        console.log(`[mailer] → ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}\n`)
      },
    }
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 465),
    secure: (env.SMTP_SECURE ?? 'true') !== 'false',
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  })

  return {
    async send(msg) {
      await transport.sendMail({ from, ...msg })
    },
  }
}
```

`server/src/order/templates.ts`:
```ts
import type { Order } from './schema'
import type { MailMessage } from './mailer'

const KIND_LABEL = { package: 'пакет', service: 'услуга' } as const

function itemLine(order: Order): string {
  return order.item ? `${order.item.name} (${KIND_LABEL[order.item.kind]})` : 'не указана'
}

export function ownerMessage(order: Order, to: string): MailMessage {
  const subject = order.item ? `Заявка с сайта: ${itemLine(order)}` : 'Обращение с сайта'
  const text = [
    'Новая заявка с сайта',
    '',
    `Услуга: ${itemLine(order)}`,
    `Имя: ${order.name}`,
    `Телефон: ${order.phone}`,
    `Email: ${order.email}`,
    `Компания: ${order.company || '—'}`,
    '',
    'Комментарий:',
    order.message || '—',
  ].join('\n')
  return { to, subject, text }
}

export function clientMessage(order: Order): MailMessage {
  const text = [
    `Здравствуйте, ${order.name}!`,
    '',
    'Мы получили вашу заявку и свяжемся с вами в рабочее время (Пн–Пт 9:00–18:00).',
    `Услуга: ${itemLine(order)}`,
    '',
    'С уважением,',
    'команда Баланс Про',
  ].join('\n')
  return { to: order.email, subject: 'Мы получили вашу заявку — Баланс Про', text }
}
```

Delete `server/test/smoke.test.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -w server`
Expected: PASS (schema 4, templates 3).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(server): order schema, email templates, and SMTP mailer"
```

---

### Task 5: Express app with /api/order, rate limit, honeypot, static SPA

**Files:**
- Create: `server/src/app.ts`
- Modify: `server/src/index.ts` (replace placeholder)
- Test: `server/test/order.test.ts`

**Interfaces:**
- Consumes: `orderSchema`, `Order`, `Mailer`, `ownerMessage`, `clientMessage` from Task 4.
- Produces: `createApp(opts: { mailer: Mailer; orderTo: string; staticDir?: string; rateLimit?: boolean }): express.Express`

- [ ] **Step 1: Write failing tests**

`server/test/order.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import type { Mailer } from '../src/order/mailer'

const valid = {
  name: 'Иван',
  phone: '+375 29 123-45-67',
  email: 'ivan@example.com',
  item: { kind: 'package', slug: 'small', name: 'Малый бизнес' },
}

let send: ReturnType<typeof vi.fn>
let mailer: Mailer

beforeEach(() => {
  send = vi.fn().mockResolvedValue(undefined)
  mailer = { send }
})

const app = () => createApp({ mailer, orderTo: 'owner@x.by', rateLimit: false })

describe('POST /api/order', () => {
  it('sends owner and client emails for a valid order', async () => {
    const res = await request(app()).post('/api/order').send(valid)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
    expect(send).toHaveBeenCalledTimes(2)
    expect(send.mock.calls[0][0].to).toBe('owner@x.by')
    expect(send.mock.calls[1][0].to).toBe('ivan@example.com')
  })

  it('returns 400 with field errors for an invalid order', async () => {
    const res = await request(app()).post('/api/order').send({ ...valid, email: 'bad' })
    expect(res.status).toBe(400)
    expect(res.body.ok).toBe(false)
    expect(res.body.errors).toHaveProperty('email')
    expect(send).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions', async () => {
    const res = await request(app()).post('/api/order').send({ ...valid, website: 'http://spam' })
    expect(res.status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it('returns 502 when the mailer fails', async () => {
    send.mockRejectedValueOnce(new Error('smtp down'))
    const res = await request(app()).post('/api/order').send(valid)
    expect(res.status).toBe(502)
    expect(res.body.ok).toBe(false)
  })

  it('rate limits after 5 requests when enabled', async () => {
    const limited = createApp({ mailer, orderTo: 'o@x.by', rateLimit: true })
    for (let i = 0; i < 5; i++) await request(limited).post('/api/order').send(valid)
    const res = await request(limited).post('/api/order').send(valid)
    expect(res.status).toBe(429)
  })
})

describe('GET /api/health', () => {
  it('responds ok', async () => {
    const res = await request(app()).get('/api/health')
    expect(res.body).toEqual({ ok: true })
  })
  it('returns JSON 404 for unknown api routes', async () => {
    const res = await request(app()).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ ok: false, error: 'Not found' })
  })
})
```

Note on the honeypot test: the schema allows `website` only when empty (`max(0)`), so a filled honeypot fails validation. The app must check the honeypot on the raw body **before** validating, and answer 200 without sending.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -w server -- order`
Expected: FAIL — cannot resolve `../src/app`.

- [ ] **Step 3: Implement app and entrypoint**

`server/src/app.ts`:
```ts
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { rateLimit } from 'express-rate-limit'
import { orderSchema } from './order/schema'
import type { Mailer } from './order/mailer'
import { clientMessage, ownerMessage } from './order/templates'

export type AppOptions = {
  mailer: Mailer
  orderTo: string
  staticDir?: string
  rateLimit?: boolean
}

export function createApp(opts: AppOptions): express.Express {
  const app = express()
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '32kb' }))

  const api = express.Router()

  api.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  const orderLimiter =
    opts.rateLimit === false
      ? (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()
      : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 5,
          standardHeaders: 'draft-8',
          legacyHeaders: false,
          message: { ok: false, error: 'Слишком много заявок, попробуйте позже' },
        })

  api.post('/order', orderLimiter, async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    if (typeof body.website === 'string' && body.website.length > 0) {
      res.json({ ok: true })
      return
    }
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'form'
        if (!errors[key]) errors[key] = issue.message
      }
      res.status(400).json({ ok: false, errors })
      return
    }
    const order = parsed.data
    try {
      await opts.mailer.send(ownerMessage(order, opts.orderTo))
      await opts.mailer.send(clientMessage(order))
      res.json({ ok: true })
    } catch (err) {
      console.error('[order] mail error', err)
      res.status(502).json({ ok: false, error: 'Не удалось отправить письмо' })
    }
  })

  api.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Not found' })
  })

  app.use('/api', api)

  if (opts.staticDir && fs.existsSync(opts.staticDir)) {
    const indexHtml = path.join(opts.staticDir, 'index.html')
    app.use(express.static(opts.staticDir, { maxAge: '1h', index: false }))
    app.use((_req, res) => {
      res.sendFile(indexHtml)
    })
  }

  return app
}
```

`server/src/index.ts`:
```ts
import path from 'node:path'
import dotenv from 'dotenv'
import { createApp } from './app'
import { createMailer } from './order/mailer'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const port = Number(process.env.PORT || 3001)
const orderTo = process.env.ORDER_TO || ''
if (!orderTo) console.warn('[server] ORDER_TO не задан — заявки некуда отправлять')

const app = createApp({
  mailer: createMailer(process.env),
  orderTo,
  staticDir: path.resolve(__dirname, '../../client/dist'),
})

app.listen(port, () => {
  console.log(`[server] http://localhost:${port}`)
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -w server`
Expected: PASS (order 7 tests plus schema and templates).

- [ ] **Step 5: Manual check of dev server**

Start in background: `npm run dev -w server`
Run:
```bash
curl -s -X POST localhost:3001/api/order -H "content-type: application/json" -d '{"name":"Иван","phone":"+375291234567","email":"i@x.by"}'
```
Expected: `{"ok":true}` and the email text printed in the server console (no SMTP configured). Stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(server): express app with order endpoint, rate limit, honeypot, static SPA"
```

---

### Task 6: Client shell: layout components, routing, page stubs

**Files:**
- Create: `client/src/components/Container.tsx`, `Button.tsx`, `SectionHeading.tsx`, `Header.tsx`, `Footer.tsx`, `Layout.tsx`
- Create: `client/src/pages/HomePage.tsx`, `ServicesPage.tsx`, `TeamPage.tsx`, `NewsPage.tsx`, `NewsArticlePage.tsx`, `ContactsPage.tsx`, `NotFoundPage.tsx` (stubs, filled in Tasks 8–12)
- Create: `client/src/App.tsx`
- Modify: `client/src/main.tsx`
- Test: `client/src/App.test.tsx`

**Interfaces:**
- Consumes: `company` from Task 2.
- Produces:
  - `<Container className?>` — `mx-auto max-w-6xl px-4 sm:px-6`
  - `<Button variant?: 'primary' | 'secondary' | 'accent' | 'ghost'; size?: 'md' | 'lg'>` (native button props) and `<ButtonLink to variant? size? className?>` (react-router Link); `buttonClass(variant, size, extra)` helper
  - `<SectionHeading eyebrow? title subtitle? align?: 'left' | 'center'>`
  - `<Header onOrderClick: () => void>`, `<Footer>`, `<Layout onOrderClick>` (renders `<Outlet />`)
  - `App` renders `Routes` for `/`, `/services`, `/team`, `/news`, `/news/:slug`, `/contacts`, `*`.
  - `App` accepts prop `onOrderClick?: () => void` (wired to the order context in Task 7).

- [ ] **Step 1: Write failing test**

`client/src/App.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App shell', () => {
  it('renders navigation with all sections', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Основное меню' })
    for (const label of ['Услуги', 'Команда', 'Новости', 'Контакты']) {
      expect(nav).toHaveTextContent(label)
    }
  })
  it('renders 404 page for unknown routes', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w client -- App`
Expected: FAIL — cannot resolve `./App`.

- [ ] **Step 3: Implement components, page stubs, App, main**

`client/src/components/Container.tsx`:
```tsx
import type { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
}
```

`client/src/components/Button.tsx`:
```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md active:translate-y-px',
  secondary: 'bg-white text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50',
  accent: 'bg-accent-500 text-white shadow-sm hover:bg-accent-600 hover:shadow-md active:translate-y-px',
  ghost: 'text-brand-600 hover:bg-brand-50',
}

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />
}

type ButtonLinkProps = { to: string; children: ReactNode; variant?: Variant; size?: Size; className?: string }

export function ButtonLink({ to, children, variant = 'primary', size = 'md', className = '' }: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}
```

`client/src/components/SectionHeading.tsx`:
```tsx
type Props = { eyebrow?: string; title: string; subtitle?: string; align?: 'left' | 'center' }

export function SectionHeading({ eyebrow, title, subtitle, align = 'left' }: Props) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''
  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent-600">{eyebrow}</p>}
      <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-stone-600">{subtitle}</p>}
    </div>
  )
}
```

`client/src/components/Header.tsx`:
```tsx
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Menu, X } from 'lucide-react'
import { company } from '../content/company'
import { Container } from './Container'
import { Button } from './Button'

const links = [
  { to: '/services', label: 'Услуги' },
  { to: '/team', label: 'Команда' },
  { to: '/news', label: 'Новости' },
  { to: '/contacts', label: 'Контакты' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:text-brand-700'
  }`

export function Header({ onOrderClick }: { onOrderClick: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-brand-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">БП</span>
          {company.name}
        </Link>
        <nav aria-label="Основное меню" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button onClick={onOrderClick}>Заказать услугу</Button>
        </div>
        <button
          className="rounded-lg p-2 text-brand-900 md:hidden"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </Container>
      {open && (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <Button
              className="mt-2"
              onClick={() => {
                setOpen(false)
                onOrderClick()
              }}
            >
              Заказать услугу
            </Button>
          </Container>
        </div>
      )}
    </header>
  )
}
```

`client/src/components/Footer.tsx`:
```tsx
import { Link } from 'react-router'
import { company } from '../content/company'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-white">
      <Container className="grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-brand-900">{company.name}</p>
          <p className="mt-2 text-sm text-stone-600">{company.tagline}</p>
          <p className="mt-4 text-xs text-stone-500">{company.legal}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-brand-900">Разделы</p>
          <ul className="mt-3 space-y-2 text-stone-600">
            <li><Link to="/services" className="hover:text-brand-700">Услуги и пакеты</Link></li>
            <li><Link to="/team" className="hover:text-brand-700">Команда</Link></li>
            <li><Link to="/news" className="hover:text-brand-700">Новости</Link></li>
            <li><Link to="/contacts" className="hover:text-brand-700">Контакты</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-brand-900">Контакты</p>
          <ul className="mt-3 space-y-2 text-stone-600">
            <li><a href={company.phoneHref} className="hover:text-brand-700">{company.phone}</a></li>
            <li><a href={`mailto:${company.email}`} className="hover:text-brand-700">{company.email}</a></li>
            <li>{company.address}</li>
            <li>{company.hours}</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {company.name}
      </div>
    </footer>
  )
}
```

`client/src/components/Layout.tsx`:
```tsx
import { Outlet } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout({ onOrderClick }: { onOrderClick: () => void }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header onOrderClick={onOrderClick} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

Page stubs — each file exports a default component. Create all six with this shape (adjust the component name and heading text):

`client/src/pages/HomePage.tsx`:
```tsx
import { Container } from '../components/Container'

export default function HomePage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold text-brand-900">Главная</h1>
    </Container>
  )
}
```

Same pattern for `ServicesPage.tsx` (h1 «Услуги»), `TeamPage.tsx` («Команда»), `NewsPage.tsx` («Новости»), `NewsArticlePage.tsx` («Статья»), `ContactsPage.tsx` («Контакты»).

`client/src/pages/NotFoundPage.tsx`:
```tsx
import { Container } from '../components/Container'
import { ButtonLink } from '../components/Button'

export default function NotFoundPage() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Ошибка 404</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-900">Страница не найдена</h1>
      <p className="mt-3 text-stone-600">Возможно, ссылка устарела или в адресе опечатка.</p>
      <ButtonLink to="/" className="mt-8">На главную</ButtonLink>
    </Container>
  )
}
```

`client/src/App.tsx`:
```tsx
import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import TeamPage from './pages/TeamPage'
import NewsPage from './pages/NewsPage'
import NewsArticlePage from './pages/NewsArticlePage'
import ContactsPage from './pages/ContactsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App({ onOrderClick = () => {} }: { onOrderClick?: () => void }) {
  return (
    <Routes>
      <Route element={<Layout onOrderClick={onOrderClick} />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsArticlePage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
```

`client/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -w client -- App`
Expected: PASS (2 tests).

Run: `npm run build -w client`
Expected: success, no type errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(client): app shell with header, footer, routing, and page stubs"
```

---

### Task 7: Order feature: schema, API client, form, modal, context

**Files:**
- Create: `client/src/components/Modal.tsx`
- Create: `client/src/features/order/schema.ts`, `api.ts`, `OrderForm.tsx`, `OrderContext.tsx`, `OrderModal.tsx`
- Create: `client/src/Root.tsx`, `client/src/test/render.tsx`
- Modify: `client/src/main.tsx`, `client/src/App.test.tsx`
- Test: `client/src/features/order/schema.test.ts`, `client/src/features/order/OrderForm.test.tsx`

**Interfaces:**
- Consumes: `OrderItem`, `allOrderItems()` (Task 2); `Button` (Task 6); `App` prop `onOrderClick`.
- Produces:
  - `<Modal open onClose title>` — dialog with Escape/backdrop close, `role="dialog"`.
  - `orderFormSchema`, `type OrderFormValues = { name; phone; email; company?; message?; itemKey?; website? }`, `type OrderPayload = Omit<OrderFormValues, 'itemKey'> & { item?: OrderItem }`, `itemKey(item): string` (`"kind:slug"`), `toPayload(values, items): OrderPayload`
  - `submitOrder(payload): Promise<void>` throws `OrderError` with `fieldErrors`
  - `<OrderForm items initialItem? showItemSelect? onSuccess?>`
  - `OrderProvider`, `useOrder(): { isOpen; item?; open(item?: OrderItem); close() }`
  - `<OrderModal />` — reads context, renders Modal + OrderForm
  - `Root` — `App` wired to context + `OrderModal`
  - `renderApp(path: string)` test helper: `OrderProvider` + `MemoryRouter` + `Root`

- [ ] **Step 1: Write failing tests**

`client/src/features/order/schema.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { itemKey, orderFormSchema, toPayload } from './schema'

const items = [
  { kind: 'package' as const, slug: 'small', name: 'Малый бизнес' },
  { kind: 'service' as const, slug: 'payroll', name: 'Расчёт заработной платы' },
]

describe('orderFormSchema', () => {
  it('reports russian messages for required fields', () => {
    const r = orderFormSchema.safeParse({ name: '', phone: '', email: '' })
    expect(r.success).toBe(false)
    const messages = r.error!.issues.map((i) => i.message)
    expect(messages).toEqual(expect.arrayContaining(['Введите имя', 'Введите корректный телефон', 'Введите корректный email']))
  })
})

describe('toPayload', () => {
  it('maps itemKey to the matching item', () => {
    const payload = toPayload(
      { name: 'Иван', phone: '+375291234567', email: 'i@x.by', itemKey: itemKey(items[1]) },
      items,
    )
    expect(payload.item).toEqual(items[1])
    expect(payload).not.toHaveProperty('itemKey')
  })
  it('omits item when key is empty or unknown', () => {
    expect(toPayload({ name: 'Иван', phone: '+375291234567', email: 'i@x.by', itemKey: '' }, items).item).toBeUndefined()
    expect(toPayload({ name: 'Иван', phone: '+375291234567', email: 'i@x.by', itemKey: 'x:y' }, items).item).toBeUndefined()
  })
})
```

`client/src/features/order/OrderForm.test.tsx`:
```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderForm } from './OrderForm'

const items = [
  { kind: 'package' as const, slug: 'small', name: 'Малый бизнес' },
  { kind: 'service' as const, slug: 'payroll', name: 'Расчёт заработной платы' },
]

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

async function fillRequired() {
  await userEvent.type(screen.getByLabelText('Имя'), 'Иван')
  await userEvent.type(screen.getByLabelText('Телефон'), '+375 29 123-45-67')
  await userEvent.type(screen.getByLabelText('Email'), 'ivan@example.com')
}

describe('OrderForm', () => {
  it('shows validation errors and does not submit', async () => {
    render(<OrderForm items={items} showItemSelect />)
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByText('Введите имя')).toBeInTheDocument()
    expect(screen.getByText('Введите корректный телефон')).toBeInTheDocument()
    expect(screen.getByText('Введите корректный email')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits the selected item and shows success', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    const onSuccess = vi.fn()
    render(<OrderForm items={items} initialItem={items[1]} showItemSelect onSuccess={onSuccess} />)
    expect(screen.getByLabelText('Услуга')).toHaveValue('service:payroll')
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByText('Заявка отправлена')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/order')
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({ name: 'Иван', email: 'ivan@example.com', item: items[1] })
    expect(body).not.toHaveProperty('itemKey')
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('shows the server error message on failure', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ ok: false, error: 'Не удалось отправить письмо' }),
    })
    render(<OrderForm items={items} />)
    expect(screen.queryByLabelText('Услуга')).not.toBeInTheDocument()
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось отправить письмо')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -w client -- order`
Expected: FAIL — cannot resolve `./schema` / `./OrderForm`.

- [ ] **Step 3: Implement Modal, schema, api, form, context, modal, root, test helper**

`client/src/components/Modal.tsx`:
```tsx
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode }

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-2xl font-bold text-brand-900">
            {title}
          </h2>
          <button onClick={onClose} aria-label="Закрыть" className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
            <X size={20} />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
```

`client/src/features/order/schema.ts`:
```ts
import { z } from 'zod'
import type { OrderItem } from '../../content/types'

export const orderFormSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100, 'Слишком длинное имя'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{9,20}$/, 'Введите корректный телефон'),
  email: z.email('Введите корректный email').max(200, 'Слишком длинный email'),
  company: z.string().trim().max(200, 'Слишком длинное название').optional(),
  message: z.string().trim().max(2000, 'Не больше 2000 символов').optional(),
  itemKey: z.string().optional(),
  website: z.string().max(0).optional(),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>

export type OrderPayload = Omit<OrderFormValues, 'itemKey'> & { item?: OrderItem }

export function itemKey(item: OrderItem): string {
  return `${item.kind}:${item.slug}`
}

export function toPayload(values: OrderFormValues, items: OrderItem[]): OrderPayload {
  const { itemKey: key, ...rest } = values
  const item = key ? items.find((i) => itemKey(i) === key) : undefined
  return item ? { ...rest, item } : rest
}
```

`client/src/features/order/api.ts`:
```ts
import type { OrderPayload } from './schema'

export class OrderError extends Error {
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'OrderError'
    this.fieldErrors = fieldErrors
  }
}

const FALLBACK = 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.'

export async function submitOrder(payload: OrderPayload): Promise<void> {
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (res.ok) return
  let data: { error?: string; errors?: Record<string, string> } = {}
  try {
    data = await res.json()
  } catch {
    // non-JSON error body
  }
  throw new OrderError(data.error ?? FALLBACK, data.errors)
}
```

`client/src/features/order/OrderForm.tsx`:
```tsx
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import type { OrderItem } from '../../content/types'
import { Button } from '../../components/Button'
import { itemKey, orderFormSchema, toPayload, type OrderFormValues } from './schema'
import { OrderError, submitOrder } from './api'

type Props = {
  items: OrderItem[]
  initialItem?: OrderItem
  showItemSelect?: boolean
  onSuccess?: () => void
}

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="status">
          {error}
        </p>
      )}
    </div>
  )
}

export function OrderForm({ items, initialItem, showItemSelect = false, onSuccess }: Props) {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { itemKey: initialItem ? itemKey(initialItem) : '', website: '' },
  })

  const onSubmit = async (values: OrderFormValues) => {
    setServerError(null)
    try {
      await submitOrder(toPayload(values, items))
      setSent(true)
      onSuccess?.()
    } catch (err) {
      if (err instanceof OrderError) {
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          if (field in values) setError(field as keyof OrderFormValues, { message })
        }
        setServerError(err.message)
      } else {
        setServerError('Нет соединения с сервером. Проверьте интернет и попробуйте снова.')
      }
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-accent-100 p-6 text-center">
        <CheckCircle2 className="mx-auto text-accent-600" size={40} />
        <h3 className="mt-3 text-xl font-bold text-brand-900">Заявка отправлена</h3>
        <p className="mt-2 text-sm text-stone-700">
          Мы получили ваши данные и свяжемся с вами в рабочее время. Копия заявки ушла на вашу почту.
        </p>
      </div>
    )
  }

  const packages = items.filter((i) => i.kind === 'package')
  const services = items.filter((i) => i.kind === 'service')

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {showItemSelect && (
        <Field id="order-item" label="Услуга" error={errors.itemKey?.message}>
          <select id="order-item" className={inputClass} {...register('itemKey')}>
            <option value="">Пока не решил(а)</option>
            <optgroup label="Пакеты">
              {packages.map((i) => (
                <option key={itemKey(i)} value={itemKey(i)}>
                  {i.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Отдельные услуги">
              {services.map((i) => (
                <option key={itemKey(i)} value={itemKey(i)}>
                  {i.name}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
      )}
      <Field id="order-name" label="Имя" error={errors.name?.message}>
        <input id="order-name" className={inputClass} placeholder="Как к вам обращаться" autoComplete="name" {...register('name')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="order-phone" label="Телефон" error={errors.phone?.message}>
          <input id="order-phone" className={inputClass} placeholder="+375 29 000-00-00" autoComplete="tel" inputMode="tel" {...register('phone')} />
        </Field>
        <Field id="order-email" label="Email" error={errors.email?.message}>
          <input id="order-email" className={inputClass} placeholder="you@company.by" autoComplete="email" inputMode="email" {...register('email')} />
        </Field>
      </div>
      <Field id="order-company" label="Компания или ИП" error={errors.company?.message}>
        <input id="order-company" className={inputClass} placeholder="Необязательно" autoComplete="organization" {...register('company')} />
      </Field>
      <Field id="order-message" label="Комментарий" error={errors.message?.message}>
        <textarea id="order-message" rows={3} className={inputClass} placeholder="Расскажите о задаче: вид деятельности, количество сотрудников, система налогообложения" {...register('message')} />
      </Field>
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="order-website">Website</label>
        <input id="order-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      {serverError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
      </Button>
      <p className="text-center text-xs text-stone-500">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
    </form>
  )
}
```

`client/src/features/order/OrderContext.tsx`:
```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { OrderItem } from '../../content/types'

type OrderContextValue = {
  isOpen: boolean
  item?: OrderItem
  open: (item?: OrderItem) => void
  close: () => void
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [item, setItem] = useState<OrderItem | undefined>(undefined)

  const open = useCallback((next?: OrderItem) => {
    setItem(next)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ isOpen, item, open, close }), [isOpen, item, open, close])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used within OrderProvider')
  return ctx
}
```

`client/src/features/order/OrderModal.tsx`:
```tsx
import { Modal } from '../../components/Modal'
import { allOrderItems } from '../../content/orderItems'
import { useOrder } from './OrderContext'
import { OrderForm } from './OrderForm'

export function OrderModal() {
  const { isOpen, item, close } = useOrder()
  return (
    <Modal open={isOpen} onClose={close} title={item ? `Заказать: ${item.name}` : 'Заказать услугу'}>
      <OrderForm items={allOrderItems()} initialItem={item} showItemSelect />
    </Modal>
  )
}
```

`client/src/Root.tsx`:
```tsx
import App from './App'
import { OrderModal } from './features/order/OrderModal'
import { useOrder } from './features/order/OrderContext'

export function Root() {
  const { open } = useOrder()
  return (
    <>
      <App onOrderClick={() => open()} />
      <OrderModal />
    </>
  )
}
```

`client/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { OrderProvider } from './features/order/OrderContext'
import { Root } from './Root'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <OrderProvider>
        <Root />
      </OrderProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

`client/src/test/render.tsx`:
```tsx
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { OrderProvider } from '../features/order/OrderContext'
import { Root } from '../Root'

export function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <OrderProvider>
        <Root />
      </OrderProvider>
    </MemoryRouter>,
  )
}
```

Update `client/src/App.test.tsx` to use the helper and add a modal test:
```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './test/render'

describe('App shell', () => {
  it('renders navigation with all sections', () => {
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Основное меню' })
    for (const label of ['Услуги', 'Команда', 'Новости', 'Контакты']) {
      expect(nav).toHaveTextContent(label)
    }
  })
  it('renders 404 page for unknown routes', () => {
    renderApp('/nope')
    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })
  it('opens the order modal from the header button', async () => {
    renderApp('/')
    await userEvent.click(screen.getAllByRole('button', { name: 'Заказать услугу' })[0])
    expect(screen.getByRole('dialog', { name: 'Заказать услугу' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -w client`
Expected: PASS (schema 3, OrderForm 3, App 3, plus earlier tests).

Run: `npm run build -w client`
Expected: success.

- [ ] **Step 5: Manual end-to-end check**

Run `npm run dev` from the root, open `http://localhost:5173`, click «Заказать услугу», fill the form, submit. Expected: success message in the modal and the email text printed in the server terminal. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(order): order form, modal, and API client wired to /api/order"
```

---

### Task 8: Home page with hero, advantages, packages, team preview, news, CTA

**Files:**
- Create: `client/src/components/Avatar.tsx`, `PackageCard.tsx`, `TeamCard.tsx`, `NewsCard.tsx`
- Modify: `client/src/lib/format.ts` (add `formatDate`), `client/src/lib/format.test.ts`
- Modify: `client/src/pages/HomePage.tsx`
- Test: `client/src/pages/HomePage.test.tsx`

**Interfaces:**
- Consumes: `packages`, `team`, `company`, `loadNews()`, `useOrder()`, `SectionHeading`, `Button`, `ButtonLink`, `Container`, `formatPrice`.
- Produces:
  - `formatDate(iso: string): string` → `'20 августа 2026 г.'`
  - `<Avatar name photo? className?>` — image or initials block
  - `<PackageCard pkg onOrder(item: OrderItem)>`
  - `<TeamCard member>`
  - `<NewsCard post>`

- [ ] **Step 1: Write failing tests**

Append to `client/src/lib/format.test.ts`:
```ts
import { formatDate } from './format'

describe('formatDate', () => {
  it('formats ISO dates in Russian', () => {
    expect(formatDate('2026-08-20')).toBe('20 августа 2026 г.')
  })
})
```
(Merge the import with the existing `formatPrice` import.)

`client/src/pages/HomePage.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render'
import { packages } from '../content/packages'

describe('HomePage', () => {
  it('shows all packages with prices and the popular badge', () => {
    renderApp('/')
    for (const p of packages) expect(screen.getByRole('heading', { name: p.name })).toBeInTheDocument()
    expect(screen.getByText('Популярный')).toBeInTheDocument()
    expect(screen.getByText(/^450 BYN/)).toBeInTheDocument()
  })

  it('opens the order modal preselecting the clicked package', async () => {
    renderApp('/')
    const card = screen.getByRole('heading', { name: 'Малый бизнес' }).closest('article')!
    await userEvent.click(within(card).getByRole('button', { name: 'Заказать' }))
    const dialog = screen.getByRole('dialog', { name: 'Заказать: Малый бизнес' })
    expect(within(dialog).getByLabelText('Услуга')).toHaveValue('package:small')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -w client -- Home format`
Expected: FAIL — `formatDate` not exported; no heading «Малый бизнес» on the stub page.

- [ ] **Step 3: Implement formatDate, cards, and HomePage**

Append to `client/src/lib/format.ts`:
```ts
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
```

`client/src/components/Avatar.tsx`:
```tsx
export function Avatar({ name, photo, className = '' }: { name: string; photo?: string; className?: string }) {
  if (photo) return <img src={photo} alt={name} className={`object-cover ${className}`} />
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center bg-linear-to-br from-brand-500 to-brand-700 font-bold text-white ${className}`}
    >
      {initials}
    </div>
  )
}
```

`client/src/components/PackageCard.tsx`:
```tsx
import { Check } from 'lucide-react'
import type { OrderItem, Package } from '../content/types'
import { formatPrice } from '../lib/format'
import { Button } from './Button'

export function PackageCard({ pkg, onOrder }: { pkg: Package; onOrder: (item: OrderItem) => void }) {
  const popular = Boolean(pkg.popular)
  return (
    <article
      className={`relative flex flex-col rounded-3xl bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
        popular ? 'ring-2 ring-accent-500' : 'ring-1 ring-stone-200'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white">
          Популярный
        </span>
      )}
      <h3 className="text-xl font-bold text-brand-900">{pkg.name}</h3>
      <p className="mt-1 text-sm text-stone-600">{pkg.audience}</p>
      <p className="mt-5 text-3xl font-extrabold text-brand-900">
        {formatPrice(pkg.pricePerMonth)}
        <span className="text-base font-medium text-stone-500"> / месяц</span>
      </p>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-stone-700">
        {pkg.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 shrink-0 text-accent-600" size={16} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        className="mt-7 w-full"
        variant={popular ? 'primary' : 'secondary'}
        onClick={() => onOrder({ kind: 'package', slug: pkg.slug, name: pkg.name })}
      >
        Заказать
      </Button>
    </article>
  )
}
```

`client/src/components/TeamCard.tsx`:
```tsx
import type { TeamMember } from '../content/types'
import { Avatar } from './Avatar'

function years(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} год`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} года`
  return `${n} лет`
}

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Avatar name={member.name} photo={member.photo} className="h-40 w-full rounded-2xl text-4xl" />
      <h3 className="mt-5 text-lg font-bold text-brand-900">{member.name}</h3>
      <p className="text-sm text-stone-600">{member.role}</p>
      <p className="mt-1 text-xs font-medium text-accent-600">Опыт {years(member.experienceYears)}</p>
      <p className="mt-3 flex-1 text-sm text-stone-700">{member.bio}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {member.specialties.map((s) => (
          <li key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {s}
          </li>
        ))}
      </ul>
    </article>
  )
}
```

`client/src/components/NewsCard.tsx`:
```tsx
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { NewsPost } from '../lib/news'
import { formatDate } from '../lib/format'

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      {post.cover && <img src={post.cover} alt="" className="mb-4 h-40 w-full rounded-2xl object-cover" />}
      <time dateTime={post.date} className="text-xs font-medium uppercase tracking-wider text-stone-500">
        {formatDate(post.date)}
      </time>
      <h3 className="mt-2 text-lg font-bold text-brand-900">
        <Link to={`/news/${post.slug}`} className="hover:text-brand-600">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm text-stone-700">{post.excerpt}</p>
      <Link to={`/news/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
        Читать <ArrowRight size={16} />
      </Link>
    </article>
  )
}
```

`client/src/pages/HomePage.tsx`:
```tsx
import { Clock, FileCheck2, MessageCircle, ShieldCheck } from 'lucide-react'
import { Container } from '../components/Container'
import { Button, ButtonLink } from '../components/Button'
import { SectionHeading } from '../components/SectionHeading'
import { PackageCard } from '../components/PackageCard'
import { TeamCard } from '../components/TeamCard'
import { NewsCard } from '../components/NewsCard'
import { company } from '../content/company'
import { packages } from '../content/packages'
import { team } from '../content/team'
import { loadNews } from '../lib/news'
import { useOrder } from '../features/order/OrderContext'

const advantages = [
  { icon: ShieldCheck, title: 'Отвечаем за результат', text: 'Штрафы по нашей вине оплачиваем сами. Это прописано в договоре.' },
  { icon: Clock, title: 'Отчёты всегда вовремя', text: 'Календарь сдачи под контролем: напоминаем заранее и сдаём без просрочек.' },
  { icon: MessageCircle, title: 'Бухгалтер на связи', text: 'Отвечаем в мессенджерах в течение рабочего дня, а не раз в квартал.' },
  { icon: FileCheck2, title: 'Порядок в документах', text: 'Электронный архив и ЭДО: нужный документ находится за минуту.' },
]

export default function HomePage() {
  const { open } = useOrder()
  const news = loadNews().slice(0, 3)
  const years = new Date().getFullYear() - company.foundedYear

  return (
    <>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
        <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">Бухгалтерское обслуживание в Минске</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {company.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-100">
              Берём на себя учёт, налоги, зарплату и отчётность для ИП и компаний. Вы занимаетесь бизнесом, мы — цифрами.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" variant="accent" onClick={() => open()}>
                Заказать услугу
              </Button>
              <ButtonLink to="/services" size="lg" variant="secondary">
                Смотреть пакеты
              </ButtonLink>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1">
            {[
              [`${years}+`, 'лет на рынке'],
              ['320+', 'клиентов на обслуживании'],
              ['0', 'просроченных отчётов за год'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                <dt className="text-3xl font-extrabold text-white">{value}</dt>
                <dd className="mt-1 text-sm text-brand-100">{label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Почему мы" title="Бухгалтерия без сюрпризов" subtitle="Четыре принципа, на которых держится наша работа с каждым клиентом." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-100 text-accent-600">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 font-bold text-brand-900">{title}</h3>
                <p className="mt-2 text-sm text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Пакеты" title="Выберите формат обслуживания" subtitle="Фиксированная цена в месяц. Отдельные услуги можно добавить к любому пакету." align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {packages.map((p) => (
              <PackageCard key={p.slug} pkg={p} onOrder={open} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink to="/services?tab=services" variant="ghost">
              Все отдельные услуги и цены →
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Команда" title="Кто будет вести ваш учёт" />
            <ButtonLink to="/team" variant="secondary">Вся команда</ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.slice(0, 3).map((m) => (
              <TeamCard key={m.slug} member={m} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Новости" title="Что нового" />
            <ButtonLink to="/news" variant="secondary">Все новости</ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {news.map((post) => (
              <NewsCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="rounded-3xl bg-brand-600 px-8 py-14 text-center text-white sm:px-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Не знаете, какой пакет подходит?</h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">
              Оставьте заявку, и бухгалтер перезвонит в течение рабочего дня, чтобы подобрать формат под ваш бизнес.
            </p>
            <Button size="lg" variant="accent" className="mt-8" onClick={() => open()}>
              Оставить заявку
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -w client`
Expected: PASS including HomePage 2 tests and formatDate.

Run: `npm run build -w client`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(home): landing page with hero, advantages, packages, team, news, CTA"
```

---

### Task 9: Services page with package/service tabs

**Files:**
- Create: `client/src/components/ServiceCard.tsx`
- Modify: `client/src/pages/ServicesPage.tsx`
- Test: `client/src/pages/ServicesPage.test.tsx`

**Interfaces:**
- Consumes: `packages`, `services`, `serviceCategories`, `PackageCard`, `useOrder`, `formatPrice`, `useSearchParams` (react-router).
- Produces: `<ServiceCard service onOrder(item: OrderItem)>`; route `/services?tab=services` opens the services tab.

- [ ] **Step 1: Write failing test**

`client/src/pages/ServicesPage.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render'
import { services, serviceCategories } from '../content/services'

describe('ServicesPage', () => {
  it('shows packages by default and switches to services', async () => {
    renderApp('/services')
    expect(screen.getByRole('tab', { name: 'Пакеты' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Малый бизнес' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: services[0].name })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Отдельные услуги' }))
    for (const c of serviceCategories) expect(screen.getByRole('heading', { name: c })).toBeInTheDocument()
    for (const s of services) expect(screen.getByRole('heading', { name: s.name })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Малый бизнес' })).not.toBeInTheDocument()
  })

  it('opens the services tab from the query string', () => {
    renderApp('/services?tab=services')
    expect(screen.getByRole('tab', { name: 'Отдельные услуги' })).toHaveAttribute('aria-selected', 'true')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w client -- Services`
Expected: FAIL — no element with role `tab`.

- [ ] **Step 3: Implement ServiceCard and ServicesPage**

`client/src/components/ServiceCard.tsx`:
```tsx
import type { OrderItem, Service } from '../content/types'
import { formatPrice } from '../lib/format'
import { Button } from './Button'

export function ServiceCard({ service, onOrder }: { service: Service; onOrder: (item: OrderItem) => void }) {
  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <h3 className="font-bold text-brand-900">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm text-stone-600">{service.description}</p>
      <p className="mt-4 text-lg font-extrabold text-brand-900">
        от {formatPrice(service.priceFrom)}
        {service.unit && <span className="text-sm font-medium text-stone-500"> {service.unit}</span>}
      </p>
      <Button
        variant="secondary"
        className="mt-4 w-full"
        onClick={() => onOrder({ kind: 'service', slug: service.slug, name: service.name })}
      >
        Заказать
      </Button>
    </article>
  )
}
```

`client/src/pages/ServicesPage.tsx`:
```tsx
import { useSearchParams } from 'react-router'
import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { PackageCard } from '../components/PackageCard'
import { ServiceCard } from '../components/ServiceCard'
import { packages } from '../content/packages'
import { services, serviceCategories } from '../content/services'
import { useOrder } from '../features/order/OrderContext'

type Tab = 'packages' | 'services'

const tabs: { id: Tab; label: string }[] = [
  { id: 'packages', label: 'Пакеты' },
  { id: 'services', label: 'Отдельные услуги' },
]

export default function ServicesPage() {
  const { open } = useOrder()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'services' ? 'services' : 'packages'

  const select = (next: Tab) => {
    setParams(next === 'packages' ? {} : { tab: next }, { replace: true })
  }

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Услуги и цены"
        title="Пакеты обслуживания и отдельные услуги"
        subtitle="Пакет закрывает регулярные задачи по фиксированной цене. Отдельные услуги подойдут для разовых задач или как дополнение к пакету."
      />

      <div role="tablist" aria-label="Тип услуг" className="mt-10 inline-flex rounded-full bg-stone-200/70 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => select(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-white text-brand-900 shadow-sm' : 'text-stone-600 hover:text-brand-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'packages' ? (
        <div role="tabpanel" className="mt-10 grid gap-6 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard key={p.slug} pkg={p} onOrder={open} />
          ))}
        </div>
      ) : (
        <div role="tabpanel" className="mt-10 space-y-14">
          {serviceCategories.map((category) => (
            <section key={category}>
              <h2 className="text-2xl font-bold text-brand-900">{category}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <ServiceCard key={s.slug} service={s} onOrder={open} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Container>
  )
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -w client -- Services`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(services): services page with package and service tabs"
```

---

### Task 10: Team page

**Files:**
- Modify: `client/src/pages/TeamPage.tsx`
- Test: `client/src/pages/TeamPage.test.tsx`

**Interfaces:**
- Consumes: `team`, `TeamCard`, `SectionHeading`, `Container`, `company`.

- [ ] **Step 1: Write failing test**

`client/src/pages/TeamPage.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'
import { team } from '../content/team'

describe('TeamPage', () => {
  it('lists every team member with role', () => {
    renderApp('/team')
    for (const m of team) {
      expect(screen.getByRole('heading', { name: m.name })).toBeInTheDocument()
      expect(screen.getByText(m.role)).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w client -- Team`
Expected: FAIL — headings with member names are missing.

- [ ] **Step 3: Implement TeamPage**

`client/src/pages/TeamPage.tsx`:
```tsx
import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { TeamCard } from '../components/TeamCard'
import { team } from '../content/team'
import { company } from '../content/company'

export default function TeamPage() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Команда"
        title="Люди, которые ведут ваш учёт"
        subtitle={`В «${company.name}» работают аттестованные бухгалтеры с опытом в разных отраслях. За каждым клиентом закреплён персональный специалист.`}
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m) => (
          <TeamCard key={m.slug} member={m} />
        ))}
      </div>
    </Container>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -w client -- Team`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(team): team page"
```

---

### Task 11: News list and article pages

**Files:**
- Modify: `client/src/pages/NewsPage.tsx`, `client/src/pages/NewsArticlePage.tsx`, `client/src/index.css`
- Test: `client/src/pages/NewsPage.test.tsx`

**Interfaces:**
- Consumes: `loadNews()`, `getPost()`, `NewsCard`, `formatDate`, `NotFoundPage`, `react-markdown`.

- [ ] **Step 1: Write failing test**

`client/src/pages/NewsPage.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'
import { loadNews } from '../lib/news'

describe('news pages', () => {
  it('lists all posts newest first', () => {
    renderApp('/news')
    const posts = loadNews()
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(posts.map((p) => p.title))
  })

  it('renders an article with markdown body', () => {
    renderApp('/news/2026-05-15-novyi-ofis')
    expect(screen.getByRole('heading', { level: 1, name: 'Мы переехали в новый офис на Немиге' })).toBeInTheDocument()
    expect(screen.getByText(/С 15 мая наш офис находится/)).toBeInTheDocument()
    expect(screen.getByText('15 мая 2026 г.')).toBeInTheDocument()
  })

  it('shows 404 for an unknown slug', () => {
    renderApp('/news/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w client -- News`
Expected: FAIL — stub pages render no post headings.

- [ ] **Step 3: Implement pages and article styles**

`client/src/pages/NewsPage.tsx`:
```tsx
import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { NewsCard } from '../components/NewsCard'
import { loadNews } from '../lib/news'

export default function NewsPage() {
  const posts = loadNews()
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading eyebrow="Новости" title="Новости компании и изменения в законодательстве" subtitle="Коротко о том, что важно знать нашим клиентам." />
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <NewsCard key={post.slug} post={post} />
        ))}
      </div>
    </Container>
  )
}
```

`client/src/pages/NewsArticlePage.tsx`:
```tsx
import { Link, useParams } from 'react-router'
import Markdown from 'react-markdown'
import { ArrowLeft } from 'lucide-react'
import { Container } from '../components/Container'
import { getPost } from '../lib/news'
import { formatDate } from '../lib/format'
import NotFoundPage from './NotFoundPage'

export default function NewsArticlePage() {
  const { slug = '' } = useParams()
  const post = getPost(slug)
  if (!post) return <NotFoundPage />

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link to="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft size={16} /> Все новости
      </Link>
      <time dateTime={post.date} className="mt-8 block text-xs font-medium uppercase tracking-wider text-stone-500">
        {formatDate(post.date)}
      </time>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{post.title}</h1>
      <p className="mt-4 text-lg text-stone-600">{post.excerpt}</p>
      {post.cover && <img src={post.cover} alt="" className="mt-8 w-full rounded-3xl object-cover" />}
      <div className="article mt-10">
        <Markdown>{post.body}</Markdown>
      </div>
    </Container>
  )
}
```

Append to `client/src/index.css`:
```css
.article { @apply leading-relaxed text-stone-700; }
.article h2 { @apply mb-3 mt-10 text-2xl font-bold text-brand-900; }
.article h3 { @apply mb-2 mt-8 text-xl font-bold text-brand-900; }
.article p { @apply my-4; }
.article ul { @apply my-4 list-disc space-y-1 pl-6; }
.article ol { @apply my-4 list-decimal space-y-1 pl-6; }
.article a { @apply text-brand-600 underline hover:text-brand-700; }
.article strong { @apply font-semibold text-brand-900; }
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -w client -- News`
Expected: PASS (3 tests).

Run: `npm run build -w client`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(news): news list and markdown article pages"
```

---

### Task 12: Contacts page with contact form

**Files:**
- Modify: `client/src/pages/ContactsPage.tsx`
- Test: `client/src/pages/ContactsPage.test.tsx`

**Interfaces:**
- Consumes: `company`, `OrderForm` (with `showItemSelect` false), `allOrderItems`, `Container`, `SectionHeading`.

- [ ] **Step 1: Write failing test**

`client/src/pages/ContactsPage.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'
import { company } from '../content/company'

describe('ContactsPage', () => {
  it('shows company contacts and a contact form without service select', () => {
    renderApp('/contacts')
    expect(screen.getAllByRole('link', { name: company.phone })[0]).toHaveAttribute('href', company.phoneHref)
    expect(screen.getAllByText(company.address).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Услуга')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w client -- Contacts`
Expected: FAIL — no phone link on the stub page.

- [ ] **Step 3: Implement ContactsPage**

`client/src/pages/ContactsPage.tsx`:
```tsx
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { company } from '../content/company'
import { allOrderItems } from '../content/orderItems'
import { OrderForm } from '../features/order/OrderForm'

export default function ContactsPage() {
  const rows = [
    { icon: Phone, label: 'Телефон', value: <a href={company.phoneHref} className="hover:text-brand-600">{company.phone}</a> },
    { icon: Mail, label: 'Почта', value: <a href={`mailto:${company.email}`} className="hover:text-brand-600">{company.email}</a> },
    { icon: MapPin, label: 'Адрес', value: company.address },
    { icon: Clock, label: 'Часы работы', value: company.hours },
  ]

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading eyebrow="Контакты" title="Свяжитесь с нами" subtitle="Позвоните, напишите или оставьте заявку — ответим в течение рабочего дня." />
      <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          <ul className="space-y-5">
            {rows.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
                  <p className="mt-0.5 font-medium text-brand-900">{value}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="grid h-56 place-items-center rounded-3xl bg-brand-50 text-sm text-brand-600 ring-1 ring-brand-100">
            Здесь будет карта проезда
          </div>
          <p className="text-xs text-stone-500">{company.legal}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200 sm:p-8">
          <h2 className="text-2xl font-bold text-brand-900">Напишите нам</h2>
          <p className="mt-2 text-sm text-stone-600">Опишите задачу, и мы предложим подходящий формат обслуживания.</p>
          <div className="mt-6">
            <OrderForm items={allOrderItems()} />
          </div>
        </div>
      </div>
    </Container>
  )
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -w client`
Expected: PASS (all client tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(contacts): contacts page with contact form"
```

---

### Task 13: README, production build check, deploy instructions

**Files:**
- Create: `README.md`
- Verify: full build and production server serving the SPA.

- [ ] **Step 1: Write README.md**

`README.md`:
````md
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
````

- [ ] **Step 2: Full verification**

Run: `npm test`
Expected: all client and server tests pass.

Run: `npm run build`
Expected: success.

Run in background: `npm start`
Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/
curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/services
curl -s localhost:3001/api/health
```
Expected: `200`, `200` (SPA fallback), `{"ok":true}`. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: README with local run, content editing, and hoster.by deploy"
```

# packora-dashboard

[![CI](https://github.com/Abohanin5022/vertex-ai-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/Abohanin5022/vertex-ai-bot/actions/workflows/ci.yml)

A Next.js dashboard application.

## Features

- Arabic RTL operations dashboard for Packora inventory.
- Live Supabase product loading with stable sample data fallback.
- Product search, stock filtering, low-stock alerts, and CSV export.

## Development

Use Node.js 20.9 or newer.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

Set these environment variables in `.env.local` to connect live product data:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

When the variables are not configured, the dashboard renders sample inventory
data so local builds and CI checks remain stable.

### Supabase schema

The `products` table needs a `category` text column (nullable is fine — rows
without one fall back to "عام" in the UI):

```sql
alter table products add column if not exists category text;
```

## Project Checks

Run the full local verification suite before pushing changes:

```bash
npm run check
```

The check script runs merge-conflict marker detection, `npm audit`,
ESLint, and the production build.

## Automation

GitHub Actions runs the same verification suite on pull requests, pushes to
`main`, and manual workflow dispatches. Dependabot checks npm packages and
GitHub Actions weekly using the Asia/Riyadh timezone.

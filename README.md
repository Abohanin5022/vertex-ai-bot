# Packora Dashboard

Packora is a Next.js marketplace workspace for packaging and plastics commerce.
The project currently contains three separated experiences:

- **Packora 1**: customer storefront and checkout.
- **Packora 2**: merchant dashboard and product/order operations.
- **Packora Admin**: administration, vendors, and monetization controls.

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL database compatible with Prisma

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill only local development values in `.env.local`. Never commit real secrets.

Generate Prisma Client if needed:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open:

- Customer app: [http://localhost:3000/packora-1](http://localhost:3000/packora-1)
- Merchant app: [http://localhost:3000/packora-2](http://localhost:3000/packora-2)
- Admin login: [http://localhost:3000/admin-login](http://localhost:3000/admin-login)

## Common Commands

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

Other useful checks:

```bash
npm run lint
npm run check
```

## Important Routes

### Packora 1 - Customer

- `/packora-1` - customer storefront
- `/packora-1/login` - customer login
- `/packora-1/register` - customer registration
- `/packora-1/products/[id]` - customer product details
- `/packora-1/cart` - customer cart
- `/packora-1/checkout` - checkout
- `/packora-1/track/[id]` - order tracking

Legacy customer routes such as `/customer`, `/login`, `/register`, `/cart`,
and `/checkout` are redirected through `proxy.ts`.

### Packora 2 - Merchant

- `/packora-2` - merchant dashboard
- `/packora-2/login` - merchant login
- `/packora-2/register` - merchant registration
- `/packora-2/products` - product and inventory management
- `/packora-2/products/new` - create product
- `/packora-2/orders` - merchant orders
- `/packora-2/settings` - store, services, bank, shipping, and installment settings
- `/packora-2/analytics` - analytics
- `/packora-2/notifications` - merchant notifications

Legacy merchant routes such as `/merchant`, `/merchant-login`, and
`/merchant-register` are redirected through `proxy.ts`.

### Admin

- `/admin-login` - admin login
- `/admin` - admin command center
- `/admin/vendor-applications` - vendor applications
- `/admin/vendors` - approved vendors
- `/admin/monetization` - platform monetization settings

### Public Marketplace

- `/stores` - store directory
- `/store/[slug]` - public merchant store preview
- `/desktop-store` - standalone desktop storefront
- `/privacy`, `/terms`, `/contact` - launch/legal pages

## Environment Variables

Use `.env.example` as the source of truth for required variable names.

Important groups:

- `DATABASE_URL`, `DIRECT_URL` for Prisma/PostgreSQL.
- `JWT_SECRET`, `NEXTAUTH_SECRET` for authentication.
- `UPLOADTHING_TOKEN` for production uploads.
- `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY`, `MOYASAR_SECRET_KEY` for Moyasar.
- Optional payment/shipping provider keys for future integrations.

## Database

Prisma schema and migrations are under `prisma/`.

Common commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
```

Use `migrate deploy` in production after environment variables are configured.

## Notes for External Developers

- Do not commit `.env`, `.env.local`, or production secrets.
- Keep Packora 1 customer routes isolated from Packora 2 merchant routes.
- Keep admin routes protected by admin authentication.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` before opening a PR.

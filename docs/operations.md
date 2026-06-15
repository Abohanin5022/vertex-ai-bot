# Packora Saudi Operations

## Ready Now

- Add products from the independent merchant console at `/merchant` and keep them locally in the browser when cloud persistence is not configured.
- Share the customer storefront at `/customer` for order-flow evaluation.
- Share the tracking page at `/track` for customer order-status checks.
- Create checkout orders with Saudi address fields.
- Update merchant-side fulfillment status for packing, shipped, completed, or exception handling.
- Calculate shipping quotes for SPL, SMSA, Aramex, iMile, J&T, and RedBox.
- Use cash on delivery or bank transfer as working payment methods.
- Export the product catalog as CSV.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key is used only in Next.js route handlers. Never expose it in client code.
The schema also creates `app_settings` with Arabic language, Saudi market,
SAR currency, VAT 15%, `/merchant` for the merchant console, and `/customer`
for the customer ordering view.
Products include `image_url` so the storefront can show product images. For
production, store images in Supabase Storage or another image host and save the
public URL in that field.

## Control Panel Handoff

```bash
CONTROL_PANEL_KEY=
```

Use this as the private handoff key for the operator who receives the merchant
console. The dashboard shows whether it is configured, but never prints the key
value in the browser.

## Merchant Isolation

For production, deploy the merchant console and the customer storefront as two
separate web apps or subdomains that point to the same repository and database:

- Merchant: `/merchant`, or a private subdomain such as `merchant.example.sa`.
- Customer: `/customer`, or the public storefront domain.

This keeps public storefront traffic from owning the merchant operator
experience and lets each deployment scale independently while sharing Supabase,
payment webhooks, and shipping provider credentials.

## Order Status Flow

The app uses these fulfillment statuses in `orders.fulfillment_status`:

- `new`: order received.
- `payment_review`: bank transfer or payment needs manual review.
- `packing`: merchant is preparing the products.
- `ready_to_ship`: packaging is done and shipment can be handed off.
- `shipped`: carrier has the shipment.
- `completed`: order is delivered or closed.
- `issue`: address, stock, payment, or carrier exception.

The customer tracking page reads local browser orders first, then `/api/orders`
when Supabase service credentials are configured.

## Payment Setup

The dashboard is prepared for cash on delivery, bank transfer, Moyasar,
HyperPay, and PayTabs while keeping card data out of Packora servers.

```bash
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=
MOYASAR_SECRET_KEY=
HYPERPAY_ENTITY_ID=
HYPERPAY_ACCESS_TOKEN=
PAYTABS_PROFILE_ID=
PAYTABS_SERVER_KEY=
BANK_NAME=
BANK_IBAN=
```

Cash on delivery and bank transfer work without a payment gateway. For live
card or Mada payments, activate the gateway account, add the keys, and complete
the hosted/payment-form flow with backend verification before marking orders as
paid.

## Financial Partner Setup

```bash
TAMARA_API_TOKEN=
TABBY_SECRET_KEY=
TABBY_MERCHANT_CODE=
```

Tamara and Tabby appear as financing options in the merchant console. They should
be enabled in production only after merchant approval, checkout validation, and
webhook verification are complete.

## Shipping Setup

Add provider credentials when the carrier account is approved:

```bash
SPL_API_KEY=
SMSA_API_KEY=
ARAMEX_USERNAME=
ARAMEX_PASSWORD=
ARAMEX_ACCOUNT_NUMBER=
IMILE_API_KEY=
JT_API_KEY=
REDBOX_API_KEY=
```

Until credentials are added, Packora generates operational quotes and internal tracking numbers so the team can test the full workflow.

## Provider Links

- Moyasar: <https://docs.moyasar.com/>
- HyperPay: <https://www.hyperpay.com/payment/>
- PayTabs: <https://docs.paytabs.com/>
- Tamara: <https://docs.tamara.co/>
- Tabby: <https://docs.tabby.ai/api-reference/overview>
- SPL: <https://splonline.com.sa/en/>
- SMSA: <https://ecom.smsaexpress.com/docs/api>
- Aramex: <https://www.aramex.com/ag/en/developers-solution-center/aramex-apis>
- iMile: <https://en.imile.com/>
- J&T Express: <https://jtexpress.com/en/contactUs>
- RedBox: <https://redboxsa.com/en/send/>

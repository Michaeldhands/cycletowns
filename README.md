# Cycletowns

The live site for [cycletowns.com](https://cycletowns.com) — the world’s best cycling towns, ranked by riders.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

See `PLAN.md` for the roadmap and `reference/demo.html` for the original MVP demo the design comes from.

## Stripe webhooks

Stripe subscription updates are received at `/api/stripe/webhook`. Configure that URL as a Stripe webhook endpoint and subscribe it to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` in Netlify. The webhook verifies Stripe's signature before synchronizing rider memberships and partner plans in Supabase. Failed synchronization returns an error so Stripe can retry the event.

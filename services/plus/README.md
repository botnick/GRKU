# GRKU Plus service

The Cloudflare Worker behind the paid tiers of grku.app: orders, PromptPay QR payloads, slip
verification, keys, and magic links. See `src/index.ts` for the flow and `schema.sql` for the data.

Setup, once:

```sh
cd services/plus
npm install
npx wrangler login
npx wrangler d1 create grku-plus            # put the database_id into wrangler.toml
npx wrangler d1 execute grku-plus --remote --file schema.sql
npx wrangler secret put KEY_SECRET          # a long random string
npx wrangler secret put PROMPTPAY_ID        # the phone, ID, or e-wallet that receives the money
npx wrangler secret put SLIPOK_KEY          # or EASYSLIP_KEY; set SLIP_PROVIDER in wrangler.toml
npx wrangler secret put RESEND_KEY          # optional: the key emails and the magic links
npx wrangler deploy
```

The site reads the service address from `VITE_PLUS_API` (web/.env); without it the paid tiers do
not show and every look is free to pick within the free slots.

Tiers: `plus` 199 (the whole library, for ever), `slots25` 79 (25 looks on the card instead of
10), `pack:<kodak|fuji|slide|mono|cinema|instant|indie>` 49 each. Earlier purchases count toward
`plus` and `slots25`. `SLIP_PROVIDER = "mock"` accepts any slip for development.

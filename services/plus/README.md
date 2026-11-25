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
npx wrangler secret put EASYSLIP_KEY        # EasySlip API v2 key (or SLIPOK_KEY with SLIP_PROVIDER = "slipok")
npx wrangler secret put RESEND_KEY          # optional: the key emails and the magic links
npx wrangler deploy
```

The site reads the service address from `VITE_PLUS_API` (web/.env); without it the paid tiers do
not show and every look is free to pick within the free slots.

Tiers: `plus` 199 (the whole library, for ever), `slots25` 79 (25 looks on the card instead of
10), `pack:<kodak|fuji|slide|mono|cinema|instant|indie>` 49 each. Earlier purchases count toward
`plus` and `slots25`. `SLIP_PROVIDER = "mock"` accepts any slip for development.

## The GRKU assistant

The same Worker serves the site's assistant (`src/chat/`): `POST /chat/session` (a Turnstile
token, and the GRKU Plus key if the browser has one) gives a signed session, `POST /chat` streams
an answer as Server-Sent Events. The system prompt is `src/chat/prompt.ts` (versioned; the page
cannot change it), the guardrails `src/chat/guard.ts`, the fixed answers `src/chat/replies.ts`.
The facts come from the site build (`web/scripts/build-chat-knowledge.mjs` writes
`/chat/knowledge.json`). Counters are in D1 (`chat_usage`); no message content is stored.

Providers are OpenAI-compatible endpoints tried in order, free first: `CHAT_*` Google AI Studio
(Gemini free tier: Flash-Lite for the free tier, Flash with high thinking for GRKU Plus), `CHAT2_*`
OpenRouter `:free` models (off: they were rate-limited upstream), then `CHAT3_*` paid Gemini through
OpenRouter (Google's servers only, at most the listed price; never billing on the AI Studio project,
which would end its free tier). Paid spend has a monthly and a daily cap in dollars
(`CHAT_PAID_MONTHLY_USD`, `CHAT_PAID_DAILY_USD`), and the free tier may use only
`CHAT_PAID_FREE_SHARE` percent of the month. A free answer that comes back empty, broken, or garbled
is asked once more of the paid model. GRKU Plus never gets the free tier's models; with
`CHAT_PLUS_TIER = "pro"` it goes to Gemini Pro at once. Limits and models are vars in
`wrangler.toml`. Secrets:

```sh
npx wrangler secret put CHAT_API_KEY      # Google AI Studio API key (free tier)
npx wrangler secret put CHAT2_API_KEY     # OpenRouter key (the :free models)
npx wrangler secret put CHAT3_API_KEY     # OpenRouter key (the paid fallback; the same key is fine)
npx wrangler secret put CHAT4_BASE_URL    # Workers AI: https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1 (optional)
npx wrangler secret put CHAT4_API_KEY     # a token with Workers AI Read (optional)
```

`CHAT_ENABLED = "off"` closes it. Test: `pnpm test`; run the test set against `wrangler dev`
(without TURNSTILE_SECRET, with high limits in `.dev.vars`): `node eval/eval.mjs http://127.0.0.1:8787 OUT_DIR` (add `--thai`, `--tier plus --key KEY`, `--ids a,b`, `--name NAME`; `--var CHAT_FORCE_PROVIDER:paid` on `wrangler dev` tests the paid path alone).

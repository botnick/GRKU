-- GRKU Plus: the orders, the slips that paid them, and what each buyer owns.
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,            -- an email in lower case, or anon:<id>
  tier TEXT NOT NULL,             -- plus | slots25 | pack:<pack>
  amount INTEGER NOT NULL,        -- baht due for this order, after the credit of earlier purchases
  cents INTEGER NOT NULL DEFAULT 0, -- the satang of this order (1-99), so its exact amount names it
  status TEXT NOT NULL DEFAULT 'open',
  created INTEGER NOT NULL,
  paid_at INTEGER,
  slip_ref TEXT
);
CREATE TABLE IF NOT EXISTS slips (
  ref TEXT PRIMARY KEY,           -- the bank's transaction reference: one slip pays once
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payer TEXT,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS entitlements (
  owner TEXT PRIMARY KEY,
  packs TEXT NOT NULL DEFAULT '[]',
  slots INTEGER NOT NULL DEFAULT 10,
  plus INTEGER NOT NULL DEFAULT 0,
  paid INTEGER NOT NULL DEFAULT 0,  -- baht paid in all, the credit toward an upgrade
  updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_owner ON orders(owner);
-- The short keys of the owners (AAAA-AAA-AAAA): one per owner, given in the email and on the page.
CREATE TABLE IF NOT EXISTS keys (
  code TEXT PRIMARY KEY,
  owner TEXT NOT NULL UNIQUE,
  created INTEGER NOT NULL
);
-- The GRKU assistant's anonymous daily counters (src/chat): messages and tokens per day and key.
-- Keys: s:<session>, ip:<hashed ip>, o:<hashed owner>, m:<hashed ip>:<minute>, v:<hashed ip>:<hour>,
-- global, p:<provider>:<model>, t:<topic>, r:<refusal>, x:<cut>; `day` is YYYY-MM-DD, or YYYY-MM for
-- the monthly paid budget. No message content is stored.
CREATE TABLE IF NOT EXISTS chat_usage (
  day TEXT NOT NULL,
  k TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, k)
);
-- The admin page (src/admin): failed sign-ins per hashed IP and for everyone (`global`), in a
-- window that ends at `reset` (milliseconds).
CREATE TABLE IF NOT EXISTS admin_login (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL DEFAULT 0,
  reset INTEGER NOT NULL
);
-- Settings that the admin page changes at run time (the assistant's switch and limits); a missing
-- row falls back to the var in wrangler.toml.
CREATE TABLE IF NOT EXISTS admin_settings (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL,
  updated INTEGER NOT NULL
);
-- The key emails: to whom, when, why, and whether the mail server took it. No message content.
CREATE TABLE IF NOT EXISTS mail_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  kind TEXT NOT NULL,             -- paid | magic | admin
  ok INTEGER NOT NULL,
  error TEXT,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS mail_log_recipient ON mail_log(recipient, created);
-- How each provider of the assistant last answered (src/chat via src/index.ts), for the admin page:
-- the time of the last answer, and of the last failure with its HTTP status or error name.
CREATE TABLE IF NOT EXISTS chat_provider (
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  ok_at INTEGER,
  err_at INTEGER,
  err_code TEXT,
  PRIMARY KEY (name, model)
);
-- The assistant's answer cache (src/chat/cache.ts): the answers to first questions that many ask
-- the same way, by a hash of the normalized question, its language, tier, page, prompt version, and
-- knowledge pack. Never the question itself. Rows older than 7 days are pruned.
CREATE TABLE IF NOT EXISTS chat_cache (
  k TEXT PRIMARY KEY,
  answer TEXT NOT NULL,
  created INTEGER NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_cache_created ON chat_cache(created);

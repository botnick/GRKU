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

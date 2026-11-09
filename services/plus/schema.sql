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

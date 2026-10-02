-- Run this once against your Neon/Postgres database before deploying.
-- Easiest way: paste this into the Neon SQL editor (or `psql $DATABASE_URL -f migrations/001_init.sql`).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  payment TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD (Philippines local date, matches app's existing format)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses(user_id, date);

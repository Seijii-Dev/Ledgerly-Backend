# Ledgerly Backend

A small backend for the Ledgerly app: accounts (register/login) and expense sync,
backed by Postgres and deployable on Vercel.

## What this is

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me` — passwords are
  hashed with bcrypt before they ever touch the database. A JWT is issued on
  register/login and must be sent as `Authorization: Bearer <token>` on every other request.
- **Data**: `/api/expenses` (list/create), `/api/expenses/:id` (update/delete),
  `/api/budget` (update) — all scoped to the signed-in user via the token, so one
  account can never read or modify another account's data.
- **Database**: Postgres (recommended: [Neon](https://neon.tech), which has a free
  tier and a one-click Vercel integration).

## Deploy steps

### 1. Create the database

In your Vercel project dashboard: **Storage** tab → **Create Database** → **Neon** →
follow the prompts. This automatically sets the `DATABASE_URL` environment variable
for you.

(If you'd rather use your own Postgres/Supabase/etc., just set `DATABASE_URL`
yourself in Project Settings → Environment Variables — any standard Postgres
connection string works.)

### 2. Run the schema migration

Open the Neon dashboard → **SQL Editor**, paste the contents of
`migrations/001_init.sql`, and run it. This creates the `users` and `expenses` tables.

(You only need to do this once, and again any time you add a new migration file.)

### 3. Set the JWT secret

In Vercel → Project Settings → Environment Variables, add:

```
JWT_SECRET=<any long random string>
```

Generate one locally with `openssl rand -base64 48`, or just mash the keyboard for 40+ characters.

### 4. Deploy

Push this folder to a GitHub repo and import it in Vercel, or run:

```
npm install -g vercel
vercel
```

from inside this folder. Vercel auto-detects Next.js and deploys it.

### 5. Point the app at it

In the Ledgerly Android app, set the API base URL to your deployed Vercel URL (e.g.
`https://your-project.vercel.app`) — see `EXPO_PUBLIC_API_URL` in the app's `.env`.

## Local development

```
npm install
cp .env.example .env.local   # fill in DATABASE_URL and JWT_SECRET
npm run dev
```

## Notes on security

- Passwords are never stored in plaintext — only bcrypt hashes.
- Tokens expire after 90 days (adjust in `lib/auth.ts` if you want shorter sessions).
- Every data endpoint checks the token and scopes queries to that user's `id` —
  there's no way to fetch or edit another user's expenses even by guessing an ID.
- This is a solid setup for a personal/small-scale app. If you later need password
  reset flows, email verification, or rate limiting on login attempts, those aren't
  included yet — say the word and I'll add them.

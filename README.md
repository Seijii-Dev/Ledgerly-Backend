# Ledgerly Backend

Next.js API backend for the Ledgerly Android app, powered by **Supabase Auth** and **Supabase Postgres with Row Level Security (RLS)**.

## API contract

The Android app can continue using the existing endpoints:

- `POST /api/auth/register` — creates a Supabase Auth account and returns an access token when email confirmation is disabled.
- `POST /api/auth/login` — signs in with Supabase Auth and returns an access token.
- `GET /api/auth/me` — validates the bearer token and returns the profile.
- `GET|POST /api/expenses` — list or create the signed-in user's expenses.
- `PUT|DELETE /api/expenses/:id` — update or delete one of the signed-in user's expenses.
- `PUT /api/budget` — update the signed-in user's budget.

All protected routes require:

```http
Authorization: Bearer <supabase-access-token>
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`migrations/001_supabase.sql`](migrations/001_supabase.sql).
3. In **Authentication -> Providers -> Email**, choose whether to require email confirmation. For the current Android login flow, disable confirmation during initial testing, or update the app to show the confirmation state returned by registration.
4. Copy the project URL and publishable/anon key from **Project Settings -> API**.
5. Configure these Vercel environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

6. Deploy the repository to Vercel. No database password, custom JWT secret, or service-role key is needed by this API.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set real Supabase values in `.env.local` before calling the protected routes.

## Security model

- Supabase Auth hashes and manages passwords, sessions, token expiry, email confirmation, and recovery flows.
- The API validates every bearer token with Supabase Auth.
- The API uses a request-scoped Supabase client with the user's token.
- RLS policies enforce that profiles and expenses can only be accessed by their owner, independently of API filtering.
- The service-role key is intentionally not used or required.
- Never commit `.env.local` or any Supabase secret key.

## Android migration note

The existing API response shape is preserved. The `token` field is now a Supabase access token instead of a custom JWT. Store the accompanying `refreshToken` and refresh the session before the access token expires. Existing expense and budget request paths remain unchanged.

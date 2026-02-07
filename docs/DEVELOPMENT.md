# Development environment setup

This guide gets you running locally with auth (including Google login) working on `localhost` or `127.0.0.1` instead of redirecting to Netlify.

## 1. Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## 2. Install and run

```bash
npm install
cp .env.example .env
# Edit .env and add your Supabase URL and anon key (from Supabase dashboard)
npm run dev
```

App runs at **http://localhost:3000** (Vite default). Use that URL for development so redirects stay on localhost.

## 3. Fix “Login redirects to Netlify” (Supabase URL config)

After Google sign-in, Supabase redirects the browser. It only redirects to URLs that are **allowed** in your project. If your local URL is not in the list, Supabase falls back to the **Site URL** (your Netlify URL), so you end up on netlify.app.

### In Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. **Redirect URLs**: add your local URLs (one per line), for example:
   - `http://localhost:3000/**`
   - `http://127.0.0.1:3000/**`
   The `/**` allows any path (e.g. `/auth/callback`) on that origin.
4. **Site URL**:  
   - For **local dev only**: you can set it to `http://localhost:3000` so the default redirect is local.  
   - For **shared project** (prod + dev): leave Site URL as your production URL (e.g. `https://your-app.netlify.app`) and rely on **Redirect URLs** above. The app sends `redirectTo: window.location.origin + '/auth/callback'`, so as long as `http://localhost:3000/auth/callback` (and/or `http://127.0.0.1:3000/auth/callback`) is in Redirect URLs, Google login will redirect back to localhost.

Save. Try Google login again at **http://localhost:3000** (or **http://127.0.0.1:3000** if you added that).

### Optional: use only one local hostname

To avoid confusion, use **either** `localhost` **or** `127.0.0.1` and add that origin to Redirect URLs. If you open the app at `127.0.0.1:3000`, add `http://127.0.0.1:3000/**`; if you use `localhost:3000`, add `http://localhost:3000/**`.

## 4. Google OAuth (if you use Google sign-in)

Supabase talks to Google on your behalf. You only need to configure redirect URIs in **Google Cloud Console** for the **Supabase** callback, not for your app’s URL.

1. [Google Cloud Console](https://console.cloud.google.com/) → your project → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application).
3. **Authorized redirect URIs** must include Supabase’s callback, e.g.  
   `https://<your-project-ref>.supabase.co/auth/v1/callback`  
   (Replace `<your-project-ref>` with your Supabase project ref, e.g. `pyklvmaarcmeksafafat`.)
4. **Authorized JavaScript origins** can include (for dev):
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - Your production origin, e.g. `https://your-app.netlify.app`

After changing these, wait a few minutes and try Google login again.

## 5. Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Required for | Description |
|----------|----------------|-------------|
| `VITE_SUPABASE_URL` | App + auth | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | App + auth | Supabase anon/public key |
| `NOTION_*` | Notion scripts | Only if you run Notion sync scripts |
| `MAILGUN_*` | Email (if used) | Only if you use Mailgun |

Never commit `.env`. It is in `.gitignore`.

## 6. E2E tests

```bash
npm run test:e2e
```

By default Playwright uses `http://localhost:3000`. Override with `E2E_BASE_URL` if needed.

## 7. Events RLS (if “Add event” fails with row-level security)

If adding an event shows “new row violates row-level security on events table”, run the events RLS migration so authenticated users can insert their own events:

1. Open **Supabase Dashboard** → your project → **SQL Editor**.
2. Open `supabase/migrations/20250207000000_events_rls_insert_policy.sql` in this repo and copy its contents.
3. Paste into the SQL Editor and click **Run**.

This adds an INSERT policy on `public.events` so rows with `user_id = auth.uid()` are allowed.

## Summary checklist

- [ ] `npm install` and `cp .env.example .env` with real Supabase values.
- [ ] Supabase → Authentication → URL Configuration: add `http://localhost:3000/**` (and optionally `http://127.0.0.1:3000/**`) to **Redirect URLs**.
- [ ] Open the app at **http://localhost:3000** (or the origin you added).
- [ ] Google OAuth: redirect URI in Google Console = `https://<project-ref>.supabase.co/auth/v1/callback`.
- [ ] Run `npm run dev` and try Google login again; it should land back on localhost, not Netlify.

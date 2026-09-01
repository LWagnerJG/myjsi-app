# MyJSI App

React + Vite mobile-first PWA for JSI Furniture dealers and sales reps. See `CLAUDE.md` for product context, stack details, and architecture.

## Cursor Cloud specific instructions

This is a single Vite + React SPA. All data is static (per-screen `data.js` files); Supabase is not wired and no backend/database is required to run or test the app.

### Services

- Web app (Vite dev server): `npm run dev` → serves on `http://localhost:5173` (port is `strictPort`, so it fails rather than falling back if 5173 is taken). The app loads directly into a logged-in home screen (mocked user "Luke Wagner") — there is no login flow.

### Standard commands

Commands are defined in `package.json` and documented in `README.md`:
- Lint: `npm run lint` (ESLint, `--max-warnings 0`)
- Test: `npm test -- --run` (Vitest; default `npm test` runs in watch mode)
- Build: `npm run build` (output to `dist/`)
- Dev: `npm run dev`

### Notes

- No environment variables are required for local development. `.env.example` documents optional Power Automate webhook URLs and server-side live-data sources for the `/api/company-data` Vercel Function; without them, screens use static seed data.
- The `/api/company-data` endpoint is a Vercel Function (`api/company-data.js`) that only runs under Vercel's runtime (e.g. `vercel dev`), not under plain `npm run dev`. The SPA gracefully falls back to static data when it is unavailable, so it is not needed for local development/testing.
